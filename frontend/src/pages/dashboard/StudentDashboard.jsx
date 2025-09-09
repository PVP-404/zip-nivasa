import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaUtensils, FaHome, FaHistory, FaPhoneAlt } from 'react-icons/fa'; // Importing icons from react-icons

// Mock data to simulate real-time API calls
const mockMessData = {
  currentSubscription: {
    messName: 'Daily Delights Mess',
    plan: 'Monthly (Lunch & Dinner)',
    status: 'Active',
    nextRenewal: '2025-10-05',
  },
  todaysMenu: {
    breakfast: 'Poha, Jalebi, Tea',
    lunch: 'Dal Makhani, Jeera Rice, Chapati, Salad',
    dinner: 'Shahi Paneer, Naan, Gulab Jamun',
  },
  featuredMesses: [
    { name: 'Healthy Bites Mess', rating: 4.8, price: 2500, distance: '1.2 km' },
    { name: 'Home Taste Tiffins', rating: 4.5, price: 2800, distance: '0.5 km' },
  ],
};

const widgetVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring' } },
};

const StudentDashboard = () => {
  // State to hold dynamic data
  const [messMenu, setMessMenu] = useState(null);

  useEffect(() => {
    // Simulate fetching real-time data
    setTimeout(() => {
      setMessMenu(mockMessData.todaysMenu);
    }, 1000); // A small delay to simulate network latency
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Welcome to <span className="text-blue-600">Zip Nivasa</span>!
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Your home away from home.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Widget Area */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* My Mess Widget - Real-time information */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                variants={widgetVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaUtensils className="mr-3 text-green-600" /> My Mess Subscription
                  </h2>
                  <Link to="/services/mess" className="text-sm font-medium text-blue-600 hover:underline">
                    Manage
                  </Link>
                </div>
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-lg mb-2">Today's Menu</h3>
                  {messMenu ? (
                    <ul className="text-sm space-y-1">
                      <li><span className="font-bold">Breakfast:</span> {messMenu.breakfast}</li>
                      <li><span className="font-bold">Lunch:</span> {messMenu.lunch}</li>
                      <li><span className="font-bold">Dinner:</span> {messMenu.dinner}</li>
                    </ul>
                  ) : (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Status: <span className="text-green-600 font-semibold">{mockMessData.currentSubscription.status}</span></p>
                  <p>Next Renewal: {mockMessData.currentSubscription.nextRenewal}</p>
                </div>
              </motion.div>

              {/* Find a PG Widget */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                variants={widgetVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaHome className="mr-3 text-purple-600" /> Find a Home
                  </h2>
                  <Link to="/services/pg" className="text-sm font-medium text-blue-600 hover:underline">
                    Search PGs
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Explore new PGs and apartments near you.
                </p>
                <button className="w-full py-3 px-4 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors">
                  Start Your Search
                </button>
              </motion.div>

              {/* Service Cards (mini-widgets) */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
                variants={widgetVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <FaUtensils className="text-5xl text-blue-500 mb-4" />
                <h2 className="text-lg font-semibold text-gray-800 mb-2">My Service History</h2>
                <p className="text-sm text-gray-500 mb-4">View your past orders and payments.</p>
                <Link to="/services/history" className="mt-auto py-2 px-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
                  View History
                </Link>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
                variants={widgetVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <FaPhoneAlt className="text-5xl text-orange-500 mb-4" />
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Support</h2>
                <p className="text-sm text-gray-500 mb-4">Get in touch with our support team.</p>
                <Link to="/contact" className="mt-auto py-2 px-4 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors">
                  Get Help
                </Link>
              </motion.div>
            </div>

            {/* Right Sidebar for Alerts and Recommendations */}
            <motion.div
              className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit"
              variants={widgetVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Alerts & Recommendations</h2>
              <div className="space-y-4">
                {/* Dynamic alert example */}
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p className="font-bold">Rent Reminder!</p>
                  <p className="text-sm">Your rent for Sunshine PGs is due in 5 days. Don't forget to pay!</p>
                </div>
                
                {/* Featured Messes */}
                <h3 className="font-bold text-gray-700 mt-6">Top-Rated Messes Near You</h3>
                {mockMessData.featuredMesses.map((mess, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <h4 className="font-semibold">{mess.name}</h4>
                      <p className="text-xs text-gray-500">{mess.distance} away</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-yellow-500">{mess.rating} ★</p>
                      <p className="text-xs text-gray-600">₹{mess.price}/mo</p>
                    </div>
                  </div>
                ))}
                <Link to="/services/mess" className="block text-center mt-4 text-blue-600 font-medium hover:underline">
                  View More Messes
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;