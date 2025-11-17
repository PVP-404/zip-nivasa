// ✅ frontend/src/pages/pgs/AllPGs.jsx (Glassmorphism + Optimised + Real Rating + UX Improvements)

import React, { useEffect, useState, useMemo } from "react";
// Import useNavigate and useLocation for URL manipulation
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// --- Constants ---
const BUDGET_RANGES = [
  { label: "Below ₹5,000", max: 5000, value: "0-5000" }, // Added 'value' for URL
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
  return BUDGET_RANGES.find(range => range.value === value) || null;
};

// Small wrapper for filter blocks
const FilterSection = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

// Helper: amenity → icon (KEPT AS IS)
const AmenityIcon = ({ label }) => {
  const name = label.toLowerCase();
  // ... (Your existing AmenityIcon logic)
  if (name.includes("wifi") || name.includes("wi-fi")) {
    return (
      <svg
        className="w-4 h-4 mr-1 text-indigo-500"
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

const AllPGs = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const locationHook = useLocation();

  // Parse URL search parameters on component mount or URL change
  const query = useMemo(() => new URLSearchParams(locationHook.search), [locationHook.search]);

  // Initial states from URL
  const initialSearch = query.get("search") || "";
  const initialLocation = query.get("location") || "";
  const initialType = query.get("type") || "";
  const initialBudget = getBudgetFromValue(query.get("budget"));
  const initialSortBy = query.get("sort") || "recent";

  // Filters (Now initialized from URL)
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [pgLocation, setPgLocation] = useState(initialLocation); // Renamed to avoid conflict with `locationHook`
  const [selectedBudget, setSelectedBudget] = useState(initialBudget);
  const [type, setType] = useState(initialType);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Function to update the URL based on current state
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
    if (newBudget) params.set("budget", newBudget.value); // Use the 'value' for URL
    if (newSortBy && newSortBy !== "recent") params.set("sort", newSortBy); // Only set if not default
    
    // Replace the current history entry to avoid cluttering the back button
    navigate(`?${params.toString()}`, { replace: true }); 
  };
  
  // Effect to sync state changes to URL
  useEffect(() => {
    updateUrl(search, pgLocation, type, selectedBudget, sortBy);
  }, [search, pgLocation, type, selectedBudget, sortBy]);


  // Fetch PGs (KEPT AS IS)
  const fetchPGs = async () => {
    setLoading(true);
    try {
      // NOTE: For a real-world app, you might want to fetch pgs based on initial URL parameters here
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

  // Filter + sort (memoised) - Uses pgLocation
  const sortedAndFilteredPGs = useMemo(() => {
    let filtered = [...pgs];

    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (pgLocation.trim()) { // Used pgLocation
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
  }, [pgs, search, pgLocation, selectedBudget, type, sortBy]); // Added pgLocation

  const handleClearFilters = () => {
    // Note: URL effect will handle the actual URL update
    setSearch("");
    setPgLocation(""); // Updated
    setSelectedBudget(null);
    setType("");
    setSortBy("recent");
  };

  const isFilterActive = useMemo(() => {
    return (
      search || pgLocation || type || selectedBudget || sortBy !== "recent"
    );
  }, [search, pgLocation, type, selectedBudget, sortBy]);

  if (loading) {
    // ... (Your existing loading component)
     return (
      <div className="flex flex-col min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <Header />
        <div className="flex flex-1 justify-center items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/70 border-t-transparent animate-spin rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col lg:flex-row gap-8">
          {/* 🌐 Mobile filter toggle (KEPT AS IS) */}
          <div className="lg:hidden w-full">
            <div className="flex justify-between items-center mb-4 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md shadow-lg">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="flex items-center text-indigo-100 font-semibold text-sm"
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
              {/* Only show 'Clear All' if a filter is active */}
              {isFilterActive && ( 
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-slate-200/80 hover:text-indigo-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* 🧊 Filter sidebar (glass, sticky on desktop) */}
          <aside
            className={`lg:w-72 w-full flex-shrink-0 bg-white/10 border border-white/15 shadow-xl rounded-2xl p-6 backdrop-blur-xl space-y-6 transition-all duration-300 ${
              showFilters ? "block" : "hidden lg:block"
            } lg:sticky lg:top-24`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/90 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  PG
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Refine search
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    Filter by budget, type & location
                  </p>
                </div>
              </div>
              {/* Only show 'Reset' if a filter is active */}
              {isFilterActive && ( 
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-indigo-200 hover:text-white"
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
                className="w-full border border-white/20 bg-white/5 text-slate-100 placeholder-slate-400 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FilterSection>

            {/* Location */}
            <FilterSection title="Location Keyword">
              <input
                type="text"
                placeholder="e.g., Hinjewadi, Kothrud..."
                className="w-full border border-white/20 bg-white/5 text-slate-100 placeholder-slate-400 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                value={pgLocation} // Used pgLocation
                onChange={(e) => setPgLocation(e.target.value)} // Used setPgLocation
              />
            </FilterSection>

            {/* Property type */}
            <FilterSection title="Gender / Type">
              <div className="space-y-2 text-sm text-slate-100">
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
                      className="h-3.5 w-3.5 text-indigo-400 border-white/30 bg-transparent focus:ring-indigo-400"
                      checked={type === opt.value}
                      onChange={() => setType(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
                <label
                  htmlFor="type-all"
                  className="flex items-center gap-2 cursor-pointer text-slate-300"
                >
                  <input
                    id="type-all"
                    name="propertyType"
                    type="radio"
                    className="h-3.5 w-3.5 text-indigo-400 border-white/30 bg-transparent focus:ring-indigo-400"
                    checked={type === ""}
                    onChange={() => setType("")}
                  />
                  <span>All Types</span>
                </label>
              </div>
            </FilterSection>

            {/* Budget */}
            <FilterSection title="Monthly Budget">
              <div className="space-y-2 text-sm text-slate-100">
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
                      className="h-3.5 w-3.5 text-indigo-400 border-white/30 bg-transparent focus:ring-indigo-400"
                      checked={selectedBudget?.value === range.value} // Compare by 'value'
                      onChange={() => setSelectedBudget(range)}
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
                <label
                  htmlFor="budget-all"
                  className="flex items-center gap-2 cursor-pointer text-slate-300"
                >
                  <input
                    id="budget-all"
                    name="budgetRange"
                    type="radio"
                    className="h-3.5 w-3.5 text-indigo-400 border-white/30 bg-transparent focus:ring-indigo-400"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 pb-3 border-b border-white/10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50 tracking-tight">
                  PGs for You
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Showing{" "}
                  <span className="font-semibold text-indigo-200">
                    {sortedAndFilteredPGs.length}
                  </span>{" "}
                  matching properties
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="hidden sm:inline text-slate-300">Sort by</span>
                <select
                  id="sortBy"
                  className="border border-white/20 bg-white/10 text-slate-500 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-xs sm:text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* **UX Improvement: Filter Status/Chips** */}
            {isFilterActive && (
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-200 mr-2">
                  Active Filters:
                </span>
                
                {search && <FilterChip label={`Name: ${search}`} onRemove={() => setSearch("")} />}
                {pgLocation && <FilterChip label={`Loc: ${pgLocation}`} onRemove={() => setPgLocation("")} />}
                {type && <FilterChip label={`Type: ${PROPERTY_TYPES.find(t => t.value === type)?.label}`} onRemove={() => setType("")} />}
                {selectedBudget && <FilterChip label={`Budget: ${selectedBudget.label}`} onRemove={() => setSelectedBudget(null)} />}
                {sortBy !== "recent" && <FilterChip label={`Sort: ${sortBy === 'low-high' ? 'Price Low' : 'Price High'}`} onRemove={() => setSortBy("recent")} />}

                <button
                  onClick={handleClearFilters}
                  className="flex items-center text-xs text-red-300 border border-red-500/30 rounded-full px-3 py-1 bg-red-900/30 hover:bg-red-900/50 transition duration-150"
                >
                  Clear All
                </button>
              </div>
            )}
            {/* **End UX Improvement** */}


            {/* Cards (KEPT AS IS) */}
            {sortedAndFilteredPGs.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-semibold text-slate-100 mb-2">
                  No results found
                </h2>
                <p className="text-slate-300 text-sm">
                  Try changing your filters or{" "}
                  <button
                    onClick={handleClearFilters}
                    className="text-indigo-200 underline underline-offset-2"
                  >
                    clear them all
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* ... (Your existing PG card map logic) */}
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
                      className="group border border-white/15 bg-white/5 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl hover:bg-white/10"
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
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-950/80 text-indigo-100 text-xs font-semibold shadow-lg border border-white/15">
                          ₹{pg.monthlyRent.toLocaleString("en-IN")}/mo
                        </div>
                        {/* Type badge */}
                        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-slate-800 backdrop-blur">
                          {pg.propertyType === "boys"
                            ? "Boys PG"
                            : pg.propertyType === "girls"
                            ? "Girls PG"
                            : "Co-Ed PG"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-slate-50 line-clamp-1">
                          {pg.title}
                        </h3>

                        <p className="text-xs text-slate-300 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 text-red-300"
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
                            <div className="flex items-center text-amber-300">
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
                              <span className="text-slate-300 ml-1">
                                ({ratingCount} reviews)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic">
                              No ratings yet
                            </span>
                          )}
                        </div>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2 text-xs">
                            {amenities.map((a, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-slate-100 border border-white/15"
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
      {/* Helper component for filter chips */}
      <FilterChip /> 
    </>
  );
};

// **New Helper Component for Filter Chips**
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-100 bg-indigo-500/80 rounded-full border border-indigo-400/50 shadow-md">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-100/70 hover:text-white hover:bg-indigo-600/70 transition duration-150"
    >
      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </span>
);

export default AllPGs;