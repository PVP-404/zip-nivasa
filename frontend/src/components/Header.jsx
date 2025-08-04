import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '#services' },
  { name: 'Contact', path: '#contact' },
];

const Header = () => {
  const location = useLocation();

  return (
    <motion.header
      className="bg-white shadow-md sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
        <motion.h1
          className="text-2xl font-extrabold text-indigo-600"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link to="/">Zip-Nivasa</Link>
        </motion.h1>

        <ul className="flex gap-6 items-center text-md">
          {navLinks.map((link, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <a
                href={link.path}
                className={`hover:text-indigo-600 transition duration-300 ${
                  location.pathname === link.path ? 'font-semibold text-indigo-700' : ''
                }`}
              >
                {link.name}
              </a>
            </motion.li>
          ))}

          <motion.li whileHover={{ scale: 1.05 }}>
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 shadow-md transition duration-300"
            >
              Login
            </Link>
          </motion.li>
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
