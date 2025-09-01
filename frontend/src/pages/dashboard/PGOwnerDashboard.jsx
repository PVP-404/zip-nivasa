import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { title: "Total Tenants", value: 25, icon: "👤" },
  { title: "Available Beds", value: 5, icon: "🛏️" },
  { title: "Pending Payments", value: 3, icon: "💰" },
  { title: "Service Requests", value: 2, icon: "🛠️" },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const PGOwnerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">
          PG Owner Dashboard
        </h1>
        <p className="text-lg text-gray-500 text-center mb-12">
          Manage your properties and tenants efficiently.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.15 } }
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">{stat.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h2>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Properties</h2>
          <ul className="space-y-4">
            <li className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <span>Sunrise PG - 101, Main Street</span>
              <span className="text-blue-600 font-semibold">View Details</span>
            </li>
            <li className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <span>Sunset Hostel - 204, Park Avenue</span>
              <span className="text-blue-600 font-semibold">View Details</span>
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <ul className="space-y-4 text-gray-600">
            <li>New tenant added to Sunrise PG.</li>
            <li>Payment received from Jane Doe.</li>
            <li>Maintenance request from John Smith.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PGOwnerDashboard;