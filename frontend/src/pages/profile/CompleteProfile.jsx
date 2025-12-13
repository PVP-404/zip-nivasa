import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPhone, FaUserTag, FaVenusMars, FaArrowRight } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ROLE_DASHBOARD = {
  student: "/dashboard/student",
  pgowner: "/dashboard/pgowner",
  messowner: "/dashboard/messowner",
  // laundry: "/dashboard/laundry",
};

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student");
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);

  // Real-time phone validation (subtle)
  useEffect(() => {
    const valid = /^\d{10}$/.test(phone);
    setPhoneValid(valid);
  }, [phone]);

  const submitProfile = async (e) => {
    e.preventDefault();

    if (!phoneValid) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/api/auth/complete-profile`,
        { phone, role, gender },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("role", role);
      navigate(ROLE_DASHBOARD[role], { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Profile completion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-8 space-y-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="text-center space-y-2 pb-6 border-b border-emerald-100">
          <h1 className="text-2xl font-semibold text-emerald-800">
            Complete Profile
          </h1>
          <p className="text-sm text-emerald-600">Just 3 quick details to get started</p>
        </div>

        <form onSubmit={submitProfile} className="space-y-6">
          {/* Phone */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-emerald-700 space-x-2">
              <FaPhone className="w-4 h-4" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98XXXXXXXX"
              maxLength={10}
              className={`w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all duration-200 text-sm ${
                phoneValid
                  ? 'border-emerald-300 bg-emerald-50'
                  : phone.length > 0
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            />
            {phone.length > 0 && (
              <p className={`text-xs ${
                phoneValid ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {phoneValid ? 'Valid number' : 'Enter 10-digit number'}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-emerald-700 space-x-2">
              <FaUserTag className="w-4 h-4" />
              <span>You are a</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all duration-200 text-sm"
            >
              <option value="student">Student / Tenant</option>
              <option value="pgowner">PG Owner</option>
              <option value="messowner">Mess Owner</option>
              {/* <option value="laundry">Laundry Partner</option> */}
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-emerald-700 space-x-2">
              <FaVenusMars className="w-4 h-4" />
              <span>Gender</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all duration-200 text-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!phoneValid || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-md hover:shadow-lg"
            whileHover={{ scale: phoneValid && !loading ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{loading ? "Saving..." : "Continue to Dashboard"}</span>
            <FaArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-emerald-500/70 pt-4">
          Secure • Fast • One-time setup
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CompleteProfile;
