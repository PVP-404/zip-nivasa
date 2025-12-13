import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  ArrowRight,
  Shield,
  RefreshCw,
} from "lucide-react";
import { requestFCMToken, registerTokenWithBackend } from "../services/fcm";
import {
  initializeGoogleLogin,
  renderGoogleButton,
  handleGoogleResponse,
} from "../services/googleAuth";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============ Constants ============
const RATE_LIMIT_DURATION = 30000; // 30 seconds
const MAX_LOGIN_ATTEMPTS = 5;
const PASSWORD_MIN_LENGTH = 6;

// ============ Validation Helpers ============
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
};

// ============ Custom Hooks ============
const useFormValidation = (initialState) => {
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
    
    // Validate on blur
    let error = null;
    if (field === "email") {
      error = validateEmail(values.email);
    } else if (field === "password") {
      error = validatePassword(values.password);
    }
    
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [values]);

  const validateAll = useCallback(() => {
    const newErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };
    
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    
    return !Object.values(newErrors).some(Boolean);
  }, [values]);

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
    validateAll,
    reset,
    setErrors,
  };
};

const useRateLimiter = () => {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check localStorage for existing lockout
    const storedLockout = localStorage.getItem("loginLockout");
    if (storedLockout) {
      const { until, count } = JSON.parse(storedLockout);
      const remaining = until - Date.now();
      
      if (remaining > 0) {
        setIsLocked(true);
        setAttempts(count);
        setLockoutTime(Math.ceil(remaining / 1000));
        
        timerRef.current = setInterval(() => {
          setLockoutTime((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsLocked(false);
              localStorage.removeItem("loginLockout");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        localStorage.removeItem("loginLockout");
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const recordAttempt = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + RATE_LIMIT_DURATION;
      localStorage.setItem(
        "loginLockout",
        JSON.stringify({ until: lockUntil, count: newAttempts })
      );
      setIsLocked(true);
      setLockoutTime(Math.ceil(RATE_LIMIT_DURATION / 1000));

      timerRef.current = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsLocked(false);
            setAttempts(0);
            localStorage.removeItem("loginLockout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [attempts]);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    localStorage.removeItem("loginLockout");
  }, []);

  return { isLocked, lockoutTime, recordAttempt, resetAttempts, attempts };
};

// ============ Sub Components ============
const InputField = React.memo(({
  id,
  name,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  icon: Icon,
  rightElement,
  autoComplete,
  disabled,
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Left Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon
            className={`w-5 h-5 transition-colors duration-200 ${
              hasError
                ? "text-red-400"
                : isValid
                ? "text-emerald-500"
                : "text-gray-400"
            }`}
          />
        </div>

        {/* Input */}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`
            block w-full pl-10 pr-12 py-3.5 
            text-gray-900 placeholder-gray-400 
            bg-white border rounded-xl
            transition-all duration-200
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : isValid
                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-gray-300"
            }
          `}
        />

        {/* Right Element (password toggle, validation icon) */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightElement}
          {!rightElement && isValid && (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          )}
          {!rightElement && hasError && (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500 flex items-center gap-1 pl-1"
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

InputField.displayName = "InputField";

const AlertBanner = React.memo(({ type, message, onDismiss }) => {
  const styles = {
    error: {
      bg: "bg-red-50 border-red-200",
      icon: "text-red-500",
      text: "text-red-700",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      icon: "text-amber-500",
      text: "text-amber-700",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200",
      icon: "text-emerald-500",
      text: "text-emerald-700",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: "text-blue-500",
      text: "text-blue-700",
    },
  };

  const style = styles[type] || styles.info;
  const Icon = type === "error" ? XCircle : type === "success" ? CheckCircle : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`${style.bg} border rounded-xl p-4 flex items-start gap-3`}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${style.text} flex-1`}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${style.text} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
});

AlertBanner.displayName = "AlertBanner";

const SocialButton = React.memo(({ onClick, icon: Icon, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 px-4 py-3
      bg-white border border-gray-200 rounded-xl
      text-gray-700 font-medium text-sm
      hover:bg-gray-50 hover:border-gray-300
      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200"
  >
    {Icon && <Icon className="w-5 h-5" />}
    {children}
  </button>
));

SocialButton.displayName = "SocialButton";

const PasswordStrength = React.memo(({ password }) => {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, text: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { level: 3, text: "Good", color: "bg-emerald-400" };
    return { level: 4, text: "Strong", color: "bg-emerald-600" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength.level ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength.level <= 1 ? "text-red-500" :
        strength.level <= 2 ? "text-amber-500" : "text-emerald-500"
      }`}>
        {strength.text} password
      </p>
    </div>
  );
});

PasswordStrength.displayName = "PasswordStrength";

const RememberMe = React.memo(({ checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-5 h-5 border-2 border-gray-300 rounded-md 
        peer-checked:border-emerald-500 peer-checked:bg-emerald-500
        group-hover:border-gray-400 peer-checked:group-hover:border-emerald-600
        transition-all duration-200">
        <CheckCircle className="w-full h-full text-white scale-0 peer-checked:scale-100 transition-transform" />
      </div>
    </div>
    <span className="text-sm text-gray-600 select-none">Remember me</span>
  </label>
));

RememberMe.displayName = "RememberMe";

// ============ Main Component ============
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const emailInputRef = useRef(null);

  // Form State
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setErrors,
  } = useFormValidation({ email: "", password: "" });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Rate Limiting
  const { isLocked, lockoutTime, recordAttempt, resetAttempts } = useRateLimiter();

  // Redirect path from protected route
  const redirectPath = useMemo(
    () => location.state?.from || null,
    [location.state]
  );

  // Check for remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      handleChange("email", rememberedEmail);
      setRememberMe(true);
    }

    // Focus email input
    emailInputRef.current?.focus();
  }, []);

  // Initialize Google Login
  useEffect(() => {
    let mounted = true;

    const initGoogle = async () => {
      try {
        initializeGoogleLogin(async (response) => {
          if (!mounted) return;

          setGoogleLoading(true);
          setServerError("");

          try {
            const user = await handleGoogleResponse(response);

            if (!user.profileCompleted) {
              navigate("/complete-profile");
              return;
            }

            setSuccessMessage("Login successful! Redirecting...");
            
            setTimeout(() => {
              if (redirectPath) {
                navigate(redirectPath, { replace: true });
              } else {
                navigate(getDashboardPath(user.role));
              }
            }, 1000);
          } catch (err) {
            setServerError(err.message || "Google login failed. Please try again.");
          } finally {
            if (mounted) setGoogleLoading(false);
          }
        });

        renderGoogleButton("google-login-btn");
      } catch (err) {
        console.error("Google initialization failed:", err);
      }
    };

    initGoogle();

    return () => {
      mounted = false;
    };
  }, [navigate, redirectPath]);

  // Get dashboard path based on role
  const getDashboardPath = useCallback((role) => {
    const paths = {
      pgowner: "/dashboard/pgowner",
      messowner: "/dashboard/messowner",
      laundry: "/dashboard/laundry",
      tenant: "/dashboard/student",
      student: "/dashboard/student",
    };
    return paths[role] || "/dashboard";
  }, []);

  // Handle form submission
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();

    // Clear previous messages
    setServerError("");
    setSuccessMessage("");

    // Check rate limiting
    if (isLocked) {
      setServerError(`Too many attempts. Please wait ${lockoutTime} seconds.`);
      return;
    }

    // Validate form
    if (!validateAll()) {
      // Focus first error field
      const firstError = Object.keys(errors).find((key) => errors[key]);
      if (firstError) {
        document.getElementById(firstError)?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      // Clear any existing auth data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("fcmToken");

      const response = await axios.post(
        `${API}/api/auth/login`,
        {
          email: values.email.trim().toLowerCase(),
          password: values.password,
        },
        {
          timeout: 15000, // 15 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.name);
      localStorage.setItem("userId", user.id);

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Reset rate limiter on success
      resetAttempts();

      // Setup FCM (non-blocking)
      setupFCM();

      setSuccessMessage("Login successful! Redirecting...");

      // Navigate after short delay for UX
      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else {
          navigate(getDashboardPath(user.role), { replace: true });
        }
      }, 1000);

    } catch (err) {
      recordAttempt();

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please check your connection.";
      } else if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        switch (status) {
          case 400:
            errorMessage = serverMessage || "Invalid email or password format.";
            break;
          case 401:
            errorMessage = "Invalid email or password.";
            break;
          case 403:
            errorMessage = "Account is locked. Please contact support.";
            break;
          case 404:
            errorMessage = "No account found with this email.";
            break;
          case 429:
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = serverMessage || errorMessage;
        }
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      setServerError(errorMessage);

      // Focus email input for retry
      emailInputRef.current?.focus();

    } finally {
      setLoading(false);
    }
  }, [
    values,
    validateAll,
    errors,
    isLocked,
    lockoutTime,
    recordAttempt,
    resetAttempts,
    rememberMe,
    redirectPath,
    navigate,
    getDashboardPath,
  ]);

  // Setup FCM token (non-blocking)
  const setupFCM = useCallback(async () => {
    try {
      const browserToken = await requestFCMToken();
      if (browserToken) {
        localStorage.setItem("fcmToken", browserToken);
        await registerTokenWithBackend(browserToken);
      }
    } catch (err) {
      console.warn("FCM setup failed:", err);
      // Non-critical, don't show error to user
    }
  }, []);

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    navigate("/forgot-password", {
      state: { email: values.email },
    });
  }, [navigate, values.email]);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-gray-50">
      {/* Left Side - Form */}
      <motion.div
        className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Zip Nivasa</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to continue to your dashboard
            </p>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {serverError && (
              <AlertBanner
                key="error"
                type="error"
                message={serverError}
                onDismiss={() => setServerError("")}
              />
            )}
            {successMessage && (
              <AlertBanner
                key="success"
                type="success"
                message={successMessage}
              />
            )}
            {isLocked && (
              <AlertBanner
                key="locked"
                type="warning"
                message={`Too many failed attempts. Please wait ${lockoutTime} seconds before trying again.`}
              />
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            ref={formRef}
            onSubmit={handleLogin}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            noValidate
          >
            {/* Email Input */}
            <div ref={emailInputRef}>
              <InputField
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Email address"
                error={errors.email}
                touched={touched.email}
                icon={Mail}
                autoComplete="email"
                disabled={loading || isLocked}
              />
            </div>

            {/* Password Input */}
            <InputField
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
              error={errors.password}
              touched={touched.password}
              icon={Lock}
              autoComplete="current-password"
              disabled={loading || isLocked}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <RememberMe checked={rememberMe} onChange={setRememberMe} />
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 
                  focus:outline-none focus:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLocked || googleLoading}
              className="relative w-full flex items-center justify-center gap-2 
                py-3.5 px-4
                bg-gradient-to-r from-emerald-500 to-teal-600 
                hover:from-emerald-600 hover:to-teal-700
                text-white font-semibold rounded-xl
                shadow-lg shadow-emerald-500/25
                hover:shadow-xl hover:shadow-emerald-500/30
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                transition-all duration-200
                group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : isLocked ? (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Wait {lockoutTime}s</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Google Button Container */}
            <div
              id="google-login-btn"
              className={`flex justify-center transition-opacity ${
                googleLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            />

            {/* Phone OTP Button */}
            <SocialButton
              onClick={() => navigate("/login-phone")}
              icon={Phone}
              disabled={loading || googleLoading}
            >
              Sign in with Phone OTP
            </SocialButton>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            className="text-center text-sm text-gray-600 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 
                hover:underline focus:outline-none focus:underline transition-colors"
            >
              Sign up for free
            </Link>
          </motion.p>

          {/* Security Badge */}
          <motion.div
            className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="w-4 h-4" />
            <span>Secured with 256-bit SSL encryption</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Image */}
      <motion.div
        className="hidden lg:block relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <img
          src="/login-bg.jpg"
          alt="Modern living space"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Find Your Perfect Stay
            </h2>
            <p className="text-emerald-100 text-lg max-w-md">
              Connect with verified PGs, hostels, and mess services near you. 
              Your comfortable living space is just a click away.
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 right-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20" />
        </div>
      </motion.div>

      {/* Global Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        /* Custom checkbox styles */
        input[type="checkbox"]:checked + div svg {
          transform: scale(1);
        }

        /* Focus visible for better keyboard navigation */
        button:focus-visible,
        input:focus-visible,
        a:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }

        /* Improve Google button appearance */
        #google-login-btn > div {
          width: 100% !important;
        }

        #google-login-btn iframe {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default React.memo(Login);