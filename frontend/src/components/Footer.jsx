import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <motion.footer
      className="bg-gradient-to-r from-emerald-900/90 to-slate-900/95 text-emerald-200/80 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-500/20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Content Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Brand Section */}
          <motion.div 
            className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-4 col-span-1 sm:col-span-2 lg:col-span-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-100 mb-2 sm:mb-3 tracking-tight">
              Zip-Nivasa
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-emerald-300/90 max-w-xs leading-relaxed px-2 sm:px-0">
              Find. Connect. Live Better.
            </p>
            
            {/* Social Links - Responsive */}
            <div className="flex space-x-2 sm:space-x-4 pt-2 sm:pt-3 w-full justify-center sm:justify-start">
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 sm:p-2.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-300 transition-all duration-200 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaLinkedin className="text-lg sm:text-xl" />
              </motion.a>
              
              <motion.a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 sm:p-2.5 rounded-lg hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-200 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaFacebook className="text-lg sm:text-xl" />
              </motion.a>
              
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 sm:p-2.5 rounded-lg hover:bg-pink-500/10 hover:text-pink-300 transition-all duration-200 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaInstagram className="text-lg sm:text-xl" />
              </motion.a>
              
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 sm:p-2.5 rounded-lg hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-200 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaTwitter className="text-lg sm:text-xl" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="text-center sm:text-left space-y-3 sm:space-y-4 col-span-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-100 mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/about" className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 block py-1">About Us</Link></li>
              <li><Link to="/" className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 block py-1">All Listings</Link></li>
              <li><Link to="/" className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 block py-1">Dashboard</Link></li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div 
            className="text-center sm:text-left space-y-3 sm:space-y-4 col-span-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-100 mb-3 sm:mb-4">
              Legal
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/" className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 block py-1">Privacy Policy</Link></li>
              <li><Link to="/" className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 block py-1">Terms of Service</Link></li>
              <li><Link to="/" className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 block py-1">Disclaimer</Link></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div 
            className="text-center sm:text-left space-y-3 sm:space-y-4 col-span-1 lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-100 mb-3 sm:mb-4">
              Contact
            </h4>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-start space-x-2 sm:space-x-3 py-1">
                <FaEnvelope className="text-emerald-400 mt-1 flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-emerald-300 leading-tight">contact@zipnivasa.com</span>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 py-1">
                <FaPhone className="text-emerald-400 mt-1 flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-emerald-300 leading-tight">+91 88569 85713</span>
              </div>
              <div className="space-y-1">
                <p className="flex items-start space-x-2 sm:space-x-3">
                  <FaMapMarkerAlt className="text-emerald-400 mt-1 flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-emerald-300 leading-tight">Gurudwara Chowk</span>
                </p>
                <p className="text-emerald-400 text-xs ml-7 sm:ml-9 leading-tight">Pune, Maharashtra, India</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar - Fully Responsive */}
        <div className="border-t border-emerald-500/20 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left text-xs sm:text-sm">
            <motion.p 
              className="text-emerald-400/80 order-2 sm:order-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              © {new Date().getFullYear()} Zip-Nivasa. All rights reserved.
            </motion.p>
            
            <motion.p
              className="text-emerald-500/90 font-medium order-1 sm:order-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Developed by Pratik Ghule
            </motion.p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
