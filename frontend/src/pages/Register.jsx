import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUserPlus, FaSignInAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

const Register = () => {
  const [role, setRole] = useState("tenant");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    collegeName: "",
    course: "",
    year: "",
    city: "",
    pgName: "",
    pgLocation: "",
    pgCapacity: "",
    pgFacilities: "",
    messName: "",
    messLocation: "",
    messCapacity: "",
    messType: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Register Data:", { role, ...formData });
      setIsSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6 text-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-gray-200"
        >
          <FaCheckCircle className="text-8xl text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Registration Successful! 🎉</h2>
          <p className="text-gray-600">
            Welcome to Zip Nivasa. You can now log in to your account.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-blue-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-blue-600 transition-all duration-300"
            onClick={() => window.location.reload()}
          >
            Go to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full"
      >
        {/* Left Side: Image Section */}
        <div className="lg:w-1/2 relative">
          <img
            src="https://img.freepik.com/free-vector/student-dormitory-concept-illustration_114360-12745.jpg"
            alt="Zip Nivasa Registration"
            className="w-full h-80 lg:h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-100 bg-opacity-40 flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-2xl font-bold text-blue-700 mb-3">Your Journey Starts Here!</h3>
            <p className="text-gray-700 max-w-sm">
              Join our community to find the best PGs, Mess services, or grow your business with Zip Nivasa.
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:w-1/2 p-10 bg-gray-50">
          <div className="text-center mb-8">
            <FaUserPlus className="text-5xl text-blue-500 mx-auto mb-3" />
            <h2 className="text-3xl font-extrabold text-gray-800 mb-1">
              Create Your Account
            </h2>
            <p className="text-gray-600 text-sm">
              Register as Tenant, PG Owner, or Mess Owner.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="mb-6 flex bg-gray-200 rounded-xl overflow-hidden border border-gray-300">
            {["tenant", "pgowner", "messowner"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-all duration-300 ${
                  role === r
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-300"
                }`}
              >
                {r === "tenant" ? "Tenant" : r === "pgowner" ? "PG Owner" : "Mess Owner"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Common */}
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            {/* Tenant */}
            {role === "tenant" && (
              <div className="space-y-3">
                <motion.input
                  type="text"
                  name="collegeName"
                  placeholder="College Name"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <motion.input
                  type="text"
                  name="course"
                  placeholder="Course (e.g. BSc CS)"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <motion.input
                  type="text"
                  name="year"
                  placeholder="Year (e.g. 2nd Year)"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <motion.input
                  type="text"
                  name="city"
                  placeholder="City of Stay"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* PG Owner */}
            {role === "pgowner" && (
              <div className="space-y-3">
                <motion.input
                  type="text"
                  name="pgName"
                  placeholder="PG Name"
                  value={formData.pgName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <motion.input
                  type="text"
                  name="pgLocation"
                  placeholder="PG Location"
                  value={formData.pgLocation}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <motion.input
                  type="number"
                  name="pgCapacity"
                  placeholder="Total Beds"
                  value={formData.pgCapacity}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <motion.input
                  type="text"
                  name="pgFacilities"
                  placeholder="Facilities (WiFi, Laundry...)"
                  value={formData.pgFacilities}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Mess Owner */}
            {role === "messowner" && (
              <div className="space-y-3">
                <motion.input
                  type="text"
                  name="messName"
                  placeholder="Mess Name"
                  value={formData.messName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <motion.input
                  type="text"
                  name="messLocation"
                  placeholder="Mess Location"
                  value={formData.messLocation}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <motion.input
                  type="number"
                  name="messCapacity"
                  placeholder="Capacity (e.g. 50)"
                  value={formData.messCapacity}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                  name="messType"
                  value={formData.messType}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Food Type</option>
                  <option value="veg">Veg</option>
                  <option value="nonveg">Non-Veg</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2
                ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Create Account
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
