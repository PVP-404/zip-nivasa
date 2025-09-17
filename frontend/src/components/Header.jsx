import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simulated authentication state and role
  const isLoggedIn = true; // Replace with real auth check
  const userRole = 'owner'; // 'student' | 'owner' | 'service' | null

  // Public (not logged in)
  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  // Student
  const studentNavLinks = [
    { name: 'Dashboard', path: '/student-dashboard' },
    { name: 'My Bookings', path: '/student/bookings' },
    { name: 'Payments', path: '/student/payments' },
  ];

  // PG Owner
  const ownerNavLinks = [
    { name: 'Dashboard', path: '/owner-dashboard' },
    { name: 'Payments', path: '/owner/Payments' },
    { name: 'Analytics', path: '/owner/analytics' },
  ];

  // Service Provider
  const serviceNavLinks = [
    { name: 'Dashboard', path: '/service-dashboard' },
    { name: 'My Services', path: '/service/my-services' },
    { name: 'Bookings', path: '/service/bookings' },
    { name: 'Earnings', path: '/service/earnings' },
  ];

  const getNavLinks = () => {
    if (!isLoggedIn) return publicNavLinks;
    if (userRole === 'student') return studentNavLinks;
    if (userRole === 'owner') return ownerNavLinks;
    if (userRole === 'service') return serviceNavLinks;
    return [];
  };

  return (
    <motion.header
      className="bg-white shadow-lg sticky top-0 z-50 transition-all duration-300"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="flex justify-between items-center p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <motion.h1
          className="text-2xl lg:text-3xl font-extrabold text-blue-800"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Link to="/">Zip-Nivasa</Link>
        </motion.h1>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex gap-8 items-center text-lg">
          {getNavLinks().map((link) => (
            <motion.li
              key={link.name}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={link.path}
                className={`font-medium transition duration-300 ${
                  location.pathname.includes(link.path)
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {link.name}
              </Link>
            </motion.li>
          ))}

          {/* Auth buttons / Profile */}
          {!isLoggedIn ? (
            <motion.li whileHover={{ scale: 1.05 }}>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-blue-700 transition duration-300"
              >
                Login
              </Link>
            </motion.li>
          ) : (
            <motion.li
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <FaUserCircle className="text-3xl text-gray-500 hover:text-blue-600 transition-colors duration-300" />
              {/* Dropdown */}
              <div className="hidden group-hover:block absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg py-2">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <hr className="my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                  onClick={() => console.log('Logged out')}
                >
                  Logout
                </button>
              </div>
            </motion.li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700"
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        className={`lg:hidden bg-white shadow-xl p-4 transition-all duration-300 ${
          isMenuOpen ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'
        }`}
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? 'auto' : 0,
        }}
      >
        <ul className="flex flex-col gap-4 text-center">
          {getNavLinks().map((link) => (
            <motion.li
              key={link.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(false)}
            >
              <Link
                to={link.path}
                className={`block py-2 text-lg font-medium transition duration-300 ${
                  location.pathname.includes(link.path)
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {link.name}
              </Link>
            </motion.li>
          ))}
          {!isLoggedIn ? (
            <motion.li
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(false)}
            >
              <Link
                to="/login"
                className="block py-2 text-lg bg-blue-600 text-white rounded-full font-semibold shadow-md hover:bg-blue-700"
              >
                Login
              </Link>
            </motion.li>
          ) : (
            <>
              <motion.li
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(false)}
              >
                <Link
                  to="/profile"
                  className="block py-2 text-lg text-gray-700 hover:text-blue-500"
                >
                  My Profile
                </Link>
              </motion.li>
              <motion.li
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  className="w-full text-left px-4 py-2 text-lg text-red-500 hover:text-red-700"
                  onClick={() => console.log('Logged out')}
                >
                  Logout
                </button>
              </motion.li>
            </>
          )}
        </ul>
      </motion.div>
    </motion.header>
  );
};

export default Header;
