import React from 'react';
import { motion } from 'framer-motion';

const jobRequests = [
  { id: 1, title: "Leaky Faucet Repair", client: "Jane Doe", location: "Park Avenue", status: "New" },
  { id: 2, title: "Wall Painting", client: "John Smith", location: "Main Street", status: "Scheduled" },
];

const ServiceDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">
          Service Provider Dashboard
        </h1>
        <p className="text-lg text-gray-500 text-center mb-12">
          Manage your job requests and schedule.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">New Job Requests</h2>
          <motion.ul
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {jobRequests.filter(j => j.status === 'New').map((job) => (
              <motion.li
                key={job.id}
                variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{job.title}</p>
                  <p className="text-sm text-gray-500">Client: {job.client}</p>
                </div>
                <button className="py-1 px-4 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Schedule</h2>
          <motion.ul
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {jobRequests.filter(j => j.status === 'Scheduled').map((job) => (
              <motion.li
                key={job.id}
                variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-500">Scheduled with {job.client}</p>
                <p className="text-sm text-gray-500">Location: {job.location}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;