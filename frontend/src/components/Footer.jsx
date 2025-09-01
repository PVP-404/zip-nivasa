import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      id="contact"
      className="bg-indigo-600 text-white text-center py-6 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="text-lg font-medium tracking-wide"
      >
        © 2025 <span className="text-yellow-300">Zip-Nivasa</span>. Built to ease your move.
      </motion.div>

      <p className="text-sm mt-2 text-indigo-200">
        All-in-one platform for students and migrants — PG, Mess, Laundry & More.
      </p>
    </motion.footer>
  );
};

export default Footer;
