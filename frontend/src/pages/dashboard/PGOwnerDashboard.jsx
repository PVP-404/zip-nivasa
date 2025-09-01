import React from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Mock data for the chart
const paymentData = {
  labels: ['Paid', 'Pending'],
  datasets: [{
    data: [22, 3], // Total tenants - pending payments, and pending payments
    backgroundColor: ['#10b981', '#f59e0b'],
    borderColor: ['#047857', '#d97706'],
    borderWidth: 1,
  }],
};

const stats = [
  { title: "Total Tenants", value: 25, icon: "👤", color: "bg-blue-100 text-blue-800" },
  { title: "Available Beds", value: 5, icon: "🛏️", color: "bg-green-100 text-green-800" },
  { title: "Pending Payments", value: 3, icon: "💰", color: "bg-yellow-100 text-yellow-800" },
  { title: "Service Requests", value: 2, icon: "🛠️", color: "bg-red-100 text-red-800" },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const PGOwnerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-10 md:mb-16">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Hello, Alex! 👋
            </h1>
            <p className="text-lg text-gray-500 mt-2">
              Welcome back. Here's a quick overview of your properties.
            </p>
          </div>
          <button className="hidden md:block bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">
            Add New Tenant
          </button>
        </div>
      </motion.div>

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
            className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${stat.color} transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.color.split(' ')[0]}`}>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <p className="text-xl font-medium text-gray-500">{stat.title}</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">{stat.value}</h2>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-10 md:mt-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
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

        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Status</h2>
          <div className="w-48 h-48 mb-6">
            <Doughnut data={paymentData} />
          </div>
          <div className="flex space-x-4">
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

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-8">
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
    </div>
  );
};
 
export default PGOwnerDashboard;