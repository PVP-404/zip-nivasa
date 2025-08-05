import React from 'react';
import { motion } from 'framer-motion';

const orders = [
  { id: 1, name: "John Doe", status: "Pending", items: 5 },
  { id: 2, name: "Jane Smith", status: "In Progress", items: 8 },
  { id: 3, name: "Alex Chen", status: "Ready for Pickup", items: 3 },
];

const LaundryDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">
          Laundry Dashboard
        </h1>
        <p className="text-lg text-gray-500 text-center mb-12">
          Manage your daily orders and operations.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>
        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {orders.map((order) => (
            <motion.li
              key={order.id}
              variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
              className="p-4 bg-gray-50 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-100"
            >
              <div>
                <p className="font-semibold text-gray-800">Order from {order.name}</p>
                <p className="text-sm text-gray-500">{order.items} items</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold
                ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                ${order.status === 'Ready for Pickup' ? 'bg-green-100 text-green-800' : ''}
              `}>
                {order.status}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
};

export default LaundryDashboard;