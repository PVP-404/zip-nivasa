import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const cards = [
  {
    title: "Find a PG / Hostel",
    description: "Search for the perfect accommodation that fits your needs.",
    icon: "🏠",
    path: "/services/pg",
  },
  {
    title: "Order Laundry Services",
    description: "Connect with local laundry services for hassle-free washing.",
    icon: "🧺",
    path: "/services/laundry",
  },
  {
    title: "Find Mess Services",
    description: "Discover tiffin and meal services near your location.",
    icon: "🍽️",
    path: "/services/mess",
  },
  {
    title: "Book a Service Provider",
    description: "Find plumbers, electricians, and other service providers.",
    icon: "🔧",
    path: "/services/providers",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
      damping: 12,
    },
  },
};

const StudentDashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow px-4 py-10">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
            Hello, <span className="text-blue-600">Student Name</span>!
          </h1>
          <p className="text-lg text-gray-600 text-center mb-10">
            Your one-stop dashboard for all your needs.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <div className="text-5xl mb-4">{card.icon}</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h2>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{card.description}</p>
              <Link
                to={card.path}
                className="mt-auto py-2 px-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Service
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
