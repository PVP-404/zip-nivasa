import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { RiBuilding2Fill } from "react-icons/ri";

// 🔹 Roles data - Centralized for easy management
const roles = [
  {
    role: "Student & Migrant",
    description: "Find your ideal PG, hostel, and essential services with ease.",
    path: "/login?role=student",
    image:
      "https://images.pexels.com/photos/733856/pexels-photo-733856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    role: "PG Owner",
    description: "Effortlessly manage your property and connect with tenants.",
    path: "/login?role=pgowner",
    image:
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    role: "Laundry Owner",
    description: "Expand your business and simplify operations with our platform.",
    path: "/login?role=laundry",
    image:
      "https://images.pexels.com/photos/2254065/pexels-photo-2254065.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    role: "Service Provider",
    description:
      "Offer your skills (e.g., electrician, plumber) to a wider community.",
    path: "/login?role=service",
    image:
      "https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

// 🔹 Framer Motion Variants for smooth animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* 🔹 Header Section */}
      <header className="bg-white shadow-md py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold text-blue-600 flex items-center gap-2">
            <RiBuilding2Fill className="text-3xl" />
            Zip-Nivasa
          </Link>
          <nav className="space-x-6 hidden sm:block">
            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              About Us
            </a>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              to="/help"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Help
            </Link>
          </nav>
        </div>
      </header>

      {/* 🔹 Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section with Roles */}
        <section className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-7xl w-full">
            <motion.div
              className="text-center mb-16"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Welcome to <span className="text-blue-600">Zip-Nivasa</span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto font-light">
                Your one-stop platform for finding and offering accommodation, laundry, and other essential services.
              </p>
              <h2 className="mt-12 text-2xl font-bold text-gray-800 tracking-wide">
                I am a...
              </h2>
            </motion.div>

            {/* Roles Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {roles.map((r, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl"
                  variants={cardVariants}
                >
                  <Link to={r.path} className="block group h-full">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={r.image}
                        alt={r.role}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
                    </div>
                    <div className="p-6 text-center flex flex-col justify-between h-[calc(100%-12rem)]">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">
                          {r.role}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {r.description}
                        </p>
                      </div>
                      <motion.span
                        className="inline-block px-6 py-3 mt-4 text-md font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Get started as a ${r.role}`}
                      >
                        Get Started
                      </motion.span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- */}

        {/* 🔹 About Us Section */}
        <section id="about" className="bg-gray-100 py-20 px-6 sm:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
                About <span className="text-blue-600">Zip-Nivasa</span>
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Zip-Nivasa is designed to simplify urban living by connecting
                students, migrants, and professionals with PGs, hostels, laundry
                services, and essential service providers all in one platform.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to build a trusted ecosystem that fosters
                convenience, affordability, and accessibility for everyone in
                need of accommodation and essential services.
              </p>
              <Link
                to="/about-us"
                className="inline-block px-6 py-3 text-md font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:translate-y-[-2px]"
              >
                Learn More
              </Link>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <img
                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="About Us"
                className="rounded-2xl shadow-lg border border-gray-200"
              />
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- */}

      {/* 🔹 Footer Section */}
      <footer className="bg-gray-900 text-gray-300 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <RiBuilding2Fill className="text-3xl text-blue-400" />
              Zip-Nivasa
            </h3>
            <p className="mt-2 text-gray-400 text-sm">
              Simplifying life for students, migrants, and service providers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors duration-200">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-blue-400 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <p className="text-sm text-gray-400">📍 Pune, Maharashtra</p>
            <p className="text-sm text-gray-400">📧 support@zipnivasa.com</p>
            <p className="text-sm text-gray-400">📞 +91 9876543210</p>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-xl hover:text-blue-400 transition-colors duration-200">
                <FaFacebookF />
              </a>
              <a href="#" className="text-xl hover:text-blue-400 transition-colors duration-200">
                <FaTwitter />
              </a>
              <a href="#" className="text-xl hover:text-blue-400 transition-colors duration-200">
                <FaInstagram />
              </a>
              <a href="#" className="text-xl hover:text-blue-400 transition-colors duration-200">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Zip-Nivasa. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;