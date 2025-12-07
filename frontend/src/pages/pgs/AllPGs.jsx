import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, MapPin, ChevronDown, X, Star, Clock } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


const MIN_PRICE = 3000;
const MAX_PRICE = 50000;

const formatPrice = (value) => new Intl.NumberFormat("en-IN").format(value);

const getImageURL = (img) => {
  if (!img) return "https://via.placeholder.com/400";
  if (img.startsWith("http") || img.includes("cloudinary")) return img;
  return `http://localhost:5000${img}`;
};

const AmenityIcon = ({ label }) => {
  const n = label.toLowerCase();
  if (n.includes("wifi")) return <span className="w-3 h-3 mr-1 text-emerald-500">📶</span>;
  if (n.includes("ac")) return <span className="w-3 h-3 mr-1 text-cyan-500">❄️</span>;
  if (n.includes("mess") || n.includes("food")) return <span className="w-3 h-3 mr-1 text-emerald-500">🍽️</span>;
  return null;
};

const PGImageSlider = ({ images }) => {
  const imgs = images?.map((img) => getImageURL(img)) || [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imgs.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imgs.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [imgs.length]);

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-t-xl group">
      {imgs.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="PG"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100 scale-[1.02]" : "opacity-0 scale-100"}`}
          loading="lazy"
        />
      ))}
      {imgs.length > 1 && (
        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
          {imgs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${idx === index ? "bg-white shadow-md scale-125" : "bg-white/60 hover:bg-white"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ label, onRemove, color = "emerald" }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-sm border backdrop-blur-sm ${color === "emerald"
      ? "bg-emerald-100/90 border-emerald-200 text-emerald-800"
      : "bg-slate-100/90 border-slate-200 text-slate-800"
      }`}
  >
    <span className="truncate max-w-[80px]">{label}</span>
    <button onClick={onRemove} className="p-0.5 hover:bg-white/50 rounded-full transition-all">
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

const SinglePriceSlider = ({ maxPrice, setMaxPrice }) => {
  const [tempPrice, setTempPrice] = useState(maxPrice);

  const handleSlide = (e) => {
    setTempPrice(Number(e.target.value));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMaxPrice(tempPrice);
    }, 400);

    return () => clearTimeout(timer);
  }, [tempPrice]);

  return (
    <div className="w-full py-4">
      {/* Slider */}
      <input
        type="range"
        min={MIN_PRICE}
        max={MAX_PRICE}
        value={tempPrice}
        onChange={handleSlide}
        className="w-full accent-emerald-600"
      />

      <div className="flex justify-between mt-3 text-xs font-semibold text-slate-700">
        <span>₹{formatPrice(MIN_PRICE)}</span>
        <span className="text-emerald-600 font-bold">
          ₹{formatPrice(tempPrice)}
        </span>
      </div>
    </div>
  );
};


const AllPGs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [pgLocation, setPgLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent");

  const syncURL = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (pgLocation) params.set("location", pgLocation);
    if (type) params.set("type", type);
    if (minPrice !== MIN_PRICE) params.set("minPrice", minPrice);
    if (maxPrice !== MAX_PRICE) params.set("maxPrice", maxPrice);
    if (sortBy !== "recent") params.set("sort", sortBy);
    setSearchParams(params);
  }, [search, pgLocation, type, minPrice, maxPrice, sortBy, setSearchParams]);

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();
      setPgs(data);
    } catch (err) { }
    setLoading(false);
  };

  useEffect(() => {
    fetchPGs();
  }, []);

  useEffect(() => {
    const urlMin = parseInt(searchParams.get("minPrice")) || MIN_PRICE;
    const urlMax = parseInt(searchParams.get("maxPrice")) || MAX_PRICE;
    setMinPrice(urlMin);
    setMaxPrice(urlMax);
  }, [searchParams]);

  useEffect(() => {
    syncURL();
  }, [syncURL]);
  const PROPERTY_TYPES = [
    { label: "Boys PG", value: "boys" },
    { label: "Girls PG", value: "girls" },
    { label: "Co-Ed PG (Mixed)", value: "mixed" },
  ];

  const filteredPGs = useMemo(() => {
    let f = [...pgs];

    if (search.trim())
      f = f.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );

    if (pgLocation.trim()) {
      const q = pgLocation.toLowerCase();

      f = f.filter((p) =>
        (p.streetAddress?.toLowerCase().includes(q)) ||
        (p.district?.toLowerCase().includes(q)) ||
        (p.state?.toLowerCase().includes(q))
      );
    }

    if (type)
      f = f.filter((p) => p.propertyType === type);

    f = f.filter((p) => p.monthlyRent >= minPrice && p.monthlyRent <= maxPrice);

    f.sort((a, b) => {
      if (sortBy === "low-high") return a.monthlyRent - b.monthlyRent;
      if (sortBy === "high-low") return b.monthlyRent - a.monthlyRent;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return f;
  }, [pgs, search, pgLocation, type, minPrice, maxPrice, sortBy]);


  const clearFilters = () => {
    setSearch("");
    setPgLocation("");
    setType("");
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setSortBy("recent");
  };

  const activeFiltersCount = [search, pgLocation, type, minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE].filter(Boolean).length;

  const activeFilters = [
    search && {
      label: `Search: ${search.slice(0, 15)}${search.length > 15 ? "..." : ""}`,
      onRemove: () => setSearch(""),
      color: "emerald",
    },
    pgLocation && {
      label: `Location: ${pgLocation.slice(0, 15)}${pgLocation.length > 15 ? "..." : ""}`,
      onRemove: () => setPgLocation(""),
      color: "emerald",
    },
    type && {
      label: PROPERTY_TYPES.find((t) => t.value === type)?.label,
      onRemove: () => setType(""),
      color: "emerald",
    },
    (minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE) && {
      label: `₹${formatPrice(minPrice)} - ₹${formatPrice(maxPrice)}`,
      onRemove: () => {
        setMinPrice(MIN_PRICE);
        setMaxPrice(MAX_PRICE);
      },
      color: "emerald",
    },
  ].filter(Boolean);

  const getRating = (pg) => {
    if (pg.averageRating) return pg.averageRating;
    if (pg.ratings?.length) return pg.ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / pg.ratings.length;
    return null;
  };

  if (loading && pgs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-emerald-50/50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-25 to-mint-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full lg:w-80 xl:w-96 bg-white/95 backdrop-blur-xl border-r border-emerald-100/50 lg:block hidden sticky h-[calc(100vh-80px)] top-20 overflow-y-auto px-6 py-8 shadow-lg"
          >
            <div className="mb-8 pb-6 border-b border-emerald-100">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                Filters
              </h2>
              <p className="text-sm text-slate-500">{activeFiltersCount} active</p>
            </div>

            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-5 bg-emerald-50/90 border border-emerald-100 rounded-2xl shadow-sm"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeFilters.map((filter, idx) => (
                      <FilterChip key={idx} {...filter} />
                    ))}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="w-full text-emerald-600 hover:text-emerald-700 text-sm font-semibold px-4 py-2 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-500" />
                  Search PGs
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="PG name..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all shadow-sm"
                    value={pgLocation}
                    onChange={(e) => setPgLocation(e.target.value)}
                    placeholder="Hinjewadi, Baner..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">PG Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-all w-full border border-emerald-100">
                    <input
                      type="radio"
                      name="type"
                      className="w-4 h-4 text-emerald-600 border-emerald-300 focus:ring-emerald-500 rounded"
                      checked={!type}
                      onChange={() => setType("")}
                    />
                    <span className="text-sm font-medium text-slate-900">All Types</span>
                  </label>
                  {[
                    { label: "Boys PG", value: "boys" },
                    { label: "Girls PG", value: "girls" },
                    { label: "Co-Ed PG (Mixed)", value: "mixed" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-4 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-all w-full border border-emerald-100"
                    >
                      <input
                        type="radio"
                        name="type"
                        className="w-4 h-4 text-emerald-600 border-emerald-300 focus:ring-emerald-500 rounded"
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                      />
                      <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <span>₹</span>Monthly Budget
                </label>
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Min</span>
                    <span className="text-emerald-700">Price Range</span>
                    <span>Max</span>
                  </div>
                  <SinglePriceSlider
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                  />

                  <div className="flex justify-between mt-1 text-[11px] text-slate-500">
                    <span>₹{formatPrice(MIN_PRICE)}</span>
                    <span>₹{formatPrice(MAX_PRICE)}+</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  Sort <Clock className="w-4 h-4 text-emerald-400" />
                </label>
                <select
                  className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all shadow-sm font-medium"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="low-high">Price: Low → High</option>
                  <option value="high-low">Price: High → Low</option>
                </select>
              </div>
            </div>
          </motion.aside>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Explore PGs</h1>
                  <p className="text-lg text-slate-600 mt-2">
                    Showing <span className="font-bold text-emerald-600">{filteredPGs.length}</span> properties
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all mb-6 border border-emerald-500/20"
              >
                <Filter className="w-5 h-5" />
                Filters ({activeFiltersCount})
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="lg:hidden mb-8 p-6 bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-2xl shadow-xl"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-emerald-500" />
                        Search
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="PG name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Location
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 shadow-sm"
                        value={pgLocation}
                        onChange={(e) => setPgLocation(e.target.value)}
                        placeholder="Area name..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredPGs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full text-center py-20 bg-white/90 backdrop-blur-xl border-2 border-dashed border-emerald-200 rounded-2xl shadow-lg"
                >
                  <Search className="w-16 h-16 text-emerald-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No PGs found</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Try adjusting your filters or search criteria to see more results
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all border border-emerald-500/20"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              ) : (
                filteredPGs.map((pg, index) => {
                  const rating = getRating(pg);
                  return (
                    <motion.div
                      key={pg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/services/pg/${pg._id}`}
                        className="group bg-white border border-emerald-100/50 rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-200/50 transition-all duration-300 backdrop-blur-sm"
                      >
                        <PGImageSlider images={pg.images || []} />
                        <div className="p-6 space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {pg.title}
                          </h3>

                          <p className="text-sm text-slate-600 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" fill="currentColor">
                              <path d="M10 18l6-6a7 7 0 10-12 0l6 6z" />
                            </svg>
                            {pg.streetAddress}
                          </p>

                          {rating ? (
                            <div className="flex items-center text-sm text-emerald-600 font-semibold">
                              <Star className="w-4 h-4 mr-1 fill-current text-emerald-400" />
                              {rating.toFixed(1)} ({pg.ratings?.length || 0} reviews)
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400 italic">No ratings yet</div>
                          )}

                          <div className="text-emerald-600 font-bold text-2xl">
                            ₹{pg.monthlyRent.toLocaleString("en-IN")}
                            <span className="text-lg font-normal text-slate-600">/month</span>
                          </div>

                          {Array.isArray(pg.amenities) && pg.amenities.length > 0 && (
                            <div className="pt-4 border-t border-emerald-100 flex flex-wrap gap-2">
                              {pg.amenities.slice(0, 3).map((a, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50/90 text-emerald-700 text-xs font-medium border border-emerald-100/50 shadow-sm"
                                >
                                  <AmenityIcon label={a} />
                                  <span className="truncate max-w-16">{a}</span>
                                </span>
                              ))}
                              {pg.amenities.length > 3 && (
                                <span className="text-xs text-slate-500 px-3 py-1.5 bg-slate-50/90 rounded-full shadow-sm">
                                  +{pg.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllPGs;
