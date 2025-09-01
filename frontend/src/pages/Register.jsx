import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role") || "user";
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">
            Create your account
          </h2>
          <p className="text-gray-500 mt-2">
            Register as a **{roleName}** to get started.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Your Full Name"
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a strong password"
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg transform hover:scale-105"
          >
            Register
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500">
          Already have an account?{' '}
          <Link
            to={`/login?role=${role}`}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;