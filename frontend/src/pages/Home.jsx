import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBuilding,
  FaCheckCircle,
  FaComments,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaWifi,
  FaSnowflake,
  FaUtensils,
  FaUsers,
  FaMapMarker,
} from "react-icons/fa";
import { LocateFixed } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const Home = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    type: "",
    budget: "",
  });

  const handleSearchChange = (e) => {
    setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const { location, type, budget } = searchFilters;
    if (type === "mess") {
      navigate(`/messes?location=${location}`);
      return;
    }
    navigate(`/accommodations?location=${location}&type=${type}&budget=${budget}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-25 to-mint-50">
      <Header />
      
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-8"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-green-900/5 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-emerald-100/90 border border-emerald-200 px-6 py-3 rounded-full mb-8 backdrop-blur-sm shadow-lg">
              <FaBuilding className="w-5 h-5 mr-2 text-emerald-600" />
              <span className="text-lg font-semibold text-slate-800 tracking-wide">No More City Roaming</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-5xl font-black text-slate-900 leading-tight mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Find. Connect. <span className="bg-gradient-to-r from-emerald-400 to-mint-400 bg-clip-text text-transparent">Live Better.</span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-slate-700 font-light mb-10 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Photos, prices, real distances, honest reviews, direct owner chat. Everything before you step out.
          </motion.p>

          <motion.form
            onSubmit={handleSearchSubmit}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto border border-emerald-50/50"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-emerald-500 w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Hinjewadi, Baner, Kothrud..."
                  value={searchFilters.location}
                  onChange={handleSearchChange}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200/50 focus:border-emerald-300 text-base font-medium transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FaBuilding className="text-emerald-500 w-4 h-4" />
                  Type
                </label>
                <select
                  name="type"
                  value={searchFilters.type}
                  onChange={handleSearchChange}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200/50 focus:border-emerald-300 text-base font-medium transition-all duration-200"
                >
                  <option value="">All Types</option>
                  <option value="pg">PGs & Hostels</option>
                  <option value="mess">Mess Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FaRupeeSign className="text-emerald-500 w-4 h-4" />
                  Budget
                </label>
                <select
                  name="budget"
                  value={searchFilters.budget}
                  onChange={handleSearchChange}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200/50 focus:border-emerald-300 text-base font-medium transition-all duration-200"
                >
                  <option value="">Any Budget</option>
                  <option value="0-10000">Under ₹10K</option>
                  <option value="10000-15000">₹10K - ₹15K</option>
                  <option value="15000+">₹15K+</option>
                </select>
              </div>

              <motion.button
                type="submit"
                className="w-full lg:w-auto col-span-1 lg:col-span-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 h-15 border border-emerald-500/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSearch className="w-5 h-5" />
                Find
              </motion.button>

              <div className="flex items-center gap-2 lg:justify-end">
                <Link
                  to="/pgs/near-me"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold flex-1 lg:flex-none h-15 justify-center border border-emerald-500/20"
                >
                  <LocateFixed className="w-5 h-5" />
                  Near Me
                </Link>
              </div>
            </div>
          </motion.form>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-4xl font-black bg-gradient-to-r from-emerald-500 to-mint-500 bg-clip-text text-transparent mb-6"
              variants={itemVariants}
            >
              Everything You Need In One Place
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto"
              variants={itemVariants}
            >
              No more multiple apps. PG + Mess + Laundry + Real distances + Direct owner chat.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {[
              {
                icon: <FaMapMarker className="w-16 h-16" />,
                title: "Real Distances",
                desc: "See exact distance to college, office, bus stand before visiting",
              },
              {
                icon: <FaComments className="w-16 h-16" />,
                title: "Direct Owner Chat",
                desc: "No brokers. Talk directly with PG owners. Clear all doubts instantly",
              },
              {
                icon: <FaCheckCircle className="w-16 h-16" />,
                title: "Honest Reviews",
                desc: "Real photos, ratings, food quality, safety verified by actual users",
              },
              {
                icon: <FaWifi className="w-16 h-16" />,
                title: "Live Availability",
                desc: "Check room availability before visiting. Save time & energy",
              },
              {
                icon: <FaUtensils className="w-16 h-16" />,
                title: "Mess Menus",
                desc: "Today's specials, food quality ratings, menu photos by students",
              },
              {
                icon: <FaBuilding className="w-16 h-16" />,
                title: "Map View",
                desc: "See locality, nearby roads, colleges, bus stops on interactive map",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-50 hover:border-emerald-100 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center h-full"
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-mint-100 border-4 border-emerald-200/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-all duration-300">
                  {React.cloneElement(feature.icon, { className: "w-10 h-10 text-emerald-600" })}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-center">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 via-green-25 to-mint-50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Perfect For <span className="bg-gradient-to-r from-emerald-500 to-mint-500 bg-clip-text text-transparent">Students & Migrants</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-emerald-50 hover:shadow-xl transition-all duration-300"
            >
              <FaUsers className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">New City Migrants</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Explore PGs before you arrive. Compare side-by-side. Zero roaming stress.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-emerald-50 hover:shadow-xl transition-all duration-300"
            >
              <FaComments className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Worried Parents</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Verify safety, see real photos, read honest reviews. Complete peace of mind.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-emerald-50 hover:shadow-xl transition-all duration-300"
            >
              <FaSnowflake className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Busy Students</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Filters by budget, distance, AC/WiFi. Check availability. Book directly.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
