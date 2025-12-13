import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Building2,
  UtensilsCrossed,
  GraduationCap,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Info,
  BookOpen,
  Building,
  Calendar,
  Users,
  ChefHat,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============ Constants ============
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /\d/, label: "One number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, label: "One special character" },
];

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", label: "USA" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "UK" },
  { code: "+61", country: "AU", flag: "🇦🇺", label: "Australia" },
  { code: "+971", country: "AE", flag: "🇦🇪", label: "UAE" },
];

const ROLES = [
  {
    id: "tenant",
    label: "Tenant",
    description: "Looking for PG or hostel",
    icon: GraduationCap,
    color: "emerald",
  },
  {
    id: "pgowner",
    label: "PG Owner",
    description: "List your property",
    icon: Building2,
    color: "blue",
  },
  {
    id: "messowner",
    label: "Mess Owner",
    description: "Offer food services",
    icon: UtensilsCrossed,
    color: "orange",
  },
];

const PROFESSION_TYPES = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "working", label: "Working Professional", icon: Briefcase },
];

const MESS_TYPES = [
  { value: "veg", label: "Vegetarian Only" },
  { value: "nonveg", label: "Non-Vegetarian" },
  { value: "both", label: "Both Veg & Non-Veg" },
];

// ============ Validation Helpers ============
const validators = {
  name: (value) => {
    if (!value?.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters";
    return null;
  },
  email: (value) => {
    if (!value?.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
    return null;
  },
  password: (value) => {
    if (!value) return "Password is required";
    const failedRequirements = PASSWORD_REQUIREMENTS.filter(
      (req) => !req.regex.test(value)
    );
    if (failedRequirements.length > 0) {
      return `Password needs: ${failedRequirements[0].label.toLowerCase()}`;
    }
    return null;
  },
  confirmPassword: (value, formData) => {
    if (!value) return "Please confirm your password";
    if (value !== formData.password) return "Passwords do not match";
    return null;
  },
  phone: (value) => {
    if (!value) return "Phone number is required";
    if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
    return null;
  },
  city: (value) => {
    if (!value?.trim()) return "City is required";
    return null;
  },
  professionType: (value, formData) => {
    if (formData.role === "tenant" && !value) return "Please select your profession";
    return null;
  },
  pgName: (value, formData) => {
    if (formData.role === "pgowner" && !value?.trim()) return "PG name is required";
    return null;
  },
  pgLocation: (value, formData) => {
    if (formData.role === "pgowner" && !value?.trim()) return "PG location is required";
    return null;
  },
  messName: (value, formData) => {
    if (formData.role === "messowner" && !value?.trim()) return "Mess name is required";
    return null;
  },
  messLocation: (value, formData) => {
    if (formData.role === "messowner" && !value?.trim()) return "Mess location is required";
    return null;
  },
  termsAccepted: (value) => {
    if (!value) return "You must accept the terms and conditions";
    return null;
  },
};

// ============ Custom Hooks ============
const useMultiStepForm = (steps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const back = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  return {
    currentStep,
    step: steps[currentStep],
    steps,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    next,
    back,
    goTo,
  };
};

const useFormValidation = (initialState, validatorFns) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    if (validatorFns[field]) {
      const error = validatorFns[field](values[field], values);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [values, validatorFns]);

  const validateFields = useCallback((fields) => {
    const newErrors = {};
    const newTouched = {};

    fields.forEach((field) => {
      newTouched[field] = true;
      if (validatorFns[field]) {
        const error = validatorFns[field](values[field], values);
        if (error) newErrors[field] = error;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    return Object.keys(newErrors).length === 0;
  }, [values, validatorFns]);

  const validateAll = useCallback(() => {
    const allFields = Object.keys(validatorFns);
    return validateFields(allFields);
  }, [validateFields, validatorFns]);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateFields,
    validateAll,
    reset,
    setValues,
    setErrors,
  };
};

// ============ Sub Components ============

// Input Field Component
const InputField = React.memo(({
  id,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  touched,
  icon: Icon,
  rightElement,
  disabled,
  autoComplete,
  maxLength,
  className = "",
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Icon
              className={`w-5 h-5 transition-colors ${
                hasError ? "text-red-400" : isValid ? "text-emerald-500" : "text-gray-400"
              }`}
            />
          </div>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`
            w-full py-3 px-4 ${Icon ? "pl-11" : ""} ${rightElement ? "pr-11" : ""}
            bg-white border rounded-xl
            text-gray-900 placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hasError
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : isValid
              ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              : "border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
            }
          `}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}

        {!rightElement && isValid && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-500 flex items-center gap-1.5"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

InputField.displayName = "InputField";

// Select Field Component
const SelectField = React.memo(({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  label,
  error,
  touched,
  icon: Icon,
  disabled,
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10">
            <Icon
              className={`w-5 h-5 transition-colors ${
                hasError ? "text-red-400" : isValid ? "text-emerald-500" : "text-gray-400"
              }`}
            />
          </div>
        )}

        <select
          id={id}
          name={name}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          disabled={disabled}
          className={`
            w-full py-3 px-4 ${Icon ? "pl-11" : ""} pr-10
            bg-white border rounded-xl
            text-gray-900 appearance-none
            transition-all duration-200
            focus:outline-none focus:ring-2
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${!value ? "text-gray-400" : ""}
            ${hasError
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : isValid
              ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              : "border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
            }
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-500 flex items-center gap-1.5"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

SelectField.displayName = "SelectField";

// Phone Input Component
const PhoneInput = React.memo(({
  value,
  countryCode,
  onPhoneChange,
  onCountryChange,
  onBlur,
  error,
  touched,
  disabled,
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value?.length === 10;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      
      <div className={`
        flex bg-white border rounded-xl overflow-hidden
        transition-all duration-200
        focus-within:ring-2
        ${hasError
          ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20"
          : isValid
          ? "border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-500/20"
          : "border-gray-200 hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-emerald-500/20"
        }
      `}>
        <div className="flex items-center">
          <Phone className={`w-5 h-5 ml-3.5 ${
            hasError ? "text-red-400" : isValid ? "text-emerald-500" : "text-gray-400"
          }`} />
          
          <select
            value={countryCode}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={disabled}
            className="py-3 pl-2 pr-1 bg-transparent border-0 text-gray-700 font-medium
              focus:outline-none focus:ring-0 cursor-pointer"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px bg-gray-200 my-2" />

        <input
          type="tel"
          value={value || ""}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            onPhoneChange(digits);
          }}
          onBlur={onBlur}
          placeholder="10 digit number"
          disabled={disabled}
          maxLength={10}
          className="flex-1 py-3 px-3 bg-transparent border-0
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-0"
        />

        {isValid && (
          <div className="flex items-center pr-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-500 flex items-center gap-1.5"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

// Password Strength Indicator
const PasswordStrength = React.memo(({ password }) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    const passedRequirements = PASSWORD_REQUIREMENTS.filter(
      (req) => req.regex.test(password)
    ).length;

    if (passedRequirements <= 1) return { score: 1, label: "Weak", color: "red" };
    if (passedRequirements <= 2) return { score: 2, label: "Fair", color: "orange" };
    if (passedRequirements <= 3) return { score: 3, label: "Good", color: "yellow" };
    if (passedRequirements <= 4) return { score: 4, label: "Strong", color: "emerald" };
    return { score: 5, label: "Excellent", color: "emerald" };
  }, [password]);

  if (!password) return null;

  const colorClasses = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    emerald: "bg-emerald-500",
  };

  const textColorClasses = {
    red: "text-red-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    emerald: "text-emerald-600",
  };

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i <= strength.score ? 1 : 1 }}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= strength.score ? colorClasses[strength.color] : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${textColorClasses[strength.color]}`}>
          {strength.label} password
        </p>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-2 gap-1 pt-1">
        {PASSWORD_REQUIREMENTS.map((req, i) => {
          const passed = req.regex.test(password);
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                passed ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {passed ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

PasswordStrength.displayName = "PasswordStrength";

// Role Selector Component
const RoleSelector = React.memo(({ selectedRole, onSelect }) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700">
      I want to register as
    </label>
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ROLES.map((role) => {
        const isSelected = selectedRole === role.id;
        const Icon = role.icon;
        
        return (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-xl border-2 text-left
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              ${isSelected
                ? "border-emerald-500 bg-emerald-50/50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            {/* Selection Indicator */}
            <div className={`
              absolute top-3 right-3 w-5 h-5 rounded-full border-2
              flex items-center justify-center transition-all
              ${isSelected 
                ? "border-emerald-500 bg-emerald-500" 
                : "border-gray-300"
              }
            `}>
              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
            </div>

            <Icon className={`w-8 h-8 mb-2 ${
              isSelected ? "text-emerald-600" : "text-gray-400"
            }`} />
            
            <h3 className={`font-semibold ${
              isSelected ? "text-emerald-700" : "text-gray-900"
            }`}>
              {role.label}
            </h3>
            
            <p className="text-xs text-gray-500 mt-0.5">
              {role.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  </div>
));

RoleSelector.displayName = "RoleSelector";

// Step Indicator Component
const StepIndicator = React.memo(({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-center gap-2">
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep;
      
      return (
        <React.Fragment key={step.id}>
          <button
            type="button"
            onClick={() => isCompleted && onStepClick(index)}
            disabled={!isCompleted}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full
              text-sm font-medium transition-all
              ${isActive 
                ? "bg-emerald-100 text-emerald-700" 
                : isCompleted
                ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
                : "bg-gray-100 text-gray-400"
              }
            `}
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                {index + 1}
              </span>
            )}
            <span className="hidden sm:inline">{step.title}</span>
          </button>
          
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 rounded ${
              index < currentStep ? "bg-emerald-500" : "bg-gray-200"
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
));

StepIndicator.displayName = "StepIndicator";

// Terms Checkbox Component
const TermsCheckbox = React.memo(({ checked, onChange, error, touched }) => {
  const hasError = touched && error;

  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className={`
            w-5 h-5 rounded border-2 transition-all
            flex items-center justify-center
            peer-checked:bg-emerald-500 peer-checked:border-emerald-500
            group-hover:border-emerald-400
            ${hasError ? "border-red-300" : "border-gray-300"}
          `}>
            <CheckCircle className={`w-3 h-3 text-white transition-transform ${
              checked ? "scale-100" : "scale-0"
            }`} />
          </div>
        </div>
        
        <span className="text-sm text-gray-600 leading-relaxed">
          I agree to the{" "}
          <Link to="/terms" className="text-emerald-600 hover:underline font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-emerald-600 hover:underline font-medium">
            Privacy Policy
          </Link>
        </span>
      </label>

      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-500 flex items-center gap-1.5 ml-8"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

TermsCheckbox.displayName = "TermsCheckbox";

// Alert Banner Component
const AlertBanner = React.memo(({ type, message, onDismiss }) => {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const icons = {
    error: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${styles[type]} border rounded-xl p-4 flex items-start gap-3`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:opacity-70">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
});

AlertBanner.displayName = "AlertBanner";

// Success Screen Component
const SuccessScreen = React.memo(({ role, onLogin }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.2 }}
      className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <CheckCircle className="w-10 h-10 text-emerald-500" />
    </motion.div>

    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
      Welcome to Zip Nivasa!
    </h2>
    
    <p className="text-gray-600 mb-8 max-w-md mx-auto">
      Your <span className="font-semibold text-emerald-600">{role}</span> account 
      has been created successfully. You can now sign in to access your dashboard.
    </p>

    <motion.button
      onClick={onLogin}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-2 px-8 py-3.5
        bg-emerald-600 hover:bg-emerald-700
        text-white font-semibold rounded-xl
        shadow-lg shadow-emerald-500/25
        transition-all duration-200"
    >
      Continue to Login
      <ArrowRight className="w-5 h-5" />
    </motion.button>
  </motion.div>
));

SuccessScreen.displayName = "SuccessScreen";

// ============ Main Component ============
const Register = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Form State
  const initialFormData = {
    role: "tenant",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    countryCode: "+91",
    termsAccepted: false,
    // Tenant fields
    city: "",
    professionType: "",
    collegeName: "",
    course: "",
    year: "",
    companyName: "",
    workLocation: "",
    jobRole: "",
    // PG Owner fields
    pgName: "",
    pgLocation: "",
    pgCapacity: "",
    pgFacilities: "",
    // Mess Owner fields
    messName: "",
    messLocation: "",
    messCapacity: "",
    messType: "",
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateFields,
    reset,
    setValues,
  } = useFormValidation(initialFormData, validators);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Multi-step form
  const steps = useMemo(() => {
    const baseSteps = [
      { id: "role", title: "Select Role" },
      { id: "account", title: "Account Info" },
    ];

    if (values.role === "tenant") {
      baseSteps.push({ id: "tenant", title: "Tenant Details" });
    } else if (values.role === "pgowner") {
      baseSteps.push({ id: "pgowner", title: "PG Details" });
    } else if (values.role === "messowner") {
      baseSteps.push({ id: "messowner", title: "Mess Details" });
    }

    baseSteps.push({ id: "review", title: "Review" });

    return baseSteps;
  }, [values.role]);

  const {
    currentStep,
    isFirstStep,
    isLastStep,
    next,
    back,
    goTo,
  } = useMultiStepForm(steps);

  // Get fields to validate for current step
  const getStepFields = useCallback((stepId) => {
    switch (stepId) {
      case "account":
        return ["name", "email", "password", "confirmPassword", "phone"];
      case "tenant":
        return ["city", "professionType"];
      case "pgowner":
        return ["pgName", "pgLocation"];
      case "messowner":
        return ["messName", "messLocation"];
      case "review":
        return ["termsAccepted"];
      default:
        return [];
    }
  }, []);

  // Handle next step
  const handleNext = useCallback(() => {
    const currentStepId = steps[currentStep]?.id;
    const fieldsToValidate = getStepFields(currentStepId);
    
    if (validateFields(fieldsToValidate)) {
      next();
      // Scroll to top of form
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentStep, steps, getStepFields, validateFields, next]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!values.termsAccepted) {
      handleBlur("termsAccepted");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      // Prepare payload
      const payload = {
        role: values.role,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone: values.countryCode + values.phone,
      };

      // Add role-specific fields
      if (values.role === "tenant") {
        payload.city = values.city;
        payload.professionType = values.professionType;
        
        if (values.professionType === "student") {
          if (values.collegeName) payload.collegeName = values.collegeName;
          if (values.course) payload.course = values.course;
          if (values.year) payload.year = values.year;
        } else if (values.professionType === "working") {
          if (values.companyName) payload.companyName = values.companyName;
          if (values.workLocation) payload.workLocation = values.workLocation;
          if (values.jobRole) payload.jobRole = values.jobRole;
        }
      } else if (values.role === "pgowner") {
        payload.pgName = values.pgName;
        payload.pgLocation = values.pgLocation;
        if (values.pgCapacity) payload.pgCapacity = values.pgCapacity;
        if (values.pgFacilities) payload.pgFacilities = values.pgFacilities;
      } else if (values.role === "messowner") {
        payload.messName = values.messName;
        payload.messLocation = values.messLocation;
        if (values.messCapacity) payload.messCapacity = values.messCapacity;
        if (values.messType) payload.messType = values.messType;
      }

      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      setServerError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [values, handleBlur]);

  // Handle role change
  const handleRoleChange = useCallback((role) => {
    setValues((prev) => ({ ...prev, role }));
  }, [setValues]);

  // Handle login navigation
  const handleLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // Render success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <SuccessScreen role={values.role} onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto" ref={formRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Zip Nivasa</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">
            Join thousands of users finding their perfect stay
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={goTo}
          />
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Error Alert */}
          <AnimatePresence>
            {serverError && (
              <div className="p-4 border-b border-gray-100">
                <AlertBanner
                  type="error"
                  message={serverError}
                  onDismiss={() => setServerError("")}
                />
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Role Selection */}
              {steps[currentStep]?.id === "role" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <RoleSelector
                    selectedRole={values.role}
                    onSelect={handleRoleChange}
                  />
                </motion.div>
              )}

              {/* Step 2: Account Info */}
              {steps[currentStep]?.id === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <InputField
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Pratik Ghule"
                    label="Full Name"
                    error={errors.name}
                    touched={touched.name}
                    icon={User}
                    autoComplete="name"
                  />

                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="pratik@example.com"
                    label="Email Address"
                    error={errors.email}
                    touched={touched.email}
                    icon={Mail}
                    autoComplete="email"
                  />

                  <div className="space-y-1.5">
                    <InputField
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Create a strong password"
                      label="Password"
                      error={errors.password}
                      touched={touched.password}
                      icon={Lock}
                      autoComplete="new-password"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                    />
                    <PasswordStrength password={values.password} />
                  </div>

                  <InputField
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    label="Confirm Password"
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    icon={Lock}
                    autoComplete="new-password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                  />

                  <PhoneInput
                    value={values.phone}
                    countryCode={values.countryCode}
                    onPhoneChange={(value) => handleChange("phone", value)}
                    onCountryChange={(value) => handleChange("countryCode", value)}
                    onBlur={() => handleBlur("phone")}
                    error={errors.phone}
                    touched={touched.phone}
                  />
                </motion.div>
              )}

              {/* Step 3: Tenant Details */}
              {steps[currentStep]?.id === "tenant" && (
                <motion.div
                  key="tenant"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Tenant Details</h3>
                      <p className="text-sm text-gray-500">Tell us about yourself</p>
                    </div>
                  </div>

                  <InputField
                    id="city"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Pune, Mumbai"
                    label="Preferred City"
                    error={errors.city}
                    touched={touched.city}
                    icon={MapPin}
                  />

                  <SelectField
                    id="professionType"
                    name="professionType"
                    value={values.professionType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Select your profession"
                    label="Profession Type"
                    options={PROFESSION_TYPES}
                    error={errors.professionType}
                    touched={touched.professionType}
                    icon={Briefcase}
                  />

                  <AnimatePresence mode="wait">
                    {values.professionType === "student" && (
                      <motion.div
                        key="student"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t border-gray-100"
                      >
                        <InputField
                          id="collegeName"
                          name="collegeName"
                          value={values.collegeName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g., DYP Akurdi"
                          label="College/University (Optional)"
                          error={errors.collegeName}
                          touched={touched.collegeName}
                          icon={BookOpen}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            id="course"
                            name="course"
                            value={values.course}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., MCA"
                            label="Course (Optional)"
                            error={errors.course}
                            touched={touched.course}
                          />

                          <InputField
                            id="year"
                            name="year"
                            type="number"
                            value={values.year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., 2"
                            label="Year (Optional)"
                            error={errors.year}
                            touched={touched.year}
                            icon={Calendar}
                          />
                        </div>
                      </motion.div>
                    )}

                    {values.professionType === "working" && (
                      <motion.div
                        key="working"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t border-gray-100"
                      >
                        <InputField
                          id="companyName"
                          name="companyName"
                          value={values.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g., Google"
                          label="Company Name (Optional)"
                          error={errors.companyName}
                          touched={touched.companyName}
                          icon={Building}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            id="workLocation"
                            name="workLocation"
                            value={values.workLocation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., Pune"
                            label="Work Location (Optional)"
                            error={errors.workLocation}
                            touched={touched.workLocation}
                            icon={MapPin}
                          />

                          <InputField
                            id="jobRole"
                            name="jobRole"
                            value={values.jobRole}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., Software Engineer"
                            label="Job Role (Optional)"
                            error={errors.jobRole}
                            touched={touched.jobRole}
                            icon={Briefcase}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Step 3: PG Owner Details */}
              {steps[currentStep]?.id === "pgowner" && (
                <motion.div
                  key="pgowner"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">PG Details</h3>
                      <p className="text-sm text-gray-500">Tell us about your property</p>
                    </div>
                  </div>

                  <InputField
                    id="pgName"
                    name="pgName"
                    value={values.pgName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Sunshine PG for Girls"
                    label="PG Name"
                    error={errors.pgName}
                    touched={touched.pgName}
                    icon={Building2}
                  />

                  <InputField
                    id="pgLocation"
                    name="pgLocation"
                    value={values.pgLocation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Akurdi, Pune"
                    label="PG Location"
                    error={errors.pgLocation}
                    touched={touched.pgLocation}
                    icon={MapPin}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="pgCapacity"
                      name="pgCapacity"
                      type="number"
                      value={values.pgCapacity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 50"
                      label="Total Capacity (Optional)"
                      error={errors.pgCapacity}
                      touched={touched.pgCapacity}
                      icon={Users}
                    />

                    <InputField
                      id="pgFacilities"
                      name="pgFacilities"
                      value={values.pgFacilities}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., WiFi, AC, Food"
                      label="Key Facilities (Optional)"
                      error={errors.pgFacilities}
                      touched={touched.pgFacilities}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Mess Owner Details */}
              {steps[currentStep]?.id === "messowner" && (
                <motion.div
                  key="messowner"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ChefHat className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Mess Details</h3>
                      <p className="text-sm text-gray-500">Tell us about your mess service</p>
                    </div>
                  </div>

                  <InputField
                    id="messName"
                    name="messName"
                    value={values.messName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Home Kitchen Mess"
                    label="Mess Name"
                    error={errors.messName}
                    touched={touched.messName}
                    icon={UtensilsCrossed}
                  />

                  <InputField
                    id="messLocation"
                    name="messLocation"
                    value={values.messLocation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Akurdi, Pune"
                    label="Mess Location"
                    error={errors.messLocation}
                    touched={touched.messLocation}
                    icon={MapPin}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="messCapacity"
                      name="messCapacity"
                      type="number"
                      value={values.messCapacity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 100"
                      label="Daily Capacity (Optional)"
                      error={errors.messCapacity}
                      touched={touched.messCapacity}
                      icon={Users}
                    />

                    <SelectField
                      id="messType"
                      name="messType"
                      value={values.messType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Select type"
                      label="Food Type (Optional)"
                      options={MESS_TYPES}
                      error={errors.messType}
                      touched={touched.messType}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {steps[currentStep]?.id === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Review & Submit</h3>
                      <p className="text-sm text-gray-500">Please verify your information</p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Account Type</p>
                        <p className="font-medium text-gray-900 capitalize">{values.role}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{values.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{values.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {values.countryCode} {values.phone}
                        </p>
                      </div>
                    </div>

                    {/* Role-specific summary */}
                    {values.role === "tenant" && values.city && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Preferred City</p>
                            <p className="font-medium text-gray-900">{values.city}</p>
                          </div>
                          {values.professionType && (
                            <div>
                              <p className="text-gray-500">Profession</p>
                              <p className="font-medium text-gray-900 capitalize">
                                {values.professionType}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {values.role === "pgowner" && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">PG Name</p>
                            <p className="font-medium text-gray-900">{values.pgName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">{values.pgLocation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {values.role === "messowner" && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Mess Name</p>
                            <p className="font-medium text-gray-900">{values.messName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">{values.messLocation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <TermsCheckbox
                    checked={values.termsAccepted}
                    onChange={(checked) => handleChange("termsAccepted", checked)}
                    error={errors.termsAccepted}
                    touched={touched.termsAccepted}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={back}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5
                    text-gray-600 hover:text-gray-900 font-medium
                    hover:bg-gray-100 rounded-xl
                    transition-all duration-200
                    disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <button
                  type="submit"
                  disabled={loading || !values.termsAccepted}
                  className="flex items-center gap-2 px-8 py-3
                    bg-emerald-600 hover:bg-emerald-700
                    text-white font-semibold rounded-xl
                    shadow-lg shadow-emerald-500/25
                    hover:shadow-xl
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3
                    bg-emerald-600 hover:bg-emerald-700
                    text-white font-semibold rounded-xl
                    shadow-lg shadow-emerald-500/25
                    transition-all duration-200"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Sign In Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-600 mt-8"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Sign in
          </Link>
        </motion.p>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6"
        >
          <Shield className="w-4 h-4" />
          <span>Your data is protected with 256-bit SSL encryption</span>
        </motion.div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(Register);