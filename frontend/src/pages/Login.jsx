import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const roleImages = {
  student: 'https://images.pexels.com/photos/3807750/pexels-photo-3807750.jpeg',
  pgowner: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg',
  messowner: 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg',
  laundry: 'https://images.pexels.com/photos/3616760/pexels-photo-3616760.jpeg',
  service: 'https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg',
};

// Common login banner image
const loginBanner = "https://cdn-icons-png.flaticon.com/512/5087/5087579.png";

const Login = () => {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role") || "student";

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Navigate based on role
    switch (role.toLowerCase()) {
      case 'student':
        navigate('/dashboard/student');
        break;
      case 'pgowner':
        navigate('/dashboard/pgowner');
        break;
      case 'messowner':
        navigate('/dashboard/messowner');
        break;
      case 'laundry':
        navigate('/dashboard/laundry');
        break;
      case 'service':
        navigate('/dashboard/service');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50">
      
      {/* Left Image Section */}
      <div className="hidden md:block md:w-1/2 h-screen relative">
        <img
          src={roleImages[role.toLowerCase()] || roleImages['student']}
          alt="User Login"
          className="w-full h-full object-cover rounded-l-3xl"
        />
        <div className="absolute inset-0 bg-sky-700 bg-opacity-30 flex items-center justify-center">
          <img
            src={loginBanner}
            alt="Login Banner"
            className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* Right Login Form Section */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">Login</h2>
          <p className="text-gray-500 text-center mb-8">
            Please enter your details to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                placeholder="********"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-sky-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-sky-600 hover:underline">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            New to Zip-Nivasa?{' '}
            <Link to={`/register?role=${role}`} className="text-sky-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
