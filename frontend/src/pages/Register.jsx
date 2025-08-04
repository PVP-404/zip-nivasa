import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeInOut" },
  },
};

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-white to-indigo-200 flex items-center justify-center p-4">
      <motion.div
        className="bg-white/30 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Create Account 🎉</h2>

        <form className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-700 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
