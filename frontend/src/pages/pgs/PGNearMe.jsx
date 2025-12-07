import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Navigation,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/Header";
import LeafletMap from "../../components/maps/LeafletMap";
import { fetchPGsNearMe } from "../../services/pgService";

const DEFAULT_CENTER = {
  lat: 18.5204,
  lng: 73.8567,
  address: "Pune, Maharashtra, India",
};

const PGNearMe = () => {
  const [radiusKm, setRadiusKm] = useState(5);
  const [searchCenter, setSearchCenter] = useState(DEFAULT_CENTER);
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSearchArea, setCurrentSearchArea] = useState(
    DEFAULT_CENTER.address
  );

  const [hoveredPgId, setHoveredPgId] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("distance");
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 100000 });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const fetchPGData = useCallback(async (center, radius) => {
    if (!center?.lat || !center?.lng) return;

    setLoading(true);
    try {
      const res = await fetchPGsNearMe(center.lat, center.lng, radius);
      setPgs(res.data.pgs || []);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to fetch nearby PGs. Please check your network and try again."
      );
      setPgs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentSearchArea(searchCenter.address || "Unknown Location");
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

  const filteredAndSortedPgs = pgs
    .filter(
      (pg) =>
        pg.monthlyRent >= priceFilter.min &&
        pg.monthlyRent <= priceFilter.max
    )
    .sort((a, b) => {
      if (sortBy === "distance")
        return (a.distanceKm || 0) - (b.distanceKm || 0);
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 relative overflow-hidden">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
            <div className="px-3 py-1.5 rounded-full bg-white/95 shadow-lg border border-gray-200 text-xs text-gray-700">
              {filteredAndSortedPgs.length} results • {radiusKm} km
            </div>
          </div>

          <aside className="absolute top-4 left-4 z-50 pointer-events-auto">
            <div className="w-[340px] max-w-[90vw] min-w-[280px] rounded-2xl bg-white/95 backdrop-blur-xl border border-white/70 shadow-2xl overflow-hidden">
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
                <div className="mt-3 flex items-center gap-2">
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
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-gray-700">
                        Max price
                      </label>
                      <span className="text-[11px] text-gray-600 font-medium">
                        ₹{priceFilter.max.toLocaleString()}
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
          <div className="absolute inset-0 z-10">
            <LeafletMap
              center={searchCenter}
              markers={markers}
              radiusKm={radiusKm}
              onCenterChange={handleMapCenterChange}
              hoveredMarkerId={hoveredPgId}
              className="h-full w-full"
            />
          </div>

          <div
            className={`absolute right-4 top-20 lg:top-24 bottom-4 w-80 lg:w-96 z-40 pointer-events-auto transform transition-all duration-500 ease-out ${
              isPanelCollapsed ? "translate-x-[calc(100%+1rem)]" : ""
            }`}
          >
            <div className="h-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden flex flex-col">
              <div className="p-4 pb-2 border-b border-gray-100 bg-gradient-to-r from-white via-indigo-50/60 to-purple-50/60 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Search className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-gray-900 truncate">
                        PG Listings
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-200">
                        {filteredAndSortedPgs.length} found
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
              <div className="flex-1 overflow-y-auto space-y-2.5 p-4 pr-2 custom-scrollbar">
                {loading && pgs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    <p className="text-sm font-medium text-indigo-600">
                      Loading PGs near{" "}
                      {searchCenter.address
                        ? searchCenter.address.split(",")[0]
                        : "you"}
                      ...
                    </p>
                  </div>
                ) : filteredAndSortedPgs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="p-3 bg-white rounded-xl shadow-md mb-3">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="font-bold text-base text-gray-900 mb-1">
                      No PGs Found
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Try increasing radius or adjusting filters.
                    </p>
                  </div>
                ) : (
                  filteredAndSortedPgs.map((pg, index) => (
                    <div
                      key={pg._id}
                      onMouseEnter={() => setHoveredPgId(pg._id)}
                      onMouseLeave={() => setHoveredPgId(null)}
                      className={`group relative border rounded-2xl p-3 bg-white/90 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-0.5 border-gray-200 hover:border-indigo-400 ${
                        hoveredPgId === pg._id
                          ? "ring-2 ring-indigo-400/60 bg-indigo-50/80"
                          : ""
                      }`}
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
                            <span className="truncate">{pg.address}</span>
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0 ml-2">
                          <p className="text-base font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none">
                            ₹{pg.monthlyRent.toLocaleString()}
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
                            {pg.distanceKm?.toFixed(1)} km
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
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70">
                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  Distances via Haversine • Real-time results
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
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
