// ✅ frontend/src/pages/pgs/AllPGs.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

// --- Constants ---
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

// Helper: Find budget range object from its URL value
const getBudgetFromValue = (value) => {
  return BUDGET_RANGES.find((range) => range.value === value) || null;
};

// Small wrapper for filter blocks
const FilterSection = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

// Helper: amenity → icon
const AmenityIcon = ({ label }) => {
  const name = label.toLowerCase();

  if (name.includes("wifi") || name.includes("wi-fi")) {
    return (
      <svg
        className="w-4 h-4 mr-1 text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12.55a11 11 0 0 1 14 0" />
        <path d="M8.5 16a6 6 0 0 1 7 0" />
        <path d="M12 20h.01" />
      </svg>
    );
  }

  if (name.includes("ac") || name.includes("air") || name.includes("cool")) {
    return (
      <svg
        className="w-4 h-4 mr-1 text-cyan-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v20" />
        <path d="M4 6l8 4 8-4" />
        <path d="M4 18l8-4 8 4" />
      </svg>
    );
  }

  if (name.includes("food") || name.includes("meal") || name.includes("mess")) {
    return (
      <svg
        className="w-4 h-4 mr-1 text-emerald-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 3h2l1 7v11" />
        <path d="M10 3h2v18" />
        <path d="M16 7a2 2 0 0 1 4 0v11" />
      </svg>
    );
  }

  return null;
};

// --- MAIN COMPONENT ---
const AllPGs = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const locationHook = useLocation();

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Parse URL search parameters
  const query = useMemo(
    () => new URLSearchParams(locationHook.search),
    [locationHook.search]
  );

  // Initial states from URL
  const initialSearch = query.get("search") || "";
  const initialLocation = query.get("location") || "";
  const initialType = query.get("type") || "";
  const initialBudget = getBudgetFromValue(query.get("budget"));
  const initialSortBy = query.get("sort") || "recent";

  // Filters (initialized from URL)
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [pgLocation, setPgLocation] = useState(initialLocation);
  const [selectedBudget, setSelectedBudget] = useState(initialBudget);
  const [type, setType] = useState(initialType);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Update URL when filters change
  const updateUrl = (
    newSearch,
    newLocation,
    newType,
    newBudget,
    newSortBy
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newLocation) params.set("location", newLocation);
    if (newType) params.set("type", newType);
    if (newBudget) params.set("budget", newBudget.value);
    if (newSortBy && newSortBy !== "recent") params.set("sort", newSortBy);

    navigate(`?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    updateUrl(search, pgLocation, type, selectedBudget, sortBy);
  }, [search, pgLocation, type, selectedBudget, sortBy]);

  // Fetch PGs
  const fetchPGs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();
      setPgs(data);
    } catch (err) {
      console.error("PG fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPGs();
  }, []);

  // Filter + sort
  const sortedAndFilteredPGs = useMemo(() => {
    let filtered = [...pgs];

    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (pgLocation.trim()) {
      filtered = filtered.filter((p) =>
        p.location.toLowerCase().includes(pgLocation.toLowerCase())
      );
    }

    if (type) {
      filtered = filtered.filter((p) => p.propertyType === type);
    }

    if (selectedBudget) {
      filtered = filtered.filter((p) => {
        const rent = p.monthlyRent;
        const min = selectedBudget.min || 0;
        const max = selectedBudget.max || Infinity;
        return rent >= min && rent <= max;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "low-high") return a.monthlyRent - b.monthlyRent;
      if (sortBy === "high-low") return b.monthlyRent - a.monthlyRent;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }, [pgs, search, pgLocation, selectedBudget, type, sortBy]);

  const handleClearFilters = () => {
    setSearch("");
    setPgLocation("");
    setSelectedBudget(null);
    setType("");
    setSortBy("recent");
  };

  const isFilterActive = useMemo(
    () => search || pgLocation || type || selectedBudget || sortBy !== "recent",
    [search, pgLocation, type, selectedBudget, sortBy]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        {/* Sidebar placeholder to keep layout consistent */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200" />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex justify-center items-center">
            <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent animate-spin rounded-full" />
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      {/* 📌 DESKTOP SIDEBAR (Collapsible) */}
      <div
        className={`hidden md:flex flex-col transition-all duration-300 bg-white border-r border-gray-200 shadow-sm ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Optional internal collapse button OR just pass prop to Sidebar */}
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {/* 📱 MOBILE SIDEBAR TOGGLE BUTTON */}
      <button
        type="button"
        className="fixed bottom-5 left-4 z-40 md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition"
        onClick={() => setShowMobileSidebar(true)}
      >
        {/* simple menu icon */}
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="12" y2="18" />
        </svg>
      </button>

      {/* 📱 MOBILE SIDEBAR DRAWER */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMobileSidebar(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl border-r border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-800">Menu</span>
              <button
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowMobileSidebar(false)}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar isCollapsed={false} />
            </div>
          </div>
        </div>
      )}

      {/* 👉 RIGHT SIDE (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row gap-8">
            {/* 🌐 Mobile filter toggle */}
            <div className="lg:hidden w-full">
              <div className="flex justify-between items-center mb-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="flex items-center text-blue-700 font-semibold text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                {isFilterActive && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* 🧊 Filter sidebar - light theme */}
            <aside
              className={`lg:w-72 w-full flex-shrink-0 bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6 transition-all duration-300 ${
                showFilters ? "block" : "hidden lg:block"
              } lg:sticky lg:top-24`}
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    PG
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Refine search
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Filter by budget, type & location
                    </p>
                  </div>
                </div>
                {isFilterActive && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Search */}
              <FilterSection title="Search PG Name">
                <input
                  type="text"
                  placeholder="e.g., Green PG, Sunrise Hostel..."
                  className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </FilterSection>

              {/* Location */}
              <FilterSection title="Location Keyword">
                <input
                  type="text"
                  placeholder="e.g., Hinjewadi, Kothrud..."
                  className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  value={pgLocation}
                  onChange={(e) => setPgLocation(e.target.value)}
                />
              </FilterSection>

              {/* Property type */}
              <FilterSection title="Gender / Type">
                <div className="space-y-2 text-sm text-gray-800">
                  {PROPERTY_TYPES.map((opt) => (
                    <label
                      key={opt.value}
                      htmlFor={`type-${opt.value}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        id={`type-${opt.value}`}
                        name="propertyType"
                        type="radio"
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                  <label
                    htmlFor="type-all"
                    className="flex items-center gap-2 cursor-pointer text-gray-600"
                  >
                    <input
                      id="type-all"
                      name="propertyType"
                      type="radio"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={type === ""}
                      onChange={() => setType("")}
                    />
                    <span>All Types</span>
                  </label>
                </div>
              </FilterSection>

              {/* Budget */}
              <FilterSection title="Monthly Budget">
                <div className="space-y-2 text-sm text-gray-800">
                  {BUDGET_RANGES.map((range, index) => (
                    <label
                      key={index}
                      htmlFor={`budget-${index}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        id={`budget-${index}`}
                        name="budgetRange"
                        type="radio"
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        checked={selectedBudget?.value === range.value}
                        onChange={() => setSelectedBudget(range)}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                  <label
                    htmlFor="budget-all"
                    className="flex items-center gap-2 cursor-pointer text-gray-600"
                  >
                    <input
                      id="budget-all"
                      name="budgetRange"
                      type="radio"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={selectedBudget === null}
                      onChange={() => setSelectedBudget(null)}
                    />
                    <span>All Budgets</span>
                  </label>
                </div>
              </FilterSection>
            </aside>

            {/* 🧊 Main content – PG list */}
            <section className="flex-1 min-w-0">
              {/* Top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 pb-3 border-b border-gray-200">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                    PGs for You
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Showing{" "}
                    <span className="font-semibold text-blue-600">
                      {sortedAndFilteredPGs.length}
                    </span>{" "}
                    matching properties
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="hidden sm:inline text-gray-500">
                    Sort by
                  </span>
                  <select
                    id="sortBy"
                    className="border border-gray-300 bg-white text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-xs sm:text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {isFilterActive && (
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-gray-700 mr-1">
                    Active Filters:
                  </span>

                  {search && (
                    <FilterChip
                      label={`Name: ${search}`}
                      onRemove={() => setSearch("")}
                    />
                  )}
                  {pgLocation && (
                    <FilterChip
                      label={`Loc: ${pgLocation}`}
                      onRemove={() => setPgLocation("")}
                    />
                  )}
                  {type && (
                    <FilterChip
                      label={`Type: ${
                        PROPERTY_TYPES.find((t) => t.value === type)?.label
                      }`}
                      onRemove={() => setType("")}
                    />
                  )}
                  {selectedBudget && (
                    <FilterChip
                      label={`Budget: ${selectedBudget.label}`}
                      onRemove={() => setSelectedBudget(null)}
                    />
                  )}
                  {sortBy !== "recent" && (
                    <FilterChip
                      label={`Sort: ${
                        sortBy === "low-high" ? "Price Low" : "Price High"
                      }`}
                      onRemove={() => setSortBy("recent")}
                    />
                  )}

                  <button
                    onClick={handleClearFilters}
                    className="flex items-center text-xs text-red-600 border border-red-200 rounded-full px-3 py-1 bg-red-50 hover:bg-red-100 transition"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Cards */}
              {sortedAndFilteredPGs.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    No results found
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Try changing your filters or{" "}
                    <button
                      onClick={handleClearFilters}
                      className="text-blue-600 underline underline-offset-2"
                    >
                      clear them all
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedAndFilteredPGs.map((pg) => {
                    const hasRatings =
                      Array.isArray(pg.ratings) && pg.ratings.length > 0;
                    const calculatedAvg = hasRatings
                      ? pg.ratings.reduce(
                          (sum, r) => sum + (r.stars || 0),
                          0
                        ) / pg.ratings.length
                      : null;
                    const avgRating = pg.averageRating ?? calculatedAvg;
                    const ratingCount =
                      pg.totalRatings ?? (hasRatings ? pg.ratings.length : 0);

                    const amenities = Array.isArray(pg.amenities)
                      ? pg.amenities.slice(0, 3)
                      : [];

                    return (
                      <Link
                        key={pg._id}
                        to={`/services/pg/${pg._id}`}
                        className="group border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                      >
                        {/* Image */}
                        <div className="relative">
                          <img
                            src={
                              pg.images?.[0]
                                ? `http://localhost:5000${pg.images[0]}`
                                : "https://via.placeholder.com/400x250?text=PG+Image+Not+Available"
                            }
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            alt={pg.title}
                          />
                          {/* Price badge */}
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-white/90 text-blue-700 text-xs font-semibold shadow">
                            ₹{pg.monthlyRent.toLocaleString("en-IN")}/mo
                          </div>
                          {/* Type badge */}
                          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-xs font-semibold text-white shadow-sm">
                            {pg.propertyType === "boys"
                              ? "Boys PG"
                              : pg.propertyType === "girls"
                              ? "Girls PG"
                              : "Co-Ed PG"}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {pg.title}
                          </h3>

                          <p className="text-xs text-gray-600 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-red-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {pg.location}
                          </p>

                          {/* Rating row */}
                          <div className="flex items-center justify-between text-xs">
                            {avgRating ? (
                              <div className="flex items-center text-amber-500">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.62-.921 1.92 0l2.365 7.284a1 1 0 0 0 .95.691h7.668a1 1 0 0 1 .54 1.705l-6.21 4.512a1 1 0 0 0-.364 1.118l2.365 7.284c.3.921-.755 1.688-1.54 1.118l-6.21-4.512a1 1 0 0 0-1.175 0l-6.21 4.512c-.785.57-1.84-.197-1.54-1.118l2.365-7.284a1 1 0 0 0-.364-1.118L2.022 13.917A1 1 0 0 1 2.562 12.212h7.668a1 1 0 0 0 .95-.691l2.365-7.284z" />
                                </svg>
                                <span className="font-semibold">
                                  {avgRating.toFixed(1)}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  ({ratingCount} reviews)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                No ratings yet
                              </span>
                            )}
                          </div>

                          {/* Amenities */}
                          {amenities.length > 0 && (
                            <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
                              {amenities.map((a, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
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

        <Footer />
      </div>
    </div>
  );
};

// Helper Component for Filter Chips
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200 shadow-sm">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition"
    >
      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </span>
);

export default AllPGs;
