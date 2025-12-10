// src/pages/pgs/PGNearMe.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Navigation,
  ChevronDown,
  ChevronRight,
  BedDouble,
  Utensils,
} from "lucide-react";

import Header from "../../components/Header";
import LeafletMap from "../../components/maps/LeafletMap";
import { fetchPGsNearMe } from "../../services/pgService";
import { fetchMessesNearMe } from "../../services/messService";

const DEFAULT_CENTER = {
  lat: 18.5204,
  lng: 73.8567,
  address: "Pune, Maharashtra, India",
};

const PGNearMe = () => {
  const [radiusKm, setRadiusKm] = useState(5);
  const [searchCenter, setSearchCenter] = useState(DEFAULT_CENTER);

  // Raw data from APIs
  const [pgs, setPgs] = useState([]);
  const [messes, setMesses] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("distance");
  const [priceFilter, setPriceFilter] = useState({ max: 100000 });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [hoveredCardKey, setHoveredCardKey] = useState(null);

  // PG / Mess / Both
  const [viewMode, setViewMode] = useState("pg"); // 'pg' | 'mess' | 'both'

  const fetchNearbyData = useCallback(
    async (center, radius) => {
      if (!center?.lat || !center?.lng) return;

      setLoading(true);
      try {
        const [pgRes, messRes] = await Promise.all([
          fetchPGsNearMe(center.lat, center.lng, radius),
          fetchMessesNearMe(center.lat, center.lng, radius),
        ]);

        const pgData = pgRes?.data?.pgs || pgRes?.pgs || [];
        const messData = messRes?.data?.messes || messRes?.messes || [];

        setPgs(pgData);
        setMesses(messData);
      } catch (err) {
        console.error("Error fetching nearby data:", err);
        alert(
          "Failed to fetch nearby results. Please check your network and try again."
        );
        setPgs([]);
        setMesses([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNearbyData(searchCenter, radiusKm);
  }, [searchCenter, radiusKm, fetchNearbyData]);

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
        alert("Please allow location access to find places near you.");
      }
    );
  };

  const handleMapCenterChange = (newCenter) => {
    setSearchCenter(newCenter);
  };

  const sortItems = (arr, type) => {
    return [...arr].sort((a, b) => {
      const aPrice =
        type === "pg"
          ? a.monthlyRent ?? 0
          : type === "mess"
          ? a.price ?? 0
          : 0;
      const bPrice =
        type === "pg"
          ? b.monthlyRent ?? 0
          : type === "mess"
          ? b.price ?? 0
          : 0;

      const aDist = a.distanceKm ?? 0;
      const bDist = b.distanceKm ?? 0;

      if (sortBy === "distance") return aDist - bDist;
      if (sortBy === "price-low") return aPrice - bPrice;
      if (sortBy === "price-high") return bPrice - aPrice;
      return 0;
    });
  };

  const filteredPGs = sortItems(
    pgs.filter(
      (pg) =>
        (pg.monthlyRent ?? 0) <= (priceFilter.max ?? 100000)
    ),
    "pg"
  );

  const filteredMesses = sortItems(
    messes.filter(
      (m) => (m.price ?? 0) <= (priceFilter.max ?? 100000)
    ),
    "mess"
  );

  const visiblePGs =
    viewMode === "mess" ? [] : filteredPGs;

  const visibleMesses =
    viewMode === "pg" ? [] : filteredMesses;

  const totalVisibleCount = visiblePGs.length + visibleMesses.length;

  const markers = [
    ...(searchCenter
      ? [
          {
            id: "center",
            lat: searchCenter.lat,
            lng: searchCenter.lng,
            title: searchCenter.address || "Search Area",
            address: "",
            isCenter: true,
          },
        ]
      : []),
    ...visiblePGs
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({
        id: `pg-${p._id}`,
        lat: p.latitude,
        lng: p.longitude,
        title: p.title,
        address: p.address || p.location,
        extra: { monthlyRent: p.monthlyRent },
        type: "pg",
      })),
    ...visibleMesses
      .filter((m) => m.latitude && m.longitude)
      .map((m) => ({
        id: `mess-${m._id}`,
        lat: m.latitude,
        lng: m.longitude,
        title: m.title,
        address: m.mapplsAddress || m.streetAddress || m.location,
        extra: { monthlyRent: m.price },
        type: "mess",
      })),
  ];

  const ViewModeButton = ({ value, label, icon }) => (
    <button
      type="button"
      onClick={() => setViewMode(value)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
        viewMode === value
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 relative overflow-hidden">
          {/* Top small badge */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
            <div className="px-3 py-1.5 rounded-full bg-white/95 shadow-lg border border-gray-200 text-xs text-gray-700 flex items-center gap-2">
              <span className="font-semibold">
                {totalVisibleCount} result
                {totalVisibleCount !== 1 ? "s" : ""}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Radius: {radiusKm} km</span>
            </div>
          </div>

          {/* Left top control card */}
          <aside className="absolute top-4 left-4 z-50 pointer-events-auto">
            <div className="w-[360px] max-w-[90vw] min-w-[280px] rounded-2xl bg-white/95 backdrop-blur-xl border border-white/70 shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 mb-1">
                      Searching in
                    </p>
                    <div className="inline-flex items-center max-w-full px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold">
                      <MapPin className="w-3 h-3 mr-1 text-gray-600 flex-shrink-0" />
                      <span className="truncate">
                        {searchCenter.address
                          ? searchCenter.address.split(",")[0]
                          : "Search Area"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleUseMyLocation}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    disabled={loading}
                    title="Use my location"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Radius + view mode */}
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-200 shadow-sm flex-1">
                      <span className="text-[11px] font-semibold text-gray-700">
                        Radius
                      </span>
                      <input
                        type="range"
                        value={radiusKm}
                        min={1}
                        max={30}
                        onChange={(e) =>
                          setRadiusKm(Number(e.target.value))
                        }
                        className="w-full accent-indigo-600 h-1.5 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-indigo-600 min-w-[3ch] text-right">
                        {radiusKm}km
                      </span>
                    </div>

                    <button
                      onClick={() => setShowFilters((s) => !s)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold shadow-sm transition-all ${
                        showFilters
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      {showFilters ? "Hide" : "Filters"}
                    </button>
                  </div>

                  {/* View mode (PG / Mess / Both) */}
                  <div className="flex items-center gap-1.5">
                    <ViewModeButton
                      value="pg"
                      label="PGs"
                      icon={<BedDouble className="w-3.5 h-3.5" />}
                    />
                    <ViewModeButton
                      value="mess"
                      label="Messes"
                      icon={<Utensils className="w-3.5 h-3.5" />}
                    />
                    <ViewModeButton
                      value="both"
                      label="Both"
                      icon={
                        <span className="flex -space-x-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          <Utensils className="w-3.5 h-3.5" />
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="px-3 py-3 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 bg-white"
                    >
                      <option value="distance">Distance (Nearest)</option>
                      <option value="price-low">
                        Price: Low to High
                      </option>
                      <option value="price-high">
                        Price: High to Low
                      </option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-700">
                        Max price (PG + Mess)
                      </label>
                      <span className="text-[11px] text-gray-600 font-medium">
                        ₹{(priceFilter.max ?? 100000).toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={5000}
                      value={priceFilter.max}
                      onChange={(e) =>
                        setPriceFilter({
                          ...priceFilter,
                          max: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 h-1.5 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Map */}
          <div className="absolute inset-0 z-10">
            <LeafletMap
              center={searchCenter}
              markers={markers}
              radiusKm={radiusKm}
              onCenterChange={handleMapCenterChange}
              hoveredMarkerId={hoveredCardKey}
              className="h-full w-full"
            />
          </div>

          {/* Right sliding panel */}
          <div
            className={`absolute right-4 top-20 lg:top-24 bottom-4 w-80 lg:w-96 z-40 pointer-events-auto transform transition-all duration-500 ease-out ${
              isPanelCollapsed ? "translate-x-[calc(100%+1rem)]" : ""
            }`}
          >
            <div className="h-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden flex flex-col">
              {/* Panel header */}
              <div className="p-4 pb-2 border-b border-gray-100 bg-gradient-to-r from-white via-indigo-50/60 to-purple-50/60 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Search className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-gray-900 truncate">
                        Nearby Stays & Messes
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-200">
                        <span>
                          {visiblePGs.length} PG
                          {visiblePGs.length !== 1 ? "s" : ""}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-indigo-400" />
                        <span>
                          {visibleMesses.length} Mess
                          {visibleMesses.length !== 1 ? "es" : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setIsPanelCollapsed((prev) => !prev)
                    }
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors ml-1 flex-shrink-0"
                    title={isPanelCollapsed ? "Expand" : "Collapse"}
                  >
                    {isPanelCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto space-y-3 p-4 pr-2 custom-scrollbar">
                {loading && totalVisibleCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    <p className="text-sm font-medium text-indigo-600">
                      Finding places near{" "}
                      {searchCenter.address
                        ? searchCenter.address.split(",")[0]
                        : "you"}
                      ...
                    </p>
                  </div>
                ) : totalVisibleCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="p-3 bg-white rounded-xl shadow-md mb-3">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="font-bold text-base text-gray-900 mb-1">
                      No results found
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Try increasing radius or adjusting filters.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* PG section */}
                    {viewMode !== "mess" && visiblePGs.length > 0 && (
                      <>
                        <p className="text-[11px] font-semibold text-gray-500 mb-1 px-1">
                          PGs near you
                        </p>
                        {visiblePGs.map((pg, index) => {
                          const cardKey = `pg-${pg._id}`;
                          return (
                            <div
                              key={cardKey}
                              onMouseEnter={() =>
                                setHoveredCardKey(cardKey)
                              }
                              onMouseLeave={() =>
                                setHoveredCardKey(null)
                              }
                              className={`group relative border rounded-2xl p-3 bg-white/90 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-0.5 border-gray-200 hover:border-indigo-400`}
                            >
                              <div className="absolute -top-1.5 -left-1.5 w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/60">
                                #{index + 1}
                              </div>

                              <div className="flex justify-between items-start mb-2 pr-5">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-gray-900 group-hover:text-indigo-700 line-clamp-1">
                                    {pg.title}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">
                                      {pg.address || pg.location}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right flex flex-col items-end shrink-0 ml-2">
                                  <p className="text-base font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none">
                                    ₹
                                    {(pg.monthlyRent ?? 0).toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-medium leading-none">
                                    /month
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-gray-200/70">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  <p className="text-xs text-emerald-700 font-bold">
                                    {pg.distanceKm
                                      ? `${pg.distanceKm.toFixed(1)} km`
                                      : "distance N/A"}
                                  </p>
                                </div>
                                <Link
                                  to={`/services/pg/${pg._id}`}
                                  className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-all flex items-center gap-0.5 group-hover:gap-1 whitespace-nowrap"
                                >
                                  View →
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Mess section */}
                    {viewMode !== "pg" && visibleMesses.length > 0 && (
                      <>
                        <p className="text-[11px] font-semibold text-gray-500 mt-3 mb-1 px-1">
                          Messes near you
                        </p>
                        {visibleMesses.map((mess, index) => {
                          const cardKey = `mess-${mess._id}`;
                          return (
                            <div
                              key={cardKey}
                              onMouseEnter={() =>
                                setHoveredCardKey(cardKey)
                              }
                              onMouseLeave={() =>
                                setHoveredCardKey(null)
                              }
                              className="group relative border rounded-2xl p-3 bg-white/90 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-0.5 border-gray-200 hover:border-amber-400"
                            >
                              <div className="absolute -top-1.5 -left-1.5 w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/60">
                                🍽
                              </div>

                              <div className="flex justify-between items-start mb-2 pr-5">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-gray-900 group-hover:text-amber-700 line-clamp-1">
                                    {mess.title}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">
                                      {mess.mapplsAddress ||
                                        mess.streetAddress ||
                                        mess.location}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right flex flex-col items-end shrink-0 ml-2">
                                  <p className="text-base font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent leading-none">
                                    ₹{(mess.price ?? 0).toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-medium leading-none">
                                    /month
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-gray-200/70">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-lg border border-orange-200">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                  <p className="text-xs text-orange-700 font-bold">
                                    {mess.distanceKm
                                      ? `${mess.distanceKm.toFixed(1)} km`
                                      : "distance N/A"}
                                  </p>
                                </div>
                                <Link
                                  to={`/mess/${mess._id}`}
                                  className="text-xs text-orange-600 font-bold hover:text-orange-800 transition-all flex items-center gap-0.5 group-hover:gap-1 whitespace-nowrap"
                                >
                                  View Mess →
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Legend / footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-[10px] text-gray-400">
                <p>Distances via Haversine • Real-time results</p>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" /> PG
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Mess
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgba(99, 102, 241, 0.5),
            rgba(168, 85, 247, 0.5)
          );
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6366f1, #a855f7);
        }
      `}</style>
    </div>
  );
};

export default PGNearMe;
