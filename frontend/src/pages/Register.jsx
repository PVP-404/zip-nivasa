import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUserPlus, FaSignInAlt, FaCheckCircle, FaSpinner, FaSchool, FaBriefcase, FaBuilding, FaUtensils, FaMapMarkerAlt, FaKey } from "react-icons/fa"; // Added more descriptive icons

// --- Helper Component: Custom Input Field ---
const CustomInput = ({ name, placeholder, value, onChange, type = "text", required = true, className = "", children, maxLength, minLength }) => (
    <motion.div className="relative" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} >
        <input 
            name={name} 
            placeholder={placeholder} 
            type={type} 
            value={value} 
            onChange={onChange} 
            className={`w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 ${className}`} 
            required={required} 
            maxLength={maxLength}
            minLength={minLength}
        />
        {children}
    </motion.div>
);

// --- Helper Component: Role Tab Button ---
const RoleTab = ({ roleKey, currentRole, setRole, icon: Icon, label }) => (
    <motion.button
        key={roleKey}
        onClick={() => setRole(roleKey)}
        className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-300 ease-in-out border-b-4 rounded-t-lg ${
            currentRole === roleKey
                ? "bg-white text-blue-600 border-blue-600 shadow-inner-lg shadow-blue-50/50" // Highlighting active tab
                : "bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100 hover:text-blue-500"
        }`}
        whileHover={{ scale: currentRole === roleKey ? 1.0 : 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <Icon className="text-2xl mb-1" />
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">{label}</span>
    </motion.button>
);

const Register = () => {
    // --- State declarations ---
    const [role, setRole] = useState("tenant");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countryCode, setCountryCode] = useState("+91"); // Default to India's code
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

    const validatePassword = (value) => {
        // Updated regex for 6+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]:";'<>,.?/]).{6,}$/; 
        if (!regex.test(value)) {
            setErrors(prev => ({ 
                ...prev, 
                password: "Password must contain 6+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character." 
            }));
        } else {
            setErrors(prev => ({ ...prev, password: "" }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === "password") {
            validatePassword(value);
        }

        if (name === "phone") {
            // Filter out non-digit characters and limit to 10 digits
            const phoneValue = value.replace(/\D/g, '').slice(0, 10);
            newValue = phoneValue;
            
            // Basic phone length validation for 10 digits
            if (phoneValue.length !== 10 && phoneValue.length > 0) {
                 setErrors(prev => ({ ...prev, phone: "Phone number must be 10 digits." }));
            } else {
                 setErrors(prev => ({ ...prev, phone: "" }));
            }
        }

        setFormData({ ...formData, [name]: newValue });
    };

    // ✅ API CALL
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final validation check
        if (errors.password || errors.phone || (formData.phone.length > 0 && formData.phone.length !== 10)) {
            alert("Please fix all validation issues before submitting.");
            return;
        }

        setIsLoading(true);
        
        // Prepare phone number with country code for API
        const fullPhoneNumber = countryCode + formData.phone;
        
        // Remove empty fields from formData before sending, to clean up unused role fields
        const payload = Object.keys(formData).reduce((acc, key) => {
            if (formData[key] !== "" && formData[key] !== null) {
                acc[key] = formData[key];
            }
            return acc;
        }, {});


        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    role, 
                    ...payload, 
                    phone: fullPhoneNumber // Use the combined phone number
                }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed on the server.");
            
            setIsSuccess(true);
        } catch (error) {
            alert("Registration failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- SUCCESS SCREEN (Enhanced) ---
    if (isSuccess) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-gray-800">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100 }} className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md border border-green-200" >
                    <FaCheckCircle className="text-8xl text-green-500 mx-auto mb-6 drop-shadow-lg" />
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-3">Welcome Aboard!</h2>
                    <p className="text-gray-600 text-lg">Your **{role}** account has been created successfully. Redirecting to login...</p>
                    <motion.button className="mt-10 bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300" onClick={() => (window.location.href = "/login")} whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }} whileTap={{ scale: 0.95 }} >
                        <FaSignInAlt className="inline mr-2" /> Go to Login
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // --- REGISTRATION FORM (Enhanced) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col lg:flex-row bg-white shadow-3xl rounded-3xl max-w-6xl w-full overflow-hidden border border-gray-100" >
                {/* LEFT IMAGE/MOTIVATION */}
                <div className="lg:w-2/5 relative hidden lg:block">
                    <img src="https://img.freepik.com/premium-photo/modern-students-dormitory-room-with-cozy-interior-designed-wooden-desk-chair-computer-books_1097268-24.jpg" alt="Accommodation and food services visual" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-60 flex items-center justify-center p-8">
                        <div className="text-center">
                            <h3 className="text-4xl font-extrabold text-white leading-snug mb-4 drop-shadow-md">
                                Connecting Tenants & Providers
                            </h3>
                            <p className="text-blue-100 text-lg font-light italic">
                                Find.Connect.Live Better.
                            </p>
                        </div>
                    </div>
                </div>
                {/* RIGHT FORM */}
                <div className="lg:w-3/5 p-6 sm:p-10 lg:p-12 overflow-y-auto max-h-[95vh]">
                    <div className="text-center mb-10">
                        <FaUserPlus className="text-5xl text-blue-600 mx-auto mb-2 drop-shadow-sm" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900"> Create Your Account </h2>
                        <p className="text-gray-500 mt-1">Select your role to get started.</p>
                    </div>
                    {/* ROLE TABS */}
                    <div className="flex bg-gray-50 rounded-xl shadow-inner border border-gray-100 mb-8 p-1">
                        <RoleTab roleKey="tenant" currentRole={role} setRole={setRole} icon={FaSchool} label="Tenant" />
                        <RoleTab roleKey="pgowner" currentRole={role} setRole={setRole} icon={FaBuilding} label="PG Owner" />
                        <RoleTab roleKey="messowner" currentRole={role} setRole={setRole} icon={FaUtensils} label="Mess Owner" />
                    </div>
                    {/* FORM FIELDS */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* COMMON FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                            <CustomInput type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password Field with Validation */}
                            <div>
                                <CustomInput type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} minLength={6} />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                                )}
                            </div>
                            
                            {/* Phone Number Field with Country Code Dropdown */}
                            <div>
                                <div className="flex rounded-xl shadow-sm">
                                    <select 
                                        name="countryCode" 
                                        value={countryCode} 
                                        onChange={(e) => setCountryCode(e.target.value)} 
                                        className="border border-gray-300 p-3 rounded-l-xl bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 max-w-[120px]"
                                        required
                                    >
                                        {countryCodes.map(c => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        placeholder="Phone Number (10 digits)" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        className="w-full border border-gray-300 p-3 rounded-r-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
                                        required
                                        maxLength={10}
                                        pattern="\d{10}" // Ensure 10 digits only
                                        title="Phone number must be exactly 10 digits"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* DYNAMIC SECTIONS */}
                        <motion.div key={role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            {/* TENANT SECTION */}
                            {role === "tenant" && (
                                <motion.div className="space-y-4 pt-2 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 pt-3">Tenant Details</h3>
                                    <CustomInput name="city" placeholder="Target City" value={formData.city} onChange={handleChange} required={true} />
                                    {/* Profession Type Select */}
                                    <select name="professionType" value={formData.professionType} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200" required={true} >
                                        <option value="" disabled className="text-gray-400">Select Profession Type</option>
                                        <option value="student">Student</option>
                                        <option value="job">Working Professional</option>
                                    </select>
                                    {/* Conditional Fields based on Profession */}
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
                            {/* PG OWNER */}
                            {role === "pgowner" && (
                                <motion.div className="space-y-4 pt-2 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 pt-3">PG/Hostel Details</h3>
                                    <CustomInput name="pgName" placeholder="PG/Hostel Name" value={formData.pgName} onChange={handleChange} required={true} />
                                    <CustomInput name="pgLocation" placeholder="Location/Full Address" value={formData.pgLocation} onChange={handleChange} required={true} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CustomInput name="pgCapacity" placeholder="Max Capacity (No. of beds)" value={formData.pgCapacity} onChange={handleChange} type="number" required={true} />
                                        <CustomInput name="pgFacilities" placeholder="Key Facilities (e.g., Wi-Fi, Laundry, Gym)" value={formData.pgFacilities} onChange={handleChange} required={false} />
                                    </div>
                                </motion.div>
                            )}
                            {/* MESS OWNER */}
                            {role === "messowner" && (
                                <motion.div className="space-y-4 pt-2 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 pt-3">Mess Service Details</h3>
                                    <CustomInput name="messName" placeholder="Mess Name" value={formData.messName} onChange={handleChange} required={true} />
                                    <CustomInput name="messLocation" placeholder="Location/Service Area" value={formData.messLocation} onChange={handleChange} required={true} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CustomInput name="messCapacity" placeholder="Subscription Capacity (Est.)" value={formData.messCapacity} onChange={handleChange} type="number" required={true} />
                                        <select name="messType" value={formData.messType} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200" required={true} >
                                            <option value="" disabled className="text-gray-400">Select Food Type</option>
                                            <option value="veg">Veg Only</option>
                                            <option value="nonveg">Non-Veg Only</option>
                                            <option value="both">Both Veg & Non-Veg</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* SUBMIT BUTTON */}
                        <motion.button 
                            type="submit" 
                            disabled={isLoading || !!errors.password || !!errors.phone || formData.phone.length !== 10} // Check for 10-digit phone number
                            className={`w-full py-4 text-lg font-bold rounded-xl flex justify-center gap-3 items-center transition duration-300 shadow-lg mt-8 ${
                                isLoading || errors.password || errors.phone || formData.phone.length !== 10
                                    ? "bg-blue-400 cursor-not-allowed" 
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            whileHover={!(isLoading || errors.password || errors.phone || formData.phone.length !== 10) ? { scale: 1.01, boxShadow: "0 8px 15px rgba(37, 99, 235, 0.4)" } : {}}
                            whileTap={!(isLoading || errors.password || errors.phone || formData.phone.length !== 10) ? { scale: 0.99 } : {}}
                        >
                            {isLoading ? <FaSpinner className="animate-spin text-xl" /> : <FaUserPlus className="text-xl" />}
                            {isLoading ? "Processing Registration..." : "Create Account"}
                        </motion.button>
                        <p className="text-center text-sm text-gray-500 pt-2">
                            Already have an account? 
                            <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold ml-1 transition duration-200">
                                Log In here
                            </a>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;