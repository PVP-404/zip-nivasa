import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const roles = [
  {
    role: "Student & Migrant",
    description: "Find your ideal PG, hostel, and essential services with ease.",
    path: "/login?role=student",
    image: "https://images.pexels.com/photos/733856/pexels-photo-733856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    size: "large",
  },
  {
    role: "PG Owner",
    description: "Effortlessly manage your property and connect with tenants.",
    path: "/login?role=pgowner",
    image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    role: "Laundry Owner",
    description: "Expand your business and simplify operations with our platform.",
    path: "/login?role=laundry",
    image: "https://images.pexels.com/photos/2254065/pexels-photo-2254065.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    role: "Mess Owner",
    description: "Effortlessly manage your Mess and provide your service.",
    path: "/login?role=service",
    image: "https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Zip-Nivasa
        </Link>
        <div className="space-x-6">
          <Link
            to="/about-us"
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            About Us
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full">
          <motion.div
            className="text-center mb-16"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900">
              Welcome to <span className="text-blue-600">Zip-Nivasa</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Your one-stop solution for finding and offering essential services.
            </p>
            <p className="mt-8 text-2xl font-semibold text-gray-800">I am a...</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {roles.map((r, i) => (
              <motion.div
                key={i}
                className={`${r.size === "large" ? "lg:col-span-1 bg-blue-50 border-blue-200 shadow-2xl" : "bg-white border-gray-200 shadow-md"} rounded-3xl border overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out`}
                variants={cardVariants}
              >
                <Link to={r.path} className="block group h-full">
                  <div className={`${r.size === "large" ? "h-64" : "h-48"} overflow-hidden relative`}>
                    <img
                      src={r.image}
                      alt={r.role}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
                  </div>
                  <div className="p-6 text-center flex flex-col justify-between h-[calc(100%-12rem)]">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-800 mb-2">{r.role}</h2>
                      <p className="text-gray-600 text-sm mb-4">{r.description}</p>
                    </div>
                    <motion.span
                      className="inline-block px-6 py-2 mt-4 text-md font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
