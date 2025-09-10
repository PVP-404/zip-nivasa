import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

// Doughnut chart data
const paymentData = {
  labels: ['Paid', 'Pending'],
  datasets: [{
    data: [22, 3],
    backgroundColor: ['#10b981', '#f59e0b'],
    borderColor: ['#047857', '#d97706'],
    borderWidth: 1,
  }],
};

// Stats cards
const stats = [
  { title: "Total Tenants", value: 25, icon: "👤", color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800" },
  { title: "Available Beds", value: 5, icon: "🛏️", color: "bg-gradient-to-r from-green-100 to-green-200 text-green-800" },
  { title: "Pending Payments", value: 3, icon: "💰", color: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800" },
  { title: "Service Requests", value: 2, icon: "🛠️", color: "bg-gradient-to-r from-red-100 to-red-200 text-red-800" },
];

// Framer Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const PGOwnerDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar role="pgowner" />

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-6 md:p-10">
          {/* Welcome & Action Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-10 flex-col md:flex-row gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                Hello, Alex! 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Welcome back! Here's a quick overview of your properties.
              </p>
            </div>
            <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
              Add New Tenant
            </button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl p-6 shadow-md border-l-4 hover:-translate-y-2 hover:shadow-xl transform transition-all ${stat.color}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${stat.color.split(' ')[0]}`}>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                  <p className="text-lg font-medium text-gray-700">{stat.title}</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{stat.value}</h2>
              </motion.div>
            ))}
          </motion.div>

          {/* Properties & Payment Status */}
          <div className="mt-10 md:mt-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Properties */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
                <button className="text-indigo-600 font-semibold text-sm hover:underline">
                  View All
                </button>
              </div>
              <ul className="space-y-4">
                <li className="flex justify-between items-center p-4 bg-gray-100 rounded-lg transition duration-200 hover:bg-gray-200 cursor-pointer">
                  <span className="font-semibold text-gray-800">Sunrise PG - 101, Main Street</span>
                  <span className="text-sm text-gray-500">8/10 Beds Occupied</span>
                </li>
                <li className="flex justify-between items-center p-4 bg-gray-100 rounded-lg transition duration-200 hover:bg-gray-200 cursor-pointer">
                  <span className="font-semibold text-gray-800">Sunset Hostel - 204, Park Avenue</span>
                  <span className="text-sm text-gray-500">12/15 Beds Occupied</span>
                </li>
              </ul>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Status</h2>
              <div className="w-48 h-48 mb-6">
                <Doughnut data={paymentData} />
              </div>
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Paid</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-8 mt-6 lg:mt-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <ul className="space-y-4 text-gray-600 text-sm">
                <li className="flex items-center p-3 rounded-lg bg-gray-100 transition duration-200 hover:bg-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                  <span><strong className="font-semibold">New Tenant Added:</strong> A new tenant was added to Sunrise PG.</span>
                </li>
                <li className="flex items-center p-3 rounded-lg bg-gray-100 transition duration-200 hover:bg-gray-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                  <span><strong className="font-semibold">Payment Received:</strong> Payment received from Jane Doe for July rent.</span>
                </li>
                <li className="flex items-center p-3 rounded-lg bg-gray-100 transition duration-200 hover:bg-gray-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-4"></div>
                  <span><strong className="font-semibold">Service Request:</strong> Maintenance request from John Smith for a leaky faucet.</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PGOwnerDashboard;
