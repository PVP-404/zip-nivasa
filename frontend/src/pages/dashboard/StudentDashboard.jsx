// src/pages/dashboard/StudentDashboard.jsx
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
  FaHandshake,
} from "react-icons/fa";

/* -------------------------
   Mock MESS + LAUNDRY only
   PG is now REAL DATA from backend
   ------------------------- */
const mockMessList = [ /* your same mock mess data */ ];
const mockLaundryList = [ /* your same mock laundry data */ ];

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ States for services
  const [messes, setMesses] = useState([]);
  const [housingOptions, setHousingOptions] = useState([]); // ✅ Will be REPLACED by PGs
  const [laundryOptions, setLaundryOptions] = useState([]);

  const [query, setQuery] = useState("");
  const [selectedMess, setSelectedMess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeService, setActiveService] = useState("mess");

  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  /* ✅ FETCH REAL PG LISTINGS */
  const fetchPGs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();

      // ✅ Convert DB fields → what frontend UI expects
      const formattedPGs = data.map((pg) => ({
        id: pg._id,
        name: pg.title,
        type: pg.propertyType,
        location: pg.location,
        price: pg.monthlyRent,
        rating: 4.6, // ✅ Default rating (you can replace with real later)
        distance: "1.5 km", // ✅ Placeholder, until you add map API
        image: pg.images?.[0] ? `http://localhost:5000${pg.images[0]}` : "https://via.placeholder.com/400",
        amenities: pg.amenities,
        contact: "+919999999999", // ✅ Replace later with owner contact
      }));

      setHousingOptions(formattedPGs);
    } catch (err) {
      console.error("Failed to load PG listings:", err);
    }
  };

  /* ✅ Load all data */
  useEffect(() => {
    setTimeout(() => setMesses(mockMessList), 900);
    setTimeout(() => setLaundryOptions(mockLaundryList), 1100);

    // ✅ Load PGs from backend
    fetchPGs();
  }, []);

  /* ✅ Modal ESC handler */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ✅ Search Filters */
  const filteredMesses = messes.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredHousing = housingOptions.filter((h) =>
    h.name.toLowerCase().includes(query.toLowerCase()) ||
    h.location.toLowerCase().includes(query.toLowerCase()) ||
    h.type.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLaundry = laundryOptions.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );

  /* ✅ Modal Handlers */
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

  /* ✅ Service Card Component */
  const ServiceCard = ({ icon, title, description, serviceKey, color }) => {
    const isActive = activeService === serviceKey;
    return (
      <motion.div
        whileHover={{ translateY: -4 }}
        className={`bg-white p-6 rounded-2xl shadow-lg border-2 cursor-pointer ${
          isActive ? `border-${color}-600 ring-4 ring-${color}-100` : "border-gray-100"
        }`}
        onClick={() => {
          setActiveService(serviceKey);
          setQuery("");
          if (searchInputRef.current) searchInputRef.current.value = "";
        }}
      >
        <h2 className={`text-xl font-bold flex items-center text-${color}-700`}>
          {React.cloneElement(icon, { className: "mr-2" })} {title}
        </h2>
        <p className="text-gray-700 mt-2">{description}</p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
          {/* ---------- ✅ SERVICES SECTION ---------- */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ServiceCard
                icon={<FaUtensils />}
                title="Mess Services"
                description="Explore messes and menus."
                serviceKey="mess"
                color="black"
              />
              <ServiceCard
                icon={<FaHome />}
                title="Housing Services"
                description="Find PGs, rooms & hostels."
                serviceKey="housing"
                color="black"
              />
              <ServiceCard
                icon={<FaTshirt />}
                title="Laundry Services"
                description="Find nearby laundry shops."
                serviceKey="laundry"
                color="black"
              />
            </div>
          </section>

          {/* ✅ Housing Section (PG Listings) */}
          <AnimatePresence>
            {activeService === "housing" && (
              <motion.div
                key="housing-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-10"
              >
                <h3 className="text-2xl font-bold mb-4">Explore PGs & Rooms</h3>

                {/* Search */}
                <div className="relative mb-6 w-full sm:w-72">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    placeholder="Search PGs..."
                    className="pl-10 py-2 border rounded-lg w-full"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* ✅ PG Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {housingOptions.length === 0 ? (
                    <p>Loading PGs...</p>
                  ) : filteredHousing.length === 0 ? (
                    <p>No PGs found.</p>
                  ) : (
                    filteredHousing.map((pg) => (
                      <div
                        key={pg.id}
                        className="bg-white rounded-2xl shadow-lg p-4 border"
                      >
                        <img
                          src={pg.image}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <h4 className="font-bold text-lg mt-3">{pg.name}</h4>
                        <p className="text-gray-600">{pg.type}</p>
                        <p className="text-gray-600">{pg.location}</p>

                        <p className="text-gray-700 font-bold mt-2">
                          ₹{pg.price}/mo
                        </p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {pg.amenities?.slice(0, 3).map((a, i) => (
                            <span key={i} className="text-xs bg-purple-100 px-2 py-1 rounded">
                              {a}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <a
                            href={`tel:${pg.contact}`}
                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-center"
                          >
                            Connect
                          </a>

                          <Link
                            to={`/services/pg/${pg.id}`}
                            className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg text-center"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ Mess + Laundry sections remain SAME */}
          {/* Mess section code stays unchanged */}
          {/* Laundry section code stays unchanged */}
        </main>

        <Footer />
      </div>

      {/* ✅ Modal code remains same */}
    </div>
  );
};

export default StudentDashboard;
