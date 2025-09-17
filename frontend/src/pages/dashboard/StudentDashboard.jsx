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
  FaTshirt,
  FaChevronRight,
  FaPhone,
  FaWifi,
  FaBath,
  FaHandshake, // New icon for 'Connect' or 'Book' action
} from "react-icons/fa";
/* -------------------------
   Mock data (replace with API calls)
   ------------------------- */
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
// Mock data for Housing Services (PGs/Rented Houses)
const mockHousingList = [
  {
    id: 1,
    name: "Cozy Student PG - Male",
    type: "PG",
    location: "Near University Gate 1",
    price: 7500,
    rating: 4.6,
    distance: "0.7 km",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    amenities: ["WiFi", "Attached Bath", "Food Included"],
    contact: "+919976543210",
  },
  {
    id: 2,
    name: "Gen-V Apartments - Female",
    type: "Rented Room",
    location: "Sector 14, Main Road",
    price: 12000,
    rating: 4.8,
    distance: "2.5 km",
    image:
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    amenities: ["Spacious Rooms", "Balcony", "24/7 Security"],
    contact: "+918795432109",
  },
  {
    id: 3,
    name: "Budget Hostel for Students",
    type: "Hostel",
    location: "Behind City Mall",
    price: 5000,
    rating: 4.0,
    distance: "1.8 km",
    image:
      "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    amenities: ["Basic Furnishing", "Shared Rooms", "Common Mess"],
    contact: "+917659321098",
  },
  {
    id: 4,
    name: "Elite Residences - Co-ed",
    type: "PG",
    location: "Near Tech Park",
    price: 9000,
    rating: 4.7,
    distance: "3.1 km",
    image:
      "https://images.pexels.com/photos/263503/pexels-photo-263503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    amenities: ["AC Rooms", "Gym Access", "Laundry Service"],
    contact: "+916548210987",
  },
];
// Mock data for Laundry Services
const mockLaundryList = [
  {
    id: 1,
    name: "Sparkle Clean Laundry",
    rating: 4.9,
    pricePerKg: 60,
    minLoad: "2 kg",
    distance: "0.3 km",
    image:
      "https://images.pexels.com/photos/5591459/pexels-photo-5591459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    services: ["Wash & Fold", "Ironing", "Dry Cleaning"],
    contact: "+919988776655",
  },
  {
    id: 2,
    name: "Quick Wash Express",
    rating: 4.5,
    pricePerKg: 50,
    minLoad: "1 kg",
    distance: "1.0 km",
    image:
      "https://i.pinimg.com/736x/e4/da/25/e4da25a016a00d9462e87d8ec6273613.jpg",
    services: ["Wash & Fold", "Express Delivery", "Ironing"],
    contact: "+915876500112",
  },
  {
    id: 3,
    name: "Eco-Clean Laundry Hub",
    rating: 4.7,
    pricePerKg: 70,
    minLoad: "3 kg",
    distance: "2.2 km",
    image:
      "https://i.pinimg.com/736x/e1/31/75/e13175cb54e254b21992237a55a8e6d6.jpg",
    services: ["Organic Cleaning", "Ironing", "Bulk Discounts"],
    contact: "+917766554453",
  },
];
const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messes, setMesses] = useState([]);
  const [housingOptions, setHousingOptions] = useState([]);
  const [laundryOptions, setLaundryOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedMess, setSelectedMess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeService, setActiveService] = useState("mess"); // 'mess', 'housing', 'laundry'
  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    const t1 = setTimeout(() => setMesses(mockMessList), 900);
    const t2 = setTimeout(() => setHousingOptions(mockHousingList), 1000);
    const t3 = setTimeout(() => setLaundryOptions(mockLaundryList), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Filtered lists
  const filteredMesses = messes.filter((m) =>
    m.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const filteredHousing = housingOptions.filter((h) =>
    h.name.toLowerCase().includes(query.trim().toLowerCase()) ||
    h.location.toLowerCase().includes(query.trim().toLowerCase()) ||
    h.type.toLowerCase().includes(query.trim().toLowerCase())
  );
  const filteredLaundry = laundryOptions.filter((l) =>
    l.name.toLowerCase().includes(query.trim().toLowerCase()) ||
    l.services.some(service => service.toLowerCase().includes(query.trim().toLowerCase()))
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
  const ServiceCard = ({ icon, title, description, serviceKey, color }) => {
    const isActive = activeService === serviceKey;
    return (
      <motion.div
        whileHover={{ translateY: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
        className={`bg-white p-6 rounded-2xl shadow-lg border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer
          ${isActive ? `border-${color}-600 ring-4 ring-${color}-100` : `border-gray-100 hover:border-${color}-300`}
        `}
        onClick={() => {
            setActiveService(serviceKey);
            setQuery("");
            if (searchInputRef.current) {
              searchInputRef.current.value = "";
            }
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold flex items-center text-${color}-700`}>
              {React.cloneElement(icon, { className: "mr-2" })} {title}
            </h2>
            {isActive && (
              <span className={`text-xs font-medium text-white bg-${color}-500 px-2 py-1 rounded-full`}>
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-6">{description}</p>
        </div>
        <div className="flex justify-end items-center text-sm font-semibold text-blue-600 group">
            <span className={`inline-flex items-center text-${color}-600`}>
                Select Service <FaChevronRight className="ml-1" />
            </span>
        </div>
      </motion.div>
    );
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
              Select a service below to get started.
            </p>
          </motion.div>
          {/* Service Selection Cards */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ServiceCard
                icon={<FaUtensils />}
                title="Mess Services"
                description="Find and manage your daily meals, explore new messes, and view menus."
                serviceKey="mess"
                color="black"
              />
              <ServiceCard
                icon={<FaHome />}
                title="Housing Services"
                description="Discover and book PGs, hostels, or rental apartments suitable for students."
                serviceKey="housing"
                color="black"
              />
              <ServiceCard
                icon={<FaTshirt />}
                title="Laundry Services"
                description="Find convenient and affordable laundry services near your location."
                serviceKey="laundry"
                color="black"
              />
            </div>
          </section>
          {/* Conditional Service Content */}
          <AnimatePresence mode="wait">
            {activeService === "mess" && (
              <motion.section
                key="mess-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Explore Mess Options</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messes.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => ( // Show 3 loading cards
                      <div key={`loading-mess-${i}`} className="bg-white rounded-xl shadow-md p-4 animate-pulse md:col-span-1">
                        <div className="flex items-center gap-4">
                          <div className="w-28 h-28 bg-gray-200 rounded-md"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredMesses.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12 border border-dashed rounded-lg">
                      <p className="text-lg">No messes found for "{query}".</p>
                      <p className="text-sm text-gray-400 mt-2">Try a different search query or view all available messes.</p>
                    </div>
                  ) : (
                    filteredMesses.map((m) => (
                      <motion.article
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
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
              </motion.section>
            )}
            {activeService === "housing" && (
              <motion.section
                key="housing-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Explore Housing Options</h3>
                    <p className="text-sm text-gray-600">Find PGs, hostels, or rental apartments.</p>
                  </div>
                  {/* Search & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, location, or type..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
                        aria-label="Search for housing"
                      />
                    </div>
                    <Link
                      to="/services/pg"
                      className="hidden sm:inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                {/* Housing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {housingOptions.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => ( // Show 3 loading cards
                      <div key={`loading-housing-${i}`} className="bg-white rounded-xl shadow-md p-4 animate-pulse md:col-span-1">
                        <div className="flex items-center gap-4">
                          <div className="w-28 h-28 bg-gray-200 rounded-md"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredHousing.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12 border border-dashed rounded-lg">
                      <p className="text-lg">No housing options found for "{query}".</p>
                      <p className="text-sm text-gray-400 mt-2">Try a different search query or view all available housing.</p>
                    </div>
                  ) : (
                    filteredHousing.map((h) => (
                      <motion.article
                        key={h.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ translateY: -6, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <img
                            src={h.image}
                            alt={`${h.type} at ${h.name}`}
                            className="w-full sm:w-28 h-40 sm:h-auto object-cover"
                          />
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-lg text-gray-800">{h.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{h.type} - {h.location}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                  <FaStar className="text-yellow-500" aria-label="Rating" /> {h.rating}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-gray-400" aria-label="Distance" /> {h.distance}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaRupeeSign className="text-gray-400" aria-label="Price" /> {h.price}/mo
                                </span>
                              </div>
                              {h.amenities && h.amenities.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {h.amenities.map((amenity, idx) => (
                                    <span key={idx} className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                                      {amenity === "WiFi" && <FaWifi className="inline mr-1" />}
                                      {amenity === "Attached Bath" && <FaBath className="inline mr-1" />}
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex gap-2">
                              <a
                                href={`tel:${h.contact}`}
                                className="flex-1 text-center text-sm px-3 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                aria-label={`Connect with ${h.name}`}
                              >
                                <FaHandshake /> Connect
                              </a>
                              <Link
                                to={`/services/pg/${h.id}`} // Placeholder link
                                className="flex-1 text-center text-sm px-3 py-2 border border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
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
              </motion.section>
            )}
            {activeService === "laundry" && (
              <motion.section
                key="laundry-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Explore Laundry Services</h3>
                    <p className="text-sm text-gray-600">Find convenient and affordable laundry options.</p>
                  </div>
                  {/* Search & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or service..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                        aria-label="Search for laundry"
                      />
                    </div>
                    <Link
                      to="/services/laundry"
                      className="hidden sm:inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                {/* Laundry Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {laundryOptions.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => ( // Show 3 loading cards
                      <div key={`loading-laundry-${i}`} className="bg-white rounded-xl shadow-md p-4 animate-pulse md:col-span-1">
                        <div className="flex items-center gap-4">
                          <div className="w-28 h-28 bg-gray-200 rounded-md"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredLaundry.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12 border border-dashed rounded-lg">
                      <p className="text-lg">No laundry services found for "{query}".</p>
                      <p className="text-sm text-gray-400 mt-2">Try a different search query or view all available services.</p>
                    </div>
                  ) : (
                    filteredLaundry.map((l) => (
                      <motion.article
                        key={l.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ translateY: -6, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <img
                            src={l.image}
                            alt={`Image of ${l.name}`}
                            className="w-full sm:w-28 h-40 sm:h-auto object-cover"
                          />
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-lg text-gray-800">{l.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                                                  <FaStar className="text-yellow-500" aria-label="Rating" /> {l.rating}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-gray-400" aria-label="Distance" /> {l.distance}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaRupeeSign className="text-gray-400" aria-label="Price" /> {l.pricePerKg}/kg
                                </span>
                              </div>
                              {l.services && l.services.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {l.services.map((service, idx) => (
                                    <span key={idx} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex gap-2">
                              <a
                                href={`tel:${l.contact}`}
                                className="flex-1 text-center text-sm px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                aria-label={`Connect with ${l.name}`}
                              >
                                <FaHandshake /> Connect
                              </a>
                              <Link
                                to={`/services/laundry/${l.id}`} // Placeholder link
                                className="flex-1 text-center text-sm px-3 py-2 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
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
              </motion.section>
            )}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      {/* Menu Modal (unchanged) */}
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
