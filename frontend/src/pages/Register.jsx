import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role") || "user";
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    // Gradient Background
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4 font-sans">
      <motion.div
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 transform hover:shadow-3xl transition-all duration-300 relative overflow-hidden"
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-48 h-48 bg-indigo-200 rounded-full opacity-20 filter blur-xl"></div>
        <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-48 h-48 bg-purple-200 rounded-full opacity-20 filter blur-xl"></div>

        <div className="text-center mb-8 relative z-10">
          {/* Logo or Icon Placeholder */}
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 1.657-1.5 3-3 3s-3-1.343-3-3m5 0c0 1.657 1.5 3 3 3s3-1.343 3-3m-6 0h-2m8 0h-2m-3-4a6 6 0 00-6 6v7h12v-7a6 6 0 00-6-6z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Join Our Community
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Register as a <strong className="text-indigo-600">{roleName}</strong> and unlock your potential.
          </p>
        </div>

        <form className="space-y-6 relative z-10">
          {/* Conditional rendering for the new field */}
          {role === 'messowner' && (
            <div>
              <label htmlFor="messName" className="block text-sm font-semibold text-gray-700 mb-1">
                Mess Name
              </label>
              <input
                type="text"
                id="messName"
                placeholder="Enter your mess name"
                className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                aria-label="Mess Name"
              />
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Your Full Name"
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
              aria-label="Full Name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
              aria-label="Email Address"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a strong password"
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
              aria-label="Password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
              aria-label="Confirm Password"
            />
          </div>
          <motion.button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-102 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Register Now
          </motion.button>
        </form>

        <p className="mt-8 text-center text-gray-500 relative z-10">
          Already have an account?{' '}
          <Link
            to={`/login?role=${role}`}
            className="text-indigo-600 font-bold hover:underline hover:text-indigo-700 transition-colors duration-200"
          >
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;