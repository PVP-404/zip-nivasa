// src/pages/mess/AllMesses.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getAllMesses } from "../../services/messService";
import { 
  MapPin, SlidersHorizontal, X, Star, Search, Clock, 
  Users, TrendingUp, FilterX, ChevronDown, ChevronUp,
  Utensils, IndianRupee, Sparkles, Grid3X3, List,
  ArrowUpDown, Check, RefreshCw, Home, Filter
} from "lucide-react";

// 🔹 UTILITY FUNCTIONS
const getAvgRating = (mess) => {
  const ratings = Array.isArray(mess.ratings) ? mess.ratings : [];
  return ratings.length 
    ? ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / ratings.length 
    : 0;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

const AllMesses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔹 URL Sync Filters
  const searchText = searchParams.get("search") || "";
  const messType = searchParams.get("type") || "all";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 15000;
  const minRating = Number(searchParams.get("rating")) || 0;
  const sortBy = searchParams.get("sort") || "relevance";
  const amenities = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

  // 🔹 Local state for sliders (for smooth UX)
  const [localPriceRange, setLocalPriceRange] = useState([minPrice, maxPrice]);
  const [localRating, setLocalRating] = useState(minRating);

  // Sync local state with URL params
  useEffect(() => {
    setLocalPriceRange([minPrice, maxPrice]);
    setLocalRating(minRating);
  }, [minPrice, maxPrice, minRating]);

  // 🔹 Debounced filter updates
  const debouncedPriceUpdate = useRef(
    debounce((min, max) => {
      const params = new URLSearchParams(searchParams);
      if (min > 0) params.set("minPrice", min.toString());
      else params.delete("minPrice");
      if (max < 15000) params.set("maxPrice", max.toString());
      else params.delete("maxPrice");
      setSearchParams(params, { replace: true });
    }, 500)
  ).current;

  const debouncedRatingUpdate = useRef(
    debounce((rating) => {
      const params = new URLSearchParams(searchParams);
      if (rating > 0) params.set("rating", rating.toString());
      else params.delete("rating");
      setSearchParams(params, { replace: true });
    }, 300)
  ).current;

  const debouncedSearch = useRef(
    debounce((value) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("search", value);
      else params.delete("search");
      setSearchParams(params, { replace: true });
    }, 300)
  ).current;

  // 🔹 Load data
  const loadMesses = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);
      
      const data = await getAllMesses();
      setMesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading messes:", err);
      setMesses([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMesses();
  }, []);

  // 🔹 Calculate price range from data
  const priceStats = useMemo(() => {
    if (!messes.length) return { min: 0, max: 15000, avg: 7500 };
    const prices = messes.map(m => Number(m.price || 0));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    };
  }, [messes]);

  // 🔹 Sorting options
  const sortOptions = [
    { value: "relevance", label: "Best Match", icon: Sparkles },
    { value: "priceLow", label: "Price: Low to High", icon: TrendingUp },
    { value: "priceHigh", label: "Price: High to Low", icon: TrendingUp },
    { value: "rating", label: "Highest Rated", icon: Star },
    { value: "newest", label: "Newest First", icon: Clock }
  ];

  // 🔹 Mess types
  const messTypes = [
    { value: "all", label: "All Types", count: messes.length },
    { value: "veg", label: "Vegetarian", count: messes.filter(m => m.type?.toLowerCase() === "veg").length },
    { value: "non-veg", label: "Non-Vegetarian", count: messes.filter(m => m.type?.toLowerCase() === "non-veg").length },
    { value: "both", label: "Both", count: messes.filter(m => m.type?.toLowerCase() === "both").length }
  ];

  // 🔹 Optimized filtering + sorting
  const processedMesses = useMemo(() => {
    let filtered = messes
      .filter((m) => {
        const text = searchText.trim().toLowerCase();
        if (!text) return true;
        return (
          (m.title || "").toLowerCase().includes(text) ||
          (m.location || "").toLowerCase().includes(text) ||
          (m.streetAddress || "").toLowerCase().includes(text) ||
          (m.mapplsAddress || "").toLowerCase().includes(text)
        );
      })
      .filter((m) => messType === "all" || (m.type || "").toLowerCase() === messType.toLowerCase())
      .filter((m) => {
        const price = Number(m.price || 0);
        return price >= minPrice && price <= maxPrice;
      })
      .filter((m) => getAvgRating(m) >= minRating);

    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return Number(a.price || 0) - Number(b.price || 0);
        case "priceHigh":
          return Number(b.price || 0) - Number(a.price || 0);
        case "rating":
          return getAvgRating(b) - getAvgRating(a);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [messes, searchText, messType, minPrice, maxPrice, minRating, sortBy]);

  // 🔹 Filter management
  const updateFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === "" || value === "all" || value === 0 || value === 15000) {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setLocalPriceRange([0, 15000]);
    setLocalRating(0);
  }, [setSearchParams]);

  const activeFiltersCount = useMemo(() => {
    return (searchText ? 1 : 0) + 
           (messType !== "all" ? 1 : 0) + 
           (minPrice > 0 || maxPrice < 15000 ? 1 : 0) + 
           (minRating > 0 ? 1 : 0);
  }, [searchText, messType, minPrice, maxPrice, minRating]);

  // Handle price slider change
  const handlePriceChange = (type, value) => {
    const newRange = [...localPriceRange];
    if (type === 'min') {
      newRange[0] = Math.min(value, newRange[1] - 500);
    } else {
      newRange[1] = Math.max(value, newRange[0] + 500);
    }
    setLocalPriceRange(newRange);
    debouncedPriceUpdate(newRange[0], newRange[1]);
  };

  // Handle rating change
  const handleRatingChange = (value) => {
    setLocalRating(value);
    debouncedRatingUpdate(value);
  };

  if (initialLoad) {
    return <InitialLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Mobile Filter Overlay */}
      <MobileFilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={{ searchText, messType, localPriceRange, localRating, sortBy }}
        messTypes={messTypes}
        priceStats={priceStats}
        sortOptions={sortOptions}
        onPriceChange={handlePriceChange}
        onRatingChange={handleRatingChange}
        onUpdateFilter={updateFilter}
        onClearAll={clearAllFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <main className="flex">
        {/* 🔹 LEFT SIDEBAR - Desktop */}
        <aside className="hidden lg:block w-80 xl:w-96 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-slate-200 bg-white">
          <FilterSidebar
            filters={{ searchText, messType, localPriceRange, localRating, sortBy }}
            messTypes={messTypes}
            priceStats={priceStats}
            sortOptions={sortOptions}
            onPriceChange={handlePriceChange}
            onRatingChange={handleRatingChange}
            onUpdateFilter={updateFilter}
            onClearAll={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
            processedCount={processedMesses.length}
            totalCount={messes.length}
          />
        </aside>

        {/* 🔹 MAIN CONTENT */}
        <div className="flex-1 min-h-screen">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    defaultValue={searchText}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    placeholder="Search by name, location, area..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  {searchText && (
                    <button
                      onClick={() => {
                        updateFilter("search", "");
                        document.querySelector('input[placeholder*="Search"]').value = '';
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <SortDropdown
                    value={sortBy}
                    options={sortOptions}
                    onChange={(value) => updateFilter("sort", value)}
                  />

                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "grid" 
                          ? "bg-white shadow-sm text-emerald-600" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "list" 
                          ? "bg-white shadow-sm text-emerald-600" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={() => loadMesses(true)}
                    disabled={isRefreshing}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Showing</span>
                  <span className="font-bold text-emerald-600">{processedMesses.length}</span>
                  <span className="text-slate-600">of</span>
                  <span className="font-bold text-slate-900">{messes.length}</span>
                  <span className="text-slate-600">messes</span>
                </div>
                
                {/* Active Filters Chips */}
                <ActiveFiltersChips
                  filters={{ searchText, messType, minPrice, maxPrice, minRating }}
                  onUpdateFilter={updateFilter}
                  onClearAll={clearAllFilters}
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="p-4 sm:p-6 lg:p-8">
            {loading ? (
              <LoadingGrid viewMode={viewMode} />
            ) : processedMesses.length === 0 ? (
              <NoResults onClearFilters={clearAllFilters} />
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
              }>
                {processedMesses.map((mess, index) => (
                  viewMode === "grid" ? (
                    <MessCard key={mess._id} mess={mess} index={index} />
                  ) : (
                    <MessListCard key={mess._id} mess={mess} index={index} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllMesses;

// ============================================
// 🔹 FILTER SIDEBAR COMPONENT
// ============================================

const FilterSidebar = ({ 
  filters, 
  messTypes, 
  priceStats, 
  sortOptions,
  onPriceChange, 
  onRatingChange,
  onUpdateFilter, 
  onClearAll,
  activeFiltersCount,
  processedCount,
  totalCount
}) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    price: true,
    rating: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {processedCount} of {totalCount} results
              </p>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Mess Type */}
        <FilterSection
          title="Mess Type"
          icon={<Utensils className="w-4 h-4" />}
          isExpanded={expandedSections.type}
          onToggle={() => toggleSection('type')}
        >
          <div className="space-y-2">
            {messTypes.map((type) => (
              <label
                key={type.value}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  filters.messType === type.value
                    ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm'
                    : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    filters.messType === type.value
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-300'
                  }`}>
                    {filters.messType === type.value && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    filters.messType === type.value ? 'text-emerald-700' : 'text-slate-700'
                  }`}>
                    {type.label}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filters.messType === type.value
                    ? 'bg-emerald-200 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {type.count}
                </span>
                <input
                  type="radio"
                  name="messType"
                  value={type.value}
                  checked={filters.messType === type.value}
                  onChange={(e) => onUpdateFilter("type", e.target.value)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon={<IndianRupee className="w-4 h-4" />}
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
          badge={filters.localPriceRange[0] > 0 || filters.localPriceRange[1] < 15000 ? 'Active' : null}
        >
          <div className="space-y-6">
            {/* Price Display */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Min</div>
                <div className="text-lg font-bold text-slate-900">
                  {formatPrice(filters.localPriceRange[0])}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-px bg-slate-300" />
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Max</div>
                <div className="text-lg font-bold text-slate-900">
                  {formatPrice(filters.localPriceRange[1])}
                </div>
              </div>
            </div>

            {/* Dual Range Slider */}
            <div className="relative pt-2 pb-4">
              {/* Track Background */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-200 rounded-full -translate-y-1/2" />
              
              {/* Active Track */}
              <div 
                className="absolute top-1/2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full -translate-y-1/2"
                style={{
                  left: `${(filters.localPriceRange[0] / 15000) * 100}%`,
                  right: `${100 - (filters.localPriceRange[1] / 15000) * 100}%`
                }}
              />

              {/* Min Slider */}
              <input
                type="range"
                min="0"
                max="15000"
                step="500"
                value={filters.localPriceRange[0]}
                onChange={(e) => onPriceChange('min', Number(e.target.value))}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
              />
              
              {/* Max Slider */}
              <input
                type="range"
                min="0"
                max="15000"
                step="500"
                value={filters.localPriceRange[1]}
                onChange={(e) => onPriceChange('max', Number(e.target.value))}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
              />
            </div>

            {/* Quick Price Options */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Under ₹3,000", min: 0, max: 3000 },
                { label: "₹3,000 - ₹5,000", min: 3000, max: 5000 },
                { label: "₹5,000 - ₹8,000", min: 5000, max: 8000 },
                { label: "₹8,000+", min: 8000, max: 15000 }
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    onPriceChange('min', option.min);
                    setTimeout(() => onPriceChange('max', option.max), 10);
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                    filters.localPriceRange[0] === option.min && filters.localPriceRange[1] === option.max
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection
          title="Minimum Rating"
          icon={<Star className="w-4 h-4" />}
          isExpanded={expandedSections.rating}
          onToggle={() => toggleSection('rating')}
          badge={filters.localRating > 0 ? `${filters.localRating}+` : null}
        >
          <div className="space-y-4">
            {/* Star Selection */}
            <div className="flex items-center justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onRatingChange(rating)}
                  className={`flex-1 p-3 rounded-xl text-center transition-all ${
                    filters.localRating === rating
                      ? 'bg-yellow-100 border-2 border-yellow-400 shadow-sm'
                      : 'bg-slate-100 border-2 border-transparent hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {rating > 0 ? (
                      <>
                        <Star className={`w-4 h-4 ${
                          filters.localRating === rating 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-slate-400'
                        }`} />
                        <span className={`text-sm font-bold ${
                          filters.localRating === rating ? 'text-yellow-700' : 'text-slate-600'
                        }`}>
                          {rating}+
                        </span>
                      </>
                    ) : (
                      <span className={`text-sm font-medium ${
                        filters.localRating === rating ? 'text-yellow-700' : 'text-slate-500'
                      }`}>
                        Any
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Rating Description */}
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {filters.localRating === 0 ? (
                  <span>Showing all ratings</span>
                ) : (
                  <span>Showing {filters.localRating}+ star messes only</span>
                )}
              </div>
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      {activeFiltersCount > 0 && (
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClearAll}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FilterX className="w-4 h-4" />
            Clear All Filters ({activeFiltersCount})
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🔹 FILTER SECTION COMPONENT
// ============================================

const FilterSection = ({ title, icon, isExpanded, onToggle, badge, children }) => (
  <div className="border border-slate-200 rounded-2xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-emerald-600">{icon}</div>
        <span className="font-semibold text-slate-900">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
    </button>
    {isExpanded && (
      <div className="p-4 pt-0 bg-white">
        {children}
      </div>
    )}
  </div>
);

// ============================================
// 🔹 MOBILE FILTER SIDEBAR
// ============================================

const MobileFilterSidebar = ({
  isOpen,
  onClose,
  filters,
  messTypes,
  priceStats,
  sortOptions,
  onPriceChange,
  onRatingChange,
  onUpdateFilter,
  onClearAll,
  activeFiltersCount
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar
            filters={filters}
            messTypes={messTypes}
            priceStats={priceStats}
            sortOptions={sortOptions}
            onPriceChange={onPriceChange}
            onRatingChange={onRatingChange}
            onUpdateFilter={onUpdateFilter}
            onClearAll={onClearAll}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="w-full py-3 px-4 bg-slate-100 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all"
            >
              Clear All ({activeFiltersCount})
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-emerald-500 rounded-2xl text-sm font-semibold text-white hover:bg-emerald-600 transition-all"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================
// 🔹 SORT DROPDOWN
// ============================================

const SortDropdown = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
      >
        <ArrowUpDown className="w-4 h-4 text-slate-500" />
        <span className="hidden sm:inline">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  value === option.value
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <option.icon className={`w-4 h-4 ${
                  value === option.value ? 'text-emerald-500' : 'text-slate-400'
                }`} />
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🔹 ACTIVE FILTERS CHIPS
// ============================================

const ActiveFiltersChips = ({ filters, onUpdateFilter, onClearAll }) => {
  const chips = [];
  
  if (filters.searchText) {
    chips.push({ key: 'search', label: `"${filters.searchText}"`, clearValue: '' });
  }
  if (filters.messType !== 'all') {
    chips.push({ key: 'type', label: filters.messType, clearValue: 'all' });
  }
  if (filters.minPrice > 0 || filters.maxPrice < 15000) {
    chips.push({ 
      key: 'price', 
      label: `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`,
      clearValue: null 
    });
  }
  if (filters.minRating > 0) {
    chips.push({ key: 'rating', label: `${filters.minRating}★+`, clearValue: 0 });
  }

  if (!chips.length) return null;

  return (
    <div className="hidden md:flex items-center gap-2 flex-wrap">
      {chips.slice(0, 3).map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700"
        >
          {chip.label}
          <button
            onClick={() => {
              if (chip.key === 'price') {
                onUpdateFilter('minPrice', 0);
                onUpdateFilter('maxPrice', 15000);
              } else {
                onUpdateFilter(chip.key, chip.clearValue);
              }
            }}
            className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {chips.length > 3 && (
        <span className="text-xs text-slate-500">+{chips.length - 3} more</span>
      )}
    </div>
  );
};

// ============================================
// 🔹 MESS CARD - GRID VIEW
// ============================================

const MessCard = ({ mess, index }) => {
  const avgRating = getAvgRating(mess);
  const ratingCount = Array.isArray(mess.ratings) ? mess.ratings.length : 0;
  const address = mess.mapplsAddress || mess.streetAddress || mess.location || "Location available";

  return (
    <Link
      to={`/mess/${mess._id}`}
      className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-300/50 hover:-translate-y-1 transition-all duration-300"
      style={{ 
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards'
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {mess.images?.[0] ? (
          <img
            src={mess.images[0]}
            alt={mess.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-12 h-12 text-slate-300" />
          </div>
        )}
        
        {/* Type Badge */}
        {mess.type && (
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
              mess.type.toLowerCase() === 'veg' 
                ? 'bg-green-500/90 text-white'
                : mess.type.toLowerCase() === 'non-veg'
                ? 'bg-red-500/90 text-white'
                : 'bg-white/90 text-slate-700'
            }`}>
              {mess.type}
            </span>
          </div>
        )}

        {/* Rating Badge */}
        {avgRating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-slate-900">{avgRating.toFixed(1)}</span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg text-center">
            <span className="text-lg font-bold text-emerald-600">{formatPrice(mess.price || 0)}</span>
            <span className="text-xs text-slate-500">/month</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {mess.title}
        </h3>
        
        <div className="flex items-start gap-2 text-sm text-slate-600 mb-4">
          <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{address}</span>
        </div>

        {/* Today's Special */}
        {mess.specialToday?.lunch && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
            <div className="flex items-start gap-2 text-xs text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <span className="font-semibold">Today's Special: </span>
                <span className="line-clamp-1">{mess.specialToday.lunch}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            {avgRating > 0 ? (
              <>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
                <span className="text-slate-400">({ratingCount})</span>
              </>
            ) : (
              <span className="text-slate-400">No reviews</span>
            )}
          </div>
          <span className="text-sm font-semibold text-emerald-600 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// 🔹 MESS CARD - LIST VIEW
// ============================================

const MessListCard = ({ mess, index }) => {
  const avgRating = getAvgRating(mess);
  const ratingCount = Array.isArray(mess.ratings) ? mess.ratings.length : 0;
  const address = mess.mapplsAddress || mess.streetAddress || mess.location || "Location available";

  return (
    <Link
      to={`/mess/${mess._id}`}
      className="group flex gap-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300/50 transition-all duration-300 p-4"
      style={{ 
        animationDelay: `${index * 30}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards'
      }}
    >
      {/* Image */}
      <div className="relative w-48 h-36 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {mess.images?.[0] ? (
          <img
            src={mess.images[0]}
            alt={mess.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-8 h-8 text-slate-300" />
          </div>
        )}
        
        {mess.type && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              mess.type.toLowerCase() === 'veg' 
                ? 'bg-green-500 text-white'
                : mess.type.toLowerCase() === 'non-veg'
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-700'
            }`}>
              {mess.type}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {mess.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-emerald-600">{formatPrice(mess.price || 0)}</div>
              <div className="text-xs text-slate-500">per month</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="line-clamp-1">{address}</span>
          </div>

          {mess.specialToday?.lunch && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full text-xs text-amber-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{mess.specialToday.lunch}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {avgRating > 0 ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-yellow-700">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-yellow-600">({ratingCount})</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400">No reviews yet</span>
            )}
          </div>
          <span className="text-sm font-semibold text-emerald-600 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// 🔹 LOADING STATES
// ============================================

const InitialLoadingSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="h-16 bg-white border-b border-slate-200" />
    <div className="flex">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-80 xl:w-96 h-screen bg-white border-r border-slate-200 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-slate-200 rounded-lg w-1/2" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-12 bg-white rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-lg w-full" />
                  <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LoadingGrid = ({ viewMode }) => (
  <div className={
    viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
      : "flex flex-col gap-4"
  }>
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div 
        key={i} 
        className={`bg-white rounded-3xl overflow-hidden animate-pulse ${
          viewMode === 'list' ? 'flex gap-6 p-4' : ''
        }`}
      >
        <div className={viewMode === 'list' ? 'w-48 h-36 bg-slate-200 rounded-xl' : 'h-48 bg-slate-200'} />
        <div className={`p-5 space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-100 rounded-lg w-full" />
          <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// 🔹 NO RESULTS
// ============================================

const NoResults = ({ onClearFilters }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <Search className="w-10 h-10 text-slate-400" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-2">No messes found</h3>
    <p className="text-slate-500 text-center max-w-md mb-6">
      We couldn't find any messes matching your current filters. 
      Try adjusting your search criteria or clear all filters.
    </p>
    <button
      onClick={onClearFilters}
      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-semibold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
    >
      <FilterX className="w-5 h-5" />
      Clear All Filters
    </button>
  </div>
);

// ============================================
// 🔹 ANIMATIONS (add to your global CSS)
// ============================================
/*
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
*/