// ✅ frontend/src/pages/pgs/AllPGs.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

// ------------------- CONSTANTS -------------------
const BUDGET_RANGES = [
  { label: "Below ₹5,000", max: 5000, value: "0-5000" },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000, value: "5000-10000" },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000, value: "10000-15000" },
  { label: "Above ₹15,000", min: 15000, max: Infinity, value: "15000-inf" },
];

const PROPERTY_TYPES = [
  { label: "Boys PG", value: "boys" },
  { label: "Girls PG", value: "girls" },
  { label: "Co-Ed PG (Mixed)", value: "mixed" },
];

// ------------------- UTILITIES -------------------
const getBudgetFromValue = (value) =>
  BUDGET_RANGES.find((b) => b.value === value) || null;

const FilterSection = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

const AmenityIcon = ({ label }) => {
  const n = label.toLowerCase();
  if (n.includes("wifi"))
    return (
      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12.55a11 11 0 0 1 14 0" />
        <path d="M8.5 16a6 6 0 0 1 7 0" />
        <path d="M12 20h.01" />
      </svg>
    );
  if (n.includes("ac") || n.includes("cool"))
    return (
      <svg className="w-4 h-4 mr-1 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20" />
        <path d="M4 6l8 4 8-4" />
        <path d="M4 18l8-4 8 4" />
      </svg>
    );
  if (n.includes("mess") || n.includes("food"))
    return (
      <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 3h2l1 7v11" />
        <path d="M10 3h2v18" />
        <path d="M16 7a2 2 0 0 1 4 0v11" />
      </svg>
    );
  return null;
};

// ------------------- MAIN COMPONENT -------------------
const AllPGs = () => {
  const navigate = useNavigate();
  const locationHook = useLocation();

  // 🔵 YOUTUBE Layout: sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = useMemo(
    () => new URLSearchParams(locationHook.search),
    [locationHook.search]
  );

  // URL → Initial filters
  const [search, setSearch] = useState(query.get("search") || "");
  const [pgLocation, setPgLocation] = useState(query.get("location") || "");
  const [type, setType] = useState(query.get("type") || "");
  const [selectedBudget, setSelectedBudget] = useState(
    getBudgetFromValue(query.get("budget"))
  );
  const [sortBy, setSortBy] = useState(query.get("sort") || "recent");

  const [showFilters, setShowFilters] = useState(false);

  // ---------------- FETCH PGs ----------------
  const fetchPGs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();
      setPgs(data);
    } catch (err) {
      console.error("PG fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPGs();
  }, []);

  // ---------------- FILTER + SORT ----------------
  const filteredPGs = useMemo(() => {
    let f = [...pgs];

    if (search.trim())
      f = f.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );

    if (pgLocation.trim())
      f = f.filter((p) =>
        p.location.toLowerCase().includes(pgLocation.toLowerCase())
      );

    if (type) f = f.filter((p) => p.propertyType === type);

    if (selectedBudget) {
      const { min = 0, max = Infinity } = selectedBudget;
      f = f.filter((p) => p.monthlyRent >= min && p.monthlyRent <= max);
    }

    f.sort((a, b) => {
      if (sortBy === "low-high") return a.monthlyRent - b.monthlyRent;
      if (sortBy === "high-low") return b.monthlyRent - a.monthlyRent;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return f;
  }, [pgs, search, pgLocation, type, selectedBudget, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setPgLocation("");
    setSelectedBudget(null);
    setType("");
    setSortBy("recent");
  };

  const isFilterActive =
    search || pgLocation || type || selectedBudget || sortBy !== "recent";

  // -------------------- LOADING SCREEN --------------------
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // -------------------- MAIN LAYOUT --------------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* 🔵 HEADER FULL WIDTH */}
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* 🔵 MAIN LAYOUT: Sidebar + Content */}
      <div className="flex flex-row flex-1 w-full h-full overflow-hidden">

        {/* 🔵 SIDEBAR BELOW HEADER */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* 🔵 CONTENT SECTION */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 w-full overflow-y-auto transition-all duration-300">

          {/* ---- PAGE TITLE ---- */}
          <div className="mb-6 pb-3 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore PGs</h1>
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="text-indigo-600 font-semibold">
                {filteredPGs.length}
              </span>{" "}
              properties
            </p>
          </div>

          {/* ---- FILTERS BUTTON (MOBILE) ---- */}
          <div className="lg:hidden mb-5">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
              </svg>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* ---- FILTER SIDEBAR ---- */}
          <div className="flex flex-col lg:flex-row gap-10">

            {/* LEFT FILTER PANEL */}
            <aside
              className={`lg:w-72 w-full flex-shrink-0 bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6 transition-all duration-300 
                ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-800">Refine search</h2>
                {isFilterActive && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Search */}
              <FilterSection title="Search by Name">
                <input
                  className="w-full border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ex: Green PG, Sunrise..."
                />
              </FilterSection>

              {/* Location */}
              <FilterSection title="Location">
                <input
                  className="w-full border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={pgLocation}
                  onChange={(e) => setPgLocation(e.target.value)}
                  placeholder="Ex: Hinjewadi, Baner..."
                />
              </FilterSection>

              {/* Type */}
              <FilterSection title="PG Type">
                <div className="space-y-2">
                  {PROPERTY_TYPES.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        className="text-indigo-600"
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      className="text-indigo-600"
                      checked={type === ""}
                      onChange={() => setType("")}
                    />
                    <span className="text-gray-600 text-sm">All Types</span>
                  </label>
                </div>
              </FilterSection>

              {/* Budget */}
              <FilterSection title="Monthly Budget">
                <div className="space-y-2">
                  {BUDGET_RANGES.map((range, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="budget"
                        className="text-indigo-600"
                        checked={selectedBudget?.value === range.value}
                        onChange={() => setSelectedBudget(range)}
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="budget"
                      className="text-indigo-600"
                      checked={selectedBudget === null}
                      onChange={() => setSelectedBudget(null)}
                    />
                    <span className="text-gray-600 text-sm">All Budgets</span>
                  </label>
                </div>
              </FilterSection>
            </aside>

            {/* RIGHT CONTENT */}
            <section className="flex-1 min-w-0">

              {/* Sort dropdown */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Available PGs
                  </h2>
                </div>

                <select
                  className="border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:ring-indigo-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>

              {/* CARDS */}
              {filteredPGs.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow">
                  <p className="text-gray-600">No PGs found.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-indigo-600 text-sm font-medium underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPGs.map((pg) => {
                    const rating =
                      pg.averageRating ||
                      (pg.ratings?.length
                        ? pg.ratings.reduce((s, r) => s + (r.stars || 0), 0) /
                          pg.ratings.length
                        : null);
                    const ratingCount =
                      pg.totalRatings || pg.ratings?.length || 0;

                    return (
                      <Link
                        key={pg._id}
                        to={`/services/pg/${pg._id}`}
                        className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                      >
                        {/* Image */}
                        <img
                          src={
                            pg.images?.[0]
                              ? `http://localhost:5000${pg.images[0]}`
                              : "https://via.placeholder.com/400"
                          }
                          className="h-48 w-full object-cover group-hover:scale-[1.03] transition-transform"
                          alt={pg.title}
                        />

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                            {pg.title}
                          </h3>

                          <p className="text-xs text-gray-600 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1 text-red-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 18l6-6a7 7 0 10-12 0l6 6z" />
                            </svg>
                            {pg.location}
                          </p>

                          {/* Rating */}
                          {rating ? (
                            <div className="flex items-center text-xs text-amber-500">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.62-.921 1.92 0L13.334 9a1 1 0 00.95.691h7.668a1 1 0 01.54 1.705l-6.21 4.512a1 1 0 00-.364 1.118l2.365 7.284c.3.921-.755 1.688-1.54 1.118l-6.21-4.512a1 1 0 00-1.175 0l-6.21 4.512c-.785.57-1.84-.197-1.54-1.118l2.365-7.284a1 1 0 00-.364-1.118L2.022 13.917A1 1 0 012.562 12.212h7.668a1 1 0 00.95-.691l2.365-7.284z" />
                              </svg>
                              <span className="font-semibold">{rating.toFixed(1)}</span>
                              <span className="text-gray-500 ml-1">
                                ({ratingCount} reviews)
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">
                              No ratings yet
                            </div>
                          )}

                          {/* Price */}
                          <div className="text-indigo-600 font-semibold">
                            ₹{pg.monthlyRent.toLocaleString("en-IN")}/month
                          </div>

                          {/* Amenities */}
                          {Array.isArray(pg.amenities) && pg.amenities.length > 0 && (
                            <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
                              {pg.amenities.slice(0, 3).map((a, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  <AmenityIcon label={a} />
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* <Footer /> */}

      </div>
    </div>
  );
};

// -------------------- FILTER CHIP --------------------
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200 shadow-sm">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="ml-2 text-blue-500 hover:text-blue-700"
    >
      ✕
    </button>
  </span>
);

export default AllPGs;
