import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaCheckCircle, FaSpinner, FaSchool, FaBuilding, FaUtensils, FaMapMarkerAlt, FaKey, FaExclamationCircle } from "react-icons/fa"; 

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


const CustomInput = ({ name, placeholder, value, onChange, type = "text", required = true, className = "", children, maxLength, minLength }) => (
    <motion.div className="relative" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <input 
            name={name} 
            placeholder={placeholder} 
            type={type} 
            value={value || ''} 
            onChange={onChange} 
            className={`w-full border border-slate-300 p-3 rounded-lg shadow-sm bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 placeholder-slate-400 text-slate-900 ${className}`} 
            required={required} 
            maxLength={maxLength}
            minLength={minLength}
        />
        {children}
    </motion.div>
);

const RoleTab = ({ roleKey, currentRole, setRole, icon: Icon, label }) => (
    <motion.button
        key={roleKey}
        onClick={() => setRole(roleKey)}
        className={`flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300 border rounded-lg shadow-sm ${
            currentRole === roleKey
                ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-inner"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800"
        }`}
        whileHover={{ scale: currentRole === roleKey ? 1.0 : 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
    >
        <Icon className={`text-xl mb-2 ${currentRole === roleKey ? 'drop-shadow-lg' : ''}`} />
        <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
    </motion.button>
);

const Register = () => {
    const [role, setRole] = useState("tenant");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countryCode, setCountryCode] = useState("+91"); 
    const [errors, setErrors] = useState({ 
        password: "", 
        phone: "" 
    });
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        professionType: "",
        collegeName: "",
        course: "",
        year: "",
        city: "",
        companyName: "",
        workLocation: "",
        jobRole: "",
        pgName: "",
        pgLocation: "",
        pgCapacity: "",
        pgFacilities: "",
        messName: "",
        messLocation: "",
        messCapacity: "",
        messType: "",
    });

    const countryCodes = [
        { code: "+91", label: "🇮🇳 +91 (India)" },
        { code: "+1", label: "🇺🇸 +1 (USA/Can)" },
        { code: "+44", label: "🇬🇧 +44 (UK)" },
        { code: "+61", label: "🇦🇺 +61 (Aus)" },
    ];

    const validatePassword = useCallback((value) => {
        if (!value) return;
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]:";'<>,.?/]).{6,}$/; 
        if (!regex.test(value)) {
            setErrors(prev => ({ 
                ...prev, 
                password: "Password must contain 6+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character." 
            }));
        } else {
            setErrors(prev => ({ ...prev, password: "" }));
        }
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === "password") {
            validatePassword(value);
        }

        if (name === "phone") {
            const phoneValue = value.replace(/\D/g, '').slice(0, 10);
            newValue = phoneValue;
            
            if (phoneValue.length !== 10 && phoneValue.length > 0) {
                setErrors(prev => ({ ...prev, phone: "Phone number must be 10 digits." }));
            } else {
                setErrors(prev => ({ ...prev, phone: "" }));
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    }, [validatePassword]);

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        
        if (errors.password || errors.phone || (formData.phone.length > 0 && formData.phone.length !== 10)) {
            alert("Please fix all validation issues before submitting.");
            return;
        }

        setIsLoading(true);
        
        try {
            const fullPhoneNumber = countryCode + formData.phone;
            const payload = Object.keys(formData).reduce((acc, key) => {
                if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
                    acc[key] = formData[key];
                }
                return acc;
            }, {});

            const res = await fetch(`${API}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    role, 
                    ...payload, 
                    phone: fullPhoneNumber 
                }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed on the server.");
            
            setIsSuccess(true);
        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }, [formData, countryCode, role, errors.password, errors.phone]);

    if (isSuccess) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-25 to-mint-50 p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ type: "spring", stiffness: 100 }} 
                    className="text-center bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-xl max-w-md border border-emerald-50 w-full mx-4"
                >
                    <FaCheckCircle className="text-7xl text-emerald-500 mx-auto mb-6 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome Aboard!</h2>
                    <p className="text-slate-600 text-lg font-medium leading-relaxed">Your <strong>{role}</strong> account has been created successfully. Redirecting to login...</p>
                    <motion.button 
                        className="mt-8 bg-emerald-600 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all duration-300 border border-emerald-500/20" 
                        onClick={() => window.location.href = "/login"} 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaSignInAlt className="inline mr-2" /> Go to Login
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-25 to-mint-50 flex justify-center items-center p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }} 
                className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl border border-emerald-100/50 overflow-hidden"
            >
                <div className="p-8 sm:p-10 text-center border-b border-emerald-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <FaUserPlus className="text-2xl text-white drop-shadow-lg" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Create Account</h2>
                    <p className="text-slate-500 text-lg font-medium">Select your role to get started with Zip Nivasa</p>
                </div>

                <div className="p-8 sm:p-10 border-b border-emerald-100">
                    <div className="bg-emerald-50/50 rounded-xl border border-emerald-100/50 p-2 mb-8">
                        <div className="flex bg-gradient-to-r from-emerald-50 to-mint-50 rounded-xl p-1">
                            <RoleTab roleKey="tenant" currentRole={role} setRole={setRole} icon={FaSchool} label="Tenant" />
                            <RoleTab roleKey="pgowner" currentRole={role} setRole={setRole} icon={FaBuilding} label="PG Owner" />
                            <RoleTab roleKey="messowner" currentRole={role} setRole={setRole} icon={FaUtensils} label="Mess Owner" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} />
                            <CustomInput type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <CustomInput type="password" name="password" placeholder="Create Password *" value={formData.password} onChange={handleChange} minLength={6} />
                                {errors.password && (
                                    <p className="text-red-600 text-xs mt-2 font-medium flex items-start gap-1.5 bg-red-50/80 px-3 py-1.5 rounded-lg border border-red-200">
                                        <FaExclamationCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> <span>{errors.password}</span>
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <div className="flex bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                                    <select 
                                        name="countryCode" 
                                        value={countryCode} 
                                        onChange={(e) => setCountryCode(e.target.value)} 
                                        className="border-0 p-4 bg-transparent text-slate-700 font-semibold rounded-none focus:ring-0 max-w-[130px]"
                                    >
                                        {countryCodes.map(c => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </select>
                                    <div className="w-px bg-slate-300 my-2"></div>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        placeholder="10 digit phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        className="flex-1 border-0 p-3 bg-transparent text-slate-900 placeholder-slate-400 font-semibold focus:ring-0"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-600 text-xs mt-2 font-medium flex items-center gap-1.5 bg-red-50/80 px-3 py-1.5 rounded-lg border border-red-200">
                                        <FaExclamationCircle className="w-3 h-3" /> {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <motion.div key={role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            {role === "tenant" && (
                                <motion.div className="space-y-6 pt-6 border-t border-emerald-100/50">
                                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <FaSchool className="text-emerald-500" /> Tenant Details
                                    </h3>
                                    <CustomInput name="city" placeholder="Target City *" value={formData.city} onChange={handleChange} />
                                    <select name="professionType" value={formData.professionType} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-lg bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-slate-900" required={true}>
                                        <option value="" disabled>Select Profession Type</option>
                                        <option value="student">Student</option>
                                        <option value="job">Working Professional</option>
                                    </select>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {formData.professionType === "student" && (
                                            <>
                                                <CustomInput name="collegeName" placeholder="College Name" value={formData.collegeName} onChange={handleChange} />
                                                <CustomInput name="course" placeholder="Course/Degree" value={formData.course} onChange={handleChange} />
                                                <CustomInput name="year" placeholder="Year of Study" value={formData.year} onChange={handleChange} type="number" />
                                            </>
                                        )}
                                        {formData.professionType === "job" && (
                                            <>
                                                <CustomInput name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} />
                                                <CustomInput name="workLocation" placeholder="Work Location" value={formData.workLocation} onChange={handleChange} />
                                                <CustomInput name="jobRole" placeholder="Job Role" value={formData.jobRole} onChange={handleChange} />
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.button 
                            type="submit" 
                            disabled={isLoading || !!errors.password || !!errors.phone || formData.phone.length !== 10} 
                            className={`group relative w-full py-3 text-base font-bold rounded-xl flex justify-center gap-3 items-center transition-all duration-300 shadow-lg mt-8 border overflow-hidden ${
                                isLoading || errors.password || errors.phone || formData.phone.length !== 10
                                    ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed" 
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-200/50 hover:shadow-lg hover:shadow-emerald-300/50"
                            }`}
                            whileHover={!(isLoading || errors.password || errors.phone || formData.phone.length !== 10) ? { 
                                scale: 1.02, 
                            } : {}}
                            whileTap={!(isLoading || errors.password || errors.phone || formData.phone.length !== 10) ? { scale: 0.98 } : {}}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                                {isLoading ? "Processing..." : "Create Account"}
                            </span>
                            <div className={`absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out ${isLoading || errors.password || errors.phone || formData.phone.length !== 10 ? 'hidden' : ''}`} />
                        </motion.button>
                        
                        <p className="text-center text-sm text-slate-500 pt-4">
                            Already have an account? 
                            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold ml-1 transition-all duration-200 hover:underline font-medium">
                                Log In here
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
