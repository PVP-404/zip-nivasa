import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaPhone, FaBriefcase, FaVenusMars } from "react-icons/fa";

const CompleteProfile = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [professionType, setProfessionType] = useState("student");
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(false);

  const submitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:5000/api/auth/complete-profile",
        { phone, professionType, gender },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile completed successfully!");

      navigate("/dashboard/student");
    } catch (err) {
      alert("Error completing profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex justify-center items-center p-8 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form
        onSubmit={submitProfile}
        className="bg-white shadow-lg p-6 rounded-lg w-full max-w-lg space-y-5"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Complete Your Profile
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPhone className="inline-block mr-1" />
            Phone Number
          </label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded focus:ring focus:ring-emerald-200 focus:border-emerald-300 text-gray-700"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaBriefcase className="inline-block mr-1" />
            Profession Type
          </label>
          <select
            value={professionType}
            onChange={(e) => setProfessionType(e.target.value)}
            className="w-full p-3 border rounded focus:ring focus:ring-emerald-200 focus:border-emerald-300 text-gray-700"
          >
            <option value="student">Student</option>
            <option value="job">Working Professional</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaVenusMars className="inline-block mr-1" />
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 border rounded focus:ring focus:ring-emerald-200 focus:border-emerald-300 text-gray-700"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-emerald-400"
        >
          {loading ? "Submitting..." : "Submit Profile"}
        </button>
      </form>
    </motion.div>
  );
};

export default CompleteProfile;
