// src/pages/Home.jsx
import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaBuilding,
  FaCheckCircle,
  FaComments,
  FaFilter,
  FaArrowRight,
} from "react-icons/fa";

// 🔹 Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80 },
  },
};

const Home = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    type: "",
    budget: "",
  });

  const handleSearchChange = (e) => {
    setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

const handleSearchSubmit = (e) => {
  e.preventDefault();
  const { location, type, budget } = searchFilters;

  // If user selects "mess"
  if (type === "mess") {
    navigate(`/messes?location=${location}`);
    return;
  }

  // For accommodations (PG / Hostel / Flat)
  navigate(
    `/accommodations?location=${location}&type=${type}&budget=${budget}`
  );
};


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-gray-100 font-sans text-gray-800">
      {/* 🔹 Header */}
      <header className="backdrop-blur-lg bg-white/70 shadow-md py-3 px-4 md:px-8 sticky top-0 z-50 transition">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-xl md:text-2xl font-extrabold text-blue-600 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <FaBuilding className="text-2xl md:text-3xl" />
            Zip-Nivasa
          </Link>
          <nav className="hidden md:flex space-x-6">
            {["accommodations", "messes"].map((link, i) => (
              <Link
                key={i}
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {link === "accommodations" ? "Find Accommodations" : "Find Mess"}
              </Link>
            ))}
            {/* 🔹 Navbar Login goes to Login page for student */}
            <Link
              to="/login?role=student"
              className="bg-blue-600 text-white font-medium py-2 px-4 md:px-6 rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* 🔹 Hero */}
      <motion.section
        className="relative h-[80vh] md:h-screen flex items-center justify-center text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1950&q=80')",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div className="relative z-10 p-4 sm:p-6 max-w-2xl md:max-w-4xl mx-auto">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Find Your Perfect Stay & Meal
          </motion.h1>
          <motion.p
            className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 font-dark"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find. Connect. Live Better.
          </motion.p>

          {/* Search Box */}
          <motion.form
            onSubmit={handleSearchSubmit}
            className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {["location", "type", "budget"].map((field, i) => (
              <div key={i} className="w-full">
                <label
                  htmlFor={field}
                  className="block text-left text-sm font-semibold text-gray-700 mb-1"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                {field === "location" ? (
                  <input
                    type="text"
                    id={field}
                    name={field}
                    placeholder="City, Locality"
                    value={searchFilters[field]}
                    onChange={handleSearchChange}
                    className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                ) : (
                  <select
                    id={field}
                    name={field}
                    value={searchFilters[field]}
                    onChange={handleSearchChange}
                    className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {field === "type" ? (
                      <>
                        <option value="">All Types</option>
                        <option value="pg">PG</option>
                        <option value="hostel">Hostel</option>
                        <option value="flat">Flat</option>
                        <option value="mess">Mess</option>
                      </>
                    ) : (
                      <>
                        <option value="">Any Budget</option>
                        <option value="0-5000">₹0 - ₹5,000</option>
                        <option value="5001-10000">₹5,001 - ₹10,000</option>
                        <option value="10001+">₹10,001+</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full md:w-auto mt-2 md:mt-0 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
            >
              <FaSearch className="inline-block mr-2" /> Search
            </button>
          </motion.form>
        </div>
      </motion.section>

      {/* 🔹 Why Choose Us */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-blue-50">
        <motion.div
          className="container mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10 sm:mb-16"
            variants={itemVariants}
          >
            Why Choose Zip-Nivasa?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
            {[
              {
                icon: <FaCheckCircle />,
                title: "Verified Listings",
                desc: "Every property & mess is verified for safety & trust.",
              },
              {
                icon: <FaFilter />,
                title: "Smart Filters",
                desc: "Find exactly what you need with advanced search tools.",
              },
              {
                icon: <FaComments />,
                title: "Direct Chat",
                desc: "Talk directly with providers before booking.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-6 sm:p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition flex flex-col items-center text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-blue-600 text-3xl sm:text-4xl mb-3 sm:mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 🔹 CTA */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <motion.div
          className="container mx-auto px-4 sm:px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Are You a Provider?
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg opacity-90">
            List your PG, flat, or mess service & connect with thousands.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-10">
            {[
              { label: "List a PG / Home", to: "/login?role=pgowner" },
              { label: "List a Mess Service", to: "/login?role=pgowner" },
            ].map((btn, i) => (
              <Link key={i} to={btn.to} className="w-full sm:w-auto">
                <motion.button
                  className="w-full sm:w-auto bg-white text-blue-600 font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {btn.label} <FaArrowRight />
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <FaBuilding className="text-2xl sm:text-3xl text-blue-400" />
              Zip-Nivasa
            </h3>
            <p className="mt-2 text-gray-400 text-xs sm:text-sm">
              Simplifying life for students and migrants.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {["about", "contact", "terms"].map((l, i) => (
                <li key={i}>
                  <Link
                    to={`/${l}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Contact
            </h4>
            <p className="text-xs sm:text-sm text-gray-400">
              📍 Pune, Maharashtra
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              📧 info@zipnivasa.com
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Follow Us
            </h4>
            <div className="flex space-x-3 sm:space-x-4">
              {["#", "#", "#"].map((l, i) => (
                <a
                  key={i}
                  href={l}
                  className="text-lg sm:text-xl hover:text-blue-400 transition-colors"
                >
                  <FaBuilding />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-3 sm:pt-4 text-center text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} Zip-Nivasa. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
