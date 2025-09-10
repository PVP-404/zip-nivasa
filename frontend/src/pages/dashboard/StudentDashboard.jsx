// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import {
  FaUtensils,
  FaHome,
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaTimes,
  FaBars,
} from "react-icons/fa";

/* -------------------------
   Mock data (replace with API calls)
   ------------------------- */
const myMockMenu = {
  messName: "Daily Delight Mess",
  breakfast: "Poha, Tea, Apple",
  lunch: "Dal Fry, Jeera Rice, 2 Chapati, Curd",
  dinner: "Paneer Butter Masala, 2 Naan, Gulab Jamun",
};

const mockMessList = [
  {
    id: 1,
    name: "Healthy Bites Mess",
    rating: 4.8,
    price: 2500,
    distance: "1.2 km",
    image:
      "https://images.pexels.com/photos/248418/pexels-photo-248418.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    menu: {
      breakfast: "Upma, Tea",
      lunch: "Rajma, Rice, Salad",
      dinner: "Mix Veg, Roti, Kheer",
    },
  },
  {
    id: 2,
    name: "Home Taste Tiffins",
    rating: 4.5,
    price: 2800,
    distance: "0.5 km",
    image:
      "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    menu: {
      breakfast: "Idli, Sambar",
      lunch: "Dal Makhani, Jeera Rice",
      dinner: "Butter Chicken, Naan",
    },
  },
  {
    id: 3,
    name: "Budget Meals",
    rating: 4.2,
    price: 1800,
    distance: "2.1 km",
    image:
      "https://images.pexels.com/photos/1435896/pexels-photo-1435896.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    menu: {
      breakfast: "Bread Omelette, Tea",
      lunch: "Chole, Bhatura",
      dinner: "Masala Dosa, Chutney",
    },
  },
  {
    id: 4,
    name: "The Student's Mess",
    rating: 4.6,
    price: 2600,
    distance: "0.8 km",
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    menu: {
      breakfast: "Aloo Paratha, Curd",
      lunch: "Rice, Dal, 2 Roti, Sabzi",
      dinner: "Chicken Curry, Rice, Salad",
    },
  },
  {
    id: 5,
    name: "Simple Eats",
    rating: 4.0,
    price: 2200,
    distance: "1.5 km",
    image:
      "https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    menu: {
      breakfast: "Poori, Sabzi",
      lunch: "Plain Rice, Dal, 2 Roti",
      dinner: "Aloo Gobi, Roti",
    },
  },
];

// Helper component for loading states
const LoadingCard = () => (
  <div className="bg-white p-5 rounded-xl shadow-md animate-pulse">
    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
  </div>
);

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [messes, setMesses] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedMess, setSelectedMess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Simulate API fetch for student's own menu
    const t1 = setTimeout(() => setMenu(myMockMenu), 700);

    // Simulate fetch for available messes
    const t2 = setTimeout(() => setMesses(mockMessList), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Close modal when ESC is pressed
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filtered list
  const filtered = messes.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const openMenuModal = (mess) => {
    setSelectedMess(mess);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMess(null), 200);
  };

  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) closeModal();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <div className="lg:hidden p-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Open sidebar menu"
          >
            <FaBars size={24} />
          </button>
        </div>

        <Header />

        <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Welcome Back, <span className="text-blue-600">Student!</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Quick access to your mess, PG search and nearby messes to explore 🍽️
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* My Mess Card */}
            <motion.div
              whileHover={{ translateY: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center text-green-700">
                  <FaUtensils className="mr-2" /> My Mess
                </h2>
                <span className="text-xs font-medium text-white bg-green-500 px-2 py-1 rounded-full">
                  Subscribed
                </span>
              </div>
              {menu ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{menu.messName}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Today's Menu:</span>
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mb-4 ml-4">
                    <li><span className="font-medium">Breakfast:</span> {menu.breakfast}</li>
                    <li><span className="font-medium">Lunch:</span> {menu.lunch}</li>
                    <li><span className="font-medium">Dinner:</span> {menu.dinner}</li>
                  </ul>
                  <div className="flex gap-3">
                    <Link
                      to="/services/mess"
                      className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Manage Mess
                    </Link>
                  </div>
                </>
              ) : (
                <LoadingCard />
              )}
            </motion.div>

            {/* Find PG Card */}
            <motion.div
              whileHover={{ translateY: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold flex items-center text-purple-700">
                  <FaHome className="mr-2" /> Find a PG
                </h2>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Search and compare paying guests and rooms near you with detailed filters and reviews.
              </p>
              <Link
                to="/services/pg"
                className="block text-center py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Search PGs
              </Link>
            </motion.div>

            {/* Support Card */}
            <motion.div
              whileHover={{ translateY: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold flex items-center text-orange-600">
                  <FaTimes className="mr-2" /> Need Help?
                </h2>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Our 24/7 support team is here to assist you with any questions or issues.
              </p>
              <Link
                to="/contact"
                className="block text-center py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Contact Support
              </Link>
            </motion.div>
          </div>

          {/* Explore Messes Section */}
          <section className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Explore Nearby Messes</h3>
                <p className="text-sm text-gray-600">Browse menus, ratings, and compare prices.</p>
              </div>

              {/* Search & Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search mess name..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                    aria-label="Search for a mess"
                  />
                </div>
                <Link
                  to="/services/mess"
                  className="hidden sm:inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>

            {/* Mess Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {messes.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-28 h-28 bg-gray-200 rounded-md"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12 border border-dashed rounded-lg">
                  <p className="text-lg">No messes found for "{query}".</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search query or view all available messes.</p>
                </div>
              ) : (
                filtered.map((m) => (
                  <motion.article
                    key={m.id}
                    whileHover={{ translateY: -6, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <img
                        src={m.image}
                        alt={`A photo of food from ${m.name}`}
                        className="w-full sm:w-28 h-40 sm:h-auto object-cover"
                      />
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">{m.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <FaStar className="text-yellow-500" aria-label="Rating" /> {m.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400" aria-label="Distance" /> {m.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaRupeeSign className="text-gray-400" aria-label="Price" /> {m.price}/mo
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => openMenuModal(m)}
                            className="flex-1 text-center text-sm px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                            aria-label={`View menu for ${m.name}`}
                          >
                            View Menu
                          </button>
                          <Link
                            to={`/services/mess/${m.id}`}
                            className="flex-1 text-center text-sm px-3 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Menu Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={overlayRef}
            onMouseDown={onOverlayClick}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="document"
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto z-10 overflow-hidden transform"
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedMess.image}
                    alt={`Food from ${selectedMess.name}`}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedMess.name}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" /> {selectedMess.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400" /> {selectedMess.distance}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition"
                  aria-label="Close menu modal"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-4">Today's Menu</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-600">Breakfast</h5>
                    <p className="mt-1 font-semibold">{selectedMess.menu.breakfast}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-600">Lunch</h5>
                    <p className="mt-1 font-semibold">{selectedMess.menu.lunch}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-600">Dinner</h5>
                    <p className="mt-1 font-semibold">{selectedMess.menu.dinner}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-base text-gray-600">
                    <p>
                      Monthly Price: <span className="font-bold text-gray-800">₹{selectedMess.price}</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/services/mess/${selectedMess.id}`}
                      onClick={closeModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/services/mess/subscribe?messId=${selectedMess.id}`}
                      onClick={closeModal}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Subscribe
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;