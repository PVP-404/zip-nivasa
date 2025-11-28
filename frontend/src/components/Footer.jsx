import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // ✅ Added import

const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-900 text-gray-300 py-16 px-4 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-3xl font-extrabold text-white mb-2">
            Zip-Nivasa
          </h3>
          <p className="text-sm font-light text-gray-400 max-w-xs mb-4">
            Simplifying property management and student living with smart, digital solutions.
          </p>
          <div className="flex space-x-4 text-white">
            <motion.a 
              href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
              whileHover={{ scale: 1.2, color: "#0077B5" }} 
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FaLinkedin className="text-2xl" />
            </motion.a>
            <motion.a 
              href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
              whileHover={{ scale: 1.2, color: "#1877F2" }} 
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FaFacebook className="text-2xl" />
            </motion.a>
            <motion.a 
              href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
              whileHover={{ scale: 1.2, color: "#E4405F" }} 
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FaInstagram className="text-2xl" />
            </motion.a>
            <motion.a 
              href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
              whileHover={{ scale: 1.2, color: "#1DA1F2" }} 
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FaTwitter className="text-2xl" />
            </motion.a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h4 className="text-xl font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
           
          </ul>
        </div>

        {/* Legal */}
        <div className="text-center md:text-left">
          <h4 className="text-xl font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white transition-colors duration-200">Disclaimer</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="text-center md:text-left">
          <h4 className="text-xl font-semibold text-white mb-4">Contact</h4>
          <p className="text-sm mb-2">Email: contact@zipnivasa.com</p>
          <p className="text-sm">Phone: +91 8856985713</p>
          <p className="text-sm mt-4 text-gray-400">
            Gurudwara Chowk, <br />
            Pune, Maharashtra, India
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
        <p className="text-sm">
          © {new Date().getFullYear()} Zip-Nivasa. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
