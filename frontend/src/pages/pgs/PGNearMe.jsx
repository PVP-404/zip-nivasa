// frontend/src/pages/pgs/PGNearMe.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Maximize2, SlidersHorizontal, TrendingUp, TrendingDown, Navigation } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LeafletMap from "../../components/maps/LeafletMap";
import { fetchPGsNearMe } from "../../services/pgService";

const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567, address: "Pune, Maharashtra, India" }; 

const PGNearMe = () => {
  const [radiusKm, setRadiusKm] = useState(5);
  const [searchCenter, setSearchCenter] = useState(DEFAULT_CENTER);
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSearchArea, setCurrentSearchArea] = useState(DEFAULT_CENTER.address);
  
  // Enhanced UX states
  const [hoveredPgId, setHoveredPgId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("distance");
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 100000 });

  const fetchPGData = useCallback(async (center, radius) => {
    if (!center?.lat || !center?.lng) return;

    setLoading(true);
    try {
      const res = await fetchPGsNearMe(center.lat, center.lng, radius);
      setPgs(res.data.pgs || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch nearby PGs. Please check your network and try again.");
      setPgs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentSearchArea(searchCenter.address || 'Unknown Location');
    fetchPGData(searchCenter, radiusKm);
  }, [searchCenter, radiusKm, fetchPGData]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in this browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCenter = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          address: "Your Current Location",
        };
        setSearchCenter(newCenter); 
      },
      (err) => {
        console.error(err);
        setLoading(false);
        alert("Please allow location access to find PGs near you.");
      }
    );
  };
  
  const handleMapCenterChange = (newCenter) => {
    setSearchCenter(newCenter);
  };

  // Filter and sort PGs
  const filteredAndSortedPgs = pgs
    .filter(pg => pg.monthlyRent >= priceFilter.min && pg.monthlyRent <= priceFilter.max)
    .sort((a, b) => {
      if (sortBy === "distance") return (a.distanceKm || 0) - (b.distanceKm || 0);
      if (sortBy === "price-low") return a.monthlyRent - b.monthlyRent;
      if (sortBy === "price-high") return b.monthlyRent - a.monthlyRent;
      return 0;
    });

  const markers = [
    ...(searchCenter
      ? [
          {
            id: "me",
            lat: searchCenter.lat,
            lng: searchCenter.lng,
            title: searchCenter.address || "You are searching here",
            address: "",
            isCenter: true,
          },
        ]
      : []),
    ...filteredAndSortedPgs
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({
        id: p._id,
        lat: p.latitude,
        lng: p.longitude,
        title: p.title,
        address: p.address,
        extra: { monthlyRent: p.monthlyRent },
        isHighlighted: hoveredPgId === p._id,
      })),
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            
            {/* Enhanced Control Bar with Glassmorphism */}
            <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl border border-white/50 p-5 mb-6 transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Title Section with Gradient */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg transform transition-transform hover:scale-110">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        PGs Near {searchCenter.address ? searchCenter.address.split(',')[0] : 'Search Area'}
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="font-semibold text-indigo-600">{filteredAndSortedPgs.length}</span> result{filteredAndSortedPgs.length !== 1 ? 's' : ''} within <span className="font-semibold text-indigo-600">{radiusKm} km</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Radius Slider */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-sm text-gray-700 font-semibold whitespace-nowrap">
                      Radius:
                    </label>
                    <input
                      type="range"
                      value={radiusKm}
                      min={1}
                      max={15}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-20 sm:w-24 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 rounded-lg min-w-[60px] text-center shadow-sm">
                      {radiusKm} km
                    </span>
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      showFilters 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Location Button */}
                  <button
                    onClick={handleUseMyLocation}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Locating...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        My Location
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sort Options */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      >
                        <option value="distance">Distance (Nearest First)</option>
                        <option value="price-low">Price (Low to High)</option>
                        <option value="price-high">Price (High to Low)</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Max Price: ₹{priceFilter.max.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100000}
                        step={1000}
                        value={priceFilter.max}
                        onChange={(e) => setPriceFilter({ ...priceFilter, max: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content: Map & List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
              {/* Left: Map */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 overflow-hidden transform transition-all hover:shadow-2xl">
                <div className="w-full h-[600px] relative rounded-xl overflow-hidden">
                  <LeafletMap
                    center={searchCenter}
                    markers={markers}
                    radiusKm={radiusKm}
                    onCenterChange={handleMapCenterChange}
                    hoveredMarkerId={hoveredPgId}
                  />
                </div>
              </div>

              {/* Right: List */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 flex flex-col max-h-[600px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Search className="w-4 h-4 text-indigo-600" />
                    </div>
                    Listings
                  </h2>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                    {filteredAndSortedPgs.length} PG{filteredAndSortedPgs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {loading && pgs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-medium text-indigo-600">
                        Loading PGs near {searchCenter.address.split(',')[0]}...
                      </p>
                    </div>
                  ) : filteredAndSortedPgs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                      <div className="p-4 bg-white rounded-full shadow-md mb-4">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-bold text-gray-900 mb-2">No PGs Found</p>
                      <p className="text-sm text-gray-500 max-w-xs">
                        Try increasing the radius or adjusting your filters
                      </p>
                    </div>
                  ) : (
                    filteredAndSortedPgs.map((pg, index) => (
                      <div
                        key={pg._id}
                        onMouseEnter={() => setHoveredPgId(pg._id)}
                        onMouseLeave={() => setHoveredPgId(null)}
                        className={`group relative border-2 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 transition-all duration-200 cursor-pointer ${
                          hoveredPgId === pg._id
                            ? "border-indigo-500 shadow-lg scale-[1.02] bg-gradient-to-br from-indigo-50 to-white"
                            : "border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Rank Badge */}
                        <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                          {index + 1}
                        </div>

                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-base text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                              {pg.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {pg.address}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end shrink-0">
                            <p className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              ₹{pg.monthlyRent.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">per month</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <p className="text-xs text-green-700 font-bold">
                              {pg.distanceKm?.toFixed(1)} km
                            </p>
                          </div>
                          <Link
                            to={`/services/pg/${pg._id}`}
                            className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors flex items-center gap-1 group-hover:gap-2 transition-all"
                          >
                            View Details
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    Distances calculated using Haversine formula • Results may vary
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #9333ea);
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PGNearMe;