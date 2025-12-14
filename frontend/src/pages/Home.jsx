import React, { memo, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LocationAutosuggest from "../components/LocationAutosuggest";
import {
  FaSearch,
  FaBuilding,
  FaCheckCircle,
  FaComments,
  FaMapMarkerAlt,
  FaWifi,
  FaUtensils,
  FaUsers,
  FaMapMarker,
  FaArrowRight,
  FaHandshake,
  FaShieldAlt,
  FaClock,
  FaUserCheck,
} from "react-icons/fa";
import {
  LocateFixed,
  Building2,
  Search,
  MessageCircle,
  Home as HomeIcon,
  ChevronRight,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
const role = localStorage.getItem("role");
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// Static data
const FEATURES = [
  {
    icon: FaMapMarker,
    title: "Real Distances",
    desc: "See exact distance to college, office, bus stand before visiting",
  },
  {
    icon: FaComments,
    title: "Direct Owner Chat",
    desc: "No brokers. Talk directly with PG owners. Clear all doubts instantly",
  },
  {
    icon: FaCheckCircle,
    title: "Honest Reviews",
    desc: "Real photos, ratings, food quality, safety verified by actual users",
  },
  {
    icon: FaWifi,
    title: "Live Availability",
    desc: "Check room availability before visiting. Save time & energy",
  },
  {
    icon: FaUtensils,
    title: "Mess Menus",
    desc: "Today's specials, food quality ratings, menu photos by students",
  },
  {
    icon: FaBuilding,
    title: "Map View",
    desc: "See locality, nearby roads, colleges, bus stops on interactive map",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Search Your Area",
    desc: "Enter your college, office or preferred locality. Filter by budget and amenities.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    step: "02",
    icon: FaCheckCircle,
    title: "Compare & Shortlist",
    desc: "View real photos, check distances, read reviews. Save your favorites.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "Chat with Owner",
    desc: "Message owners directly. Ask about availability and clarify doubts.",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "04",
    icon: HomeIcon,
    title: "Visit & Move In",
    desc: "Schedule a visit at your convenience. Finalize directly with owner.",
    color: "from-orange-500 to-red-500",
  },
];

const AUDIENCE_DATA = [
  {
    icon: FaUsers,
    title: "New City Migrants",
    desc: "Explore PGs before you arrive. Compare side-by-side. Zero roaming stress.",
    delay: 0.1,
  },
  {
    icon: FaShieldAlt,
    title: "Worried Parents",
    desc: "Verify safety, see real photos, read honest reviews. Complete peace of mind.",
    delay: 0.2,
  },
  {
    icon: FaClock,
    title: "Busy Professionals",
    desc: "Filters by budget, distance, AC/WiFi. Check availability. Connect directly.",
    delay: 0.3,
  },
];

// Memoized Feature Card
const FeatureCard = memo(function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
});

// Memoized How It Works Card
const HowItWorksCard = memo(function HowItWorksCard({
  step,
  icon: Icon,
  title,
  desc,
  color,
  index,
}) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
    >
      {index < 3 && (
        <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-0" />
      )}

      <div className="relative z-10 text-center">
        <div
          className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-xs font-bold text-slate-400 tracking-widest mb-2">
          STEP {step}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
          {desc}
        </p>
      </div>
    </motion.div>
  );
});

// Memoized Audience Card
const AudienceCard = memo(function AudienceCard({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all duration-300"
    >
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
        <Icon className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed text-center">{desc}</p>
    </motion.div>
  );
});

// Owner CTA Section
const OwnerCTASection = memo(function OwnerCTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Own a PG, Hostel or Mess?
              </h2>

              <p className="text-slate-400 mb-6 max-w-lg">
                List your property and connect directly with students and
                professionals. No middlemen, no hidden charges.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {role === "messowner" && (
                  <Link
                    to="/dashboard/add-mess"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Add Mess Listing
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {role === "pgowner" && (
                  <Link
                    to="/dashboard/add-pg"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Add PG Listing
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {role === "tenant" && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Register as Owner
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {!role && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Register Your Property
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {!role && (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white font-medium py-3 px-6 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-200"
                  >
                    Already registered? Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// Trust Badges
const TrustBadges = memo(function TrustBadges() {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-6 mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {[
        { icon: FaShieldAlt, text: "Verified Listings" },
        { icon: FaHandshake, text: "No Brokers" },
        { icon: FaComments, text: "Direct Chat" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
          <item.icon className="w-4 h-4 text-emerald-500" />
          <span>{item.text}</span>
        </div>
      ))}
    </motion.div>
  );
});

// Main Home Component
const Home = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    type: "",
  });

  const handleSearchChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLocationChange = useCallback((val) => {
    setSearchFilters((prev) => ({ ...prev, location: val }));
  }, []);

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const { location, type } = searchFilters;
      const encodedLocation = encodeURIComponent(location);
      const path =
        type === "mess"
          ? `/messes?search=${encodedLocation}`
          : `/pgs/all?location=${encodedLocation}&type=${type}`;
      navigate(path);
    },
    [searchFilters, navigate]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-slate-50 pt-16">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129 / 0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-full mb-6">
              <FaMapMarkerAlt className="w-4 h-4 mr-2 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                Find PGs & Messes Near You
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your New Home is{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Just a Search Away
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real photos, verified prices, honest reviews, and direct owner
            chat. Everything you need before stepping out.
          </motion.p>

          {/* Search Form */}
          <motion.form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 md:p-6 max-w-3xl mx-auto border border-slate-100"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <LocationAutosuggest
                  value={searchFilters.location}
                  onChange={handleLocationChange}
                  placeholder="Enter area, college, or office..."
                />
              </div>

              <select
                name="type"
                value={searchFilters.type}
                onChange={handleSearchChange}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 text-sm font-medium bg-white md:w-40"
              >
                <option value="">All Types</option>
                <option value="pg">PG & Hostel</option>
                <option value="mess">Mess</option>
              </select>

              <motion.button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSearch className="w-4 h-4" />
                Search
              </motion.button>

              <Link
                to="/pgs/near-me"
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <LocateFixed className="w-4 h-4" />
                <span className="hidden sm:inline">Near Me</span>
              </Link>
            </div>

            {/* Subtle Owner Link */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm">
              {role === "messowner" && (
                <>
                  <span className="text-slate-500">You are a mess owner</span>
                  <Link
                    to="/dashboard/add-mess"
                    className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    Add Mess Listing
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </>
              )}

              {role === "pgowner" && (
                <>
                  <span className="text-slate-500">You are a PG owner</span>
                  <Link
                    to="/dashboard/add-pg"
                    className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    Add PG Listing
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </>
              )}

              {role === "tenant" && (
                <>
                  <span className="text-slate-500">
                    You are registered as a tenant.
                  </span>
                  <Link
                    to="/register"
                    className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    Register as Owner
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </>
              )}

              {!role && (
                <>
                  <span className="text-slate-500">
                    Want to list your property?
                  </span>
                  <Link
                    to="/register"
                    className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    Register Now
                    <FaArrowRight className="w-3 h-3" />
                  </Link>
                </>
              )}
            </div>
          </motion.form>

          <TrustBadges />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-emerald-600 font-semibold text-sm tracking-wider uppercase">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Find your perfect accommodation in four simple steps. No hassle,
              no brokers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <HowItWorksCard key={index} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.span
              className="text-emerald-600 font-semibold text-sm tracking-wider uppercase"
              variants={itemVariants}
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4"
              variants={itemVariants}
            >
              Everything You Need In One Place
            </motion.h2>
            <motion.p
              className="text-slate-600 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              No more juggling multiple apps. Search PGs, discover mess
              services, check real distances, and chat with owners — all in one
              platform.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-emerald-600 font-semibold text-sm tracking-wider uppercase">
              Who Is It For
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
              Built For People Like You
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Whether you're a student, working professional, or a concerned
              parent — we've got you covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {AUDIENCE_DATA.map((item, i) => (
              <AudienceCard key={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA Section */}
      <OwnerCTASection />

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-500">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to find your perfect stay?
            </h2>
            <p className="text-emerald-100 mb-8">
              Start exploring verified PGs and messes in your preferred area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pgs/all"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FaSearch className="w-4 h-4" />
                Start Exploring
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl border border-emerald-400 transition-all duration-200"
              >
                Sign In
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default memo(Home);