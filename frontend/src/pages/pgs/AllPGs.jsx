import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Search,
  MapPin,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  Wifi,
  Wind,
  UtensilsCrossed,
  Car,
  Tv,
  ShowerHead,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  Home,
  Users,
  IndianRupee,
  Loader2,
  RefreshCw,
  Check,
  AlertCircle,
  Navigation,
  Building2,
  TrendingUp,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// CONFIGURATION

const CONFIG = {
  PRICE: { MIN: 3000, MAX: 50000, STEP: 1000 },
  DEBOUNCE_MS: 300,
  IMAGE_INTERVAL: 2000,
  SKELETON_COUNT: 6,
};

// URL Parameter Keys - Must match what Home page sends
const URL_PARAMS = {
  SEARCH: "search",
  LOCATION: "location", // This matches what Home page sends
  TYPE: "type",
  PRICE: "price",
  SORT: "sort",
  AMENITIES: "amenities",
};

const PG_TYPES = [
  { label: "All Types", value: "", icon: Home },
  { label: "Boys PG", value: "boys", icon: Users },
  { label: "Girls PG", value: "girls", icon: Users },
  { label: "Co-Ed", value: "mixed", icon: Users },
];

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Price: Low to High", value: "low-high" },
  { label: "Price: High to Low", value: "high-low" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
];

const AMENITIES_LIST = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "ac", label: "AC", icon: Wind },
  { id: "food", label: "Food/Mess", icon: UtensilsCrossed },
  { id: "parking", label: "Parking", icon: Car },
  { id: "tv", label: "TV", icon: Tv },
  { id: "geyser", label: "Geyser", icon: ShowerHead },
];

// Popular locations for suggestions
const POPULAR_LOCATIONS = [
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Indiranagar",
  "BTM Layout",
  "Electronic City",
  "Marathahalli",
  "Bellandur",
];

// UTILITIES

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getImageURL = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.includes("cloudinary")) return img;
  return `${API}${img}`;
};

const getRating = (pg) => {
  if (pg.averageRating) return pg.averageRating;
  if (pg.ratings?.length) {
    return (
      pg.ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / pg.ratings.length
    );
  }
  return null;
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Fuzzy location matching - more flexible search
const matchesLocation = (pg, query) => {
  if (!query || !query.trim()) return true;

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  const pgLocation = [
    pg.streetAddress,
    pg.district,
    pg.state,
    pg.city,
    pg.area,
    pg.locality,
    pg.landmark,
    pg.pincode,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // All search terms must be found somewhere in the location
  return searchTerms.every((term) => pgLocation.includes(term));
};

// CUSTOM HOOKS

const useDebounce = (value, delay = CONFIG.DEBOUNCE_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, value]);

  return [value, setValue];
};

// Parse URL params safely - matches what Home page sends
const parseURLParams = (searchParams) => {
  const priceParam = searchParams.get(URL_PARAMS.PRICE);
  const amenitiesParam = searchParams.get(URL_PARAMS.AMENITIES);

  return {
    search: searchParams.get(URL_PARAMS.SEARCH) || "",
    location: searchParams.get(URL_PARAMS.LOCATION) || "", // Now correctly reads 'location'
    type: searchParams.get(URL_PARAMS.TYPE) || "",
    maxPrice: priceParam ? Number(priceParam) : CONFIG.PRICE.MAX,
    sortBy: searchParams.get(URL_PARAMS.SORT) || "recent",
    selectedAmenities: amenitiesParam
      ? amenitiesParam.split(",").filter(Boolean)
      : [],
  };
};

// SUBCOMPONENTS


// Hover Image Slideshow Component
const HoverImageSlider = memo(({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const intervalRef = useRef(null);

  const imageUrls = useMemo(
    () => images?.map(getImageURL).filter(Boolean) || [],
    [images]
  );

  useEffect(() => {
    imageUrls.forEach((url, index) => {
      if (index <= 2) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, index]));
        };
      }
    });
  }, [imageUrls]);

  useEffect(() => {
    if (isHovering && imageUrls.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
      }, CONFIG.IMAGE_INTERVAL);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovering, imageUrls.length]);

  const handlePrev = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearInterval(intervalRef.current);
      setCurrentIndex(
        (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
      );
    },
    [imageUrls.length]
  );

  const handleNext = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearInterval(intervalRef.current);
      setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
    },
    [imageUrls.length]
  );

  const handleDotClick = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    clearInterval(intervalRef.current);
    setCurrentIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setCurrentIndex(0);
  }, []);

  if (!imageUrls.length) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <Home className="w-12 h-12 text-slate-300" />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden bg-slate-100"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      {imageUrls.map((src, index) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-out",
            index === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          )}
        >
          {!loadedImages.has(index) && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          )}
          <img
            src={src}
            alt={`Property image ${index + 1}`}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              isHovering && index === currentIndex && "scale-105"
            )}
            loading={index === 0 ? "eager" : "lazy"}
            onLoad={() => setLoadedImages((prev) => new Set([...prev, index]))}
          />
        </div>
      ))}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      />

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 z-20",
              isHovering
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={handleNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 z-20",
              isHovering
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4"
            )}
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </>
      )}

      {imageUrls.length > 1 && (
        <div
          className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-black/30 backdrop-blur-sm transition-all duration-300 z-20",
            isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          {imageUrls.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleDotClick(e, index)}
              className={cn(
                "rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-white w-5 h-1.5"
                  : "bg-white/60 w-1.5 h-1.5 hover:bg-white/80"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
          {imageUrls.length > 5 && (
            <span className="text-[10px] text-white/90 ml-1 font-medium">
              +{imageUrls.length - 5}
            </span>
          )}
        </div>
      )}

      {imageUrls.length > 1 && (
        <div
          className={cn(
            "absolute top-3 left-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium transition-all duration-300 z-10",
            isHovering ? "opacity-100" : "opacity-0"
          )}
        >
          {currentIndex + 1} / {imageUrls.length}
        </div>
      )}
    </div>
  );
});

HoverImageSlider.displayName = "HoverImageSlider";

// Wishlist Button
const WishlistButton = memo(({ pgId }) => {
  const [wishlist, setWishlist] = useLocalStorage("pg-wishlist", []);
  const isWishlisted = wishlist.includes(pgId);

  const toggleWishlist = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setWishlist((prev) =>
        isWishlisted ? prev.filter((id) => id !== pgId) : [...prev, pgId]
      );
    },
    [pgId, isWishlisted, setWishlist]
  );

  return (
    <button
      onClick={toggleWishlist}
      className={cn(
        "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-20",
        isWishlisted
          ? "bg-red-500 text-white shadow-lg scale-110"
          : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500 hover:scale-110 shadow-md"
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
    </button>
  );
});

WishlistButton.displayName = "WishlistButton";

// Amenity Badge
const AmenityBadge = memo(({ label }) => {
  const amenity = AMENITIES_LIST.find((a) =>
    label.toLowerCase().includes(a.id)
  );
  const Icon = amenity?.icon;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
      {Icon && <Icon className="w-3 h-3 text-slate-500" />}
      <span className="truncate max-w-[60px]">{label}</span>
    </span>
  );
});

AmenityBadge.displayName = "AmenityBadge";

// PG Type Badge
const TypeBadge = memo(({ type }) => {
  const config = {
    boys: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    girls: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    mixed: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
  };
  const style = config[type] || config.mixed;
  const label = type === "boys" ? "Boys" : type === "girls" ? "Girls" : "Co-Ed";

  return (
    <span
      className={cn(
        "absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-md border backdrop-blur-sm z-10",
        style.bg,
        style.text,
        style.border
      )}
    >
      {label}
    </span>
  );
});

TypeBadge.displayName = "TypeBadge";

// PG Card Component
const PGCard = memo(({ pg, index, searchLocation }) => {
  const rating = getRating(pg);
  const reviewCount = pg.ratings?.length || 0;

  // Build location display
  const locationParts = [pg.streetAddress, pg.district, pg.state]
    .filter(Boolean)
    .slice(0, 2);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group h-full"
    >
      <Link
        to={`/services/pg/${pg._id}`}
        className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
      >
        <div className="relative">
          <HoverImageSlider images={pg.images} />
          <TypeBadge type={pg.propertyType} />
          <WishlistButton pgId={pg._id} />
        </div>

        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {pg.title}
            </h3>
            {rating ? (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-slate-900">
                  {rating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs text-slate-500">({reviewCount})</span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">New</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              {locationParts.join(", ") || "Location not specified"}
            </span>
          </div>

          {/* Show match indicator if searching by location */}
          {searchLocation && pg.district && (
            <div className="flex items-center gap-1 text-xs text-emerald-600 mb-2">
              <Navigation className="w-3 h-3" />
              <span>
                {pg.district}
                {pg.city && pg.city !== pg.district && `, ${pg.city}`}
              </span>
            </div>
          )}

          {pg.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {pg.amenities.slice(0, 3).map((amenity, i) => (
                <AmenityBadge key={i} label={amenity} />
              ))}
              {pg.amenities.length > 3 && (
                <span className="text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded-md">
                  +{pg.amenities.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-baseline gap-1 pt-3 mt-auto border-t border-slate-100">
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(pg.monthlyRent)}
            </span>
            <span className="text-sm text-slate-500">/month</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

PGCard.displayName = "PGCard";

// Skeleton Card
const SkeletonCard = memo(() => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse" />
        <div className="h-5 bg-slate-200 rounded w-12 animate-pulse" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded w-14 animate-pulse" />
        <div className="h-6 bg-slate-200 rounded w-14 animate-pulse" />
        <div className="h-6 bg-slate-200 rounded w-14 animate-pulse" />
      </div>
      <div className="pt-3 border-t border-slate-100">
        <div className="h-6 bg-slate-200 rounded w-24 animate-pulse" />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = "SkeletonCard";

// Filter Chip
const FilterChip = memo(({ label, onRemove }) => (
  <motion.span
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm"
  >
    <span className="max-w-[120px] truncate">{label}</span>
    <button
      onClick={onRemove}
      className="p-0.5 hover:bg-emerald-100 rounded-full transition-colors"
      aria-label={`Remove filter: ${label}`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.span>
));

FilterChip.displayName = "FilterChip";

// Location Input with Suggestions
const LocationInput = memo(({ value, onChange, placeholder }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const filteredSuggestions = useMemo(() => {
    if (!localValue.trim()) return POPULAR_LOCATIONS;
    return POPULAR_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(localValue.toLowerCase())
    );
  }, [localValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {!localValue.trim() && (
              <div className="px-3 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-b border-slate-100">
                Popular Locations
              </div>
            )}
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

LocationInput.displayName = "LocationInput";

// Price Range Slider
const PriceRangeSlider = memo(({ min, max, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  const percentage = Math.min(
    100,
    Math.max(0, ((localValue - min) / (max - min)) * 100)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Maximum Budget</span>
        <span className="text-lg font-bold text-emerald-600">
          {formatPrice(localValue)}
        </span>
      </div>

      <div className="relative h-2">
        <div className="absolute inset-0 bg-slate-200 rounded-full" />
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={CONFIG.PRICE.STEP}
          value={localValue}
          onChange={(e) => setLocalValue(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-emerald-500 rounded-full shadow-lg pointer-events-none"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
});

PriceRangeSlider.displayName = "PriceRangeSlider";

// Collapsible Filter Section
const FilterSection = memo(
  ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="border-b border-slate-100 last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-4 text-left hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-slate-800">
            {Icon && <Icon className="w-4 h-4 text-slate-500" />}
            {title}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FilterSection.displayName = "FilterSection";

// Empty State
const EmptyState = memo(({ onClear, hasFilters, searchLocation }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200"
  >
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      {searchLocation ? (
        <MapPin className="w-10 h-10 text-slate-400" />
      ) : (
        <Search className="w-10 h-10 text-slate-400" />
      )}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">
      {searchLocation
        ? `No PGs found in "${searchLocation}"`
        : "No PGs found"}
    </h3>
    <p className="text-slate-500 text-center mb-6 max-w-md">
      {hasFilters
        ? "Try adjusting your filters or search in a different area."
        : "No properties are available at the moment. Please check back later."}
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Clear All Filters
      </button>
    )}
  </motion.div>
));

EmptyState.displayName = "EmptyState";

// Error State
const ErrorState = memo(({ onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-red-50 rounded-2xl border border-red-200"
  >
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
      <AlertCircle className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">
      Failed to load properties
    </h3>
    <p className="text-slate-500 text-center mb-6 max-w-md">
      Something went wrong. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </motion.div>
));

ErrorState.displayName = "ErrorState";

// Search Header Bar (Like Stanza Living)
const SearchHeaderBar = memo(
  ({ location, setLocation, search, setSearch, resultsCount, loading }) => {
    return (
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Location Search */}
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search by location..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
                {location && (
                  <button
                    onClick={() => setLocation("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Name Search */}
            <div className="flex-1 w-full sm:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 shrink-0">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>
                    <strong className="text-emerald-600">{resultsCount}</strong>{" "}
                    properties
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SearchHeaderBar.displayName = "SearchHeaderBar";

// Filter Sidebar Component
const FilterSidebar = memo(
  ({
    search,
    setSearch,
    location,
    setLocation,
    type,
    setType,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    selectedAmenities,
    toggleAmenity,
    activeFilters,
    clearFilters,
    onClose,
    isMobile = false,
  }) => {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
                {activeFilters.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                    {activeFilters.length}
                  </span>
                )}
              </div>
              {isMobile && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Active Filters */}
            <AnimatePresence mode="popLayout">
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    {activeFilters.map((filter, idx) => (
                      <FilterChip key={filter.label + idx} {...filter} />
                    ))}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search by Name */}
            <FilterSection title="Search" icon={Search}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </FilterSection>

            {/* Location */}
            <FilterSection title="Location" icon={MapPin}>
              <LocationInput
                value={location}
                onChange={setLocation}
                placeholder="Enter area, city, or landmark..."
              />
              {location && (
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Showing PGs in or near "{location}"
                </p>
              )}
            </FilterSection>

            {/* PG Type */}
            <FilterSection title="Property Type" icon={Home}>
              <div className="grid grid-cols-2 gap-2">
                {PG_TYPES.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setType(option.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                      type === option.value
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {type === option.value && <Check className="w-3.5 h-3.5" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Budget" icon={IndianRupee}>
              <PriceRangeSlider
                min={CONFIG.PRICE.MIN}
                max={CONFIG.PRICE.MAX}
                value={maxPrice}
                onChange={setMaxPrice}
              />
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Amenities" icon={Wifi} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_LIST.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all",
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <amenity.icon className="w-4 h-4" />
                      {amenity.label}
                      {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* Sort */}
            <FilterSection title="Sort By" icon={ArrowUpDown}>
              <div className="space-y-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                      sortBy === option.value
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {option.label}
                    {sortBy === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>
        </div>

        {/* Mobile Apply Button */}
        {isMobile && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Show Results
            </button>
          </div>
        )}
      </div>
    );
  }
);

FilterSidebar.displayName = "FilterSidebar";

// MAIN COMPONENT

const AllPGs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data State
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize filter state from URL - correctly reads 'location' param
  const initialParams = useMemo(
    () => parseURLParams(searchParams),
    [] // Only parse once on mount
  );

  // Filter State
  const [search, setSearch] = useState(initialParams.search);
  const [location, setLocation] = useState(initialParams.location);
  const [type, setType] = useState(initialParams.type);
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice);
  const [sortBy, setSortBy] = useState(initialParams.sortBy);
  const [selectedAmenities, setSelectedAmenities] = useState(
    initialParams.selectedAmenities
  );

  // UI State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Debounced Values
  const debouncedSearch = useDebounce(search);
  const debouncedLocation = useDebounce(location);

  // Track initial mount
  const isInitialMount = useRef(true);

  // Fetch PGs
  const fetchPGs = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/pgs`, { signal });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPgs(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        setPgs([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPGs(controller.signal);
    return () => controller.abort();
  }, [fetchPGs]);

  // Sync URL with filters - uses correct param names
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set(URL_PARAMS.SEARCH, debouncedSearch);
    if (debouncedLocation) params.set(URL_PARAMS.LOCATION, debouncedLocation);
    if (type) params.set(URL_PARAMS.TYPE, type);
    if (maxPrice !== CONFIG.PRICE.MAX)
      params.set(URL_PARAMS.PRICE, String(maxPrice));
    if (sortBy !== "recent") params.set(URL_PARAMS.SORT, sortBy);
    if (selectedAmenities.length)
      params.set(URL_PARAMS.AMENITIES, selectedAmenities.join(","));

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    debouncedLocation,
    type,
    maxPrice,
    sortBy,
    selectedAmenities,
    setSearchParams,
  ]);

  // Filter & Sort PGs with improved location matching
  const filteredPGs = useMemo(() => {
    let result = [...pgs];

    // Search filter (by name/title)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Location filter - uses flexible matching
    if (debouncedLocation.trim()) {
      result = result.filter((p) => matchesLocation(p, debouncedLocation));
    }

    // Type filter
    if (type) {
      result = result.filter((p) => p.propertyType === type);
    }

    // Price filter
    result = result.filter((p) => p.monthlyRent && p.monthlyRent <= maxPrice);

    // Amenities filter
    if (selectedAmenities.length > 0) {
      result = result.filter((p) => {
        if (!p.amenities || !Array.isArray(p.amenities)) return false;
        return selectedAmenities.every((amenityId) =>
          p.amenities.some((a) =>
            a.toLowerCase().includes(amenityId.toLowerCase())
          )
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "low-high":
          return (a.monthlyRent || 0) - (b.monthlyRent || 0);
        case "high-low":
          return (b.monthlyRent || 0) - (a.monthlyRent || 0);
        case "rating":
          return (getRating(b) || 0) - (getRating(a) || 0);
        case "reviews":
          return (b.ratings?.length || 0) - (a.ratings?.length || 0);
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return result;
  }, [
    pgs,
    debouncedSearch,
    debouncedLocation,
    type,
    maxPrice,
    sortBy,
    selectedAmenities,
  ]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch("");
    setLocation("");
    setType("");
    setMaxPrice(CONFIG.PRICE.MAX);
    setSortBy("recent");
    setSelectedAmenities([]);
  }, []);

  // Toggle amenity
  const toggleAmenity = useCallback((amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  }, []);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];

    if (search) {
      filters.push({
        label: `"${search.slice(0, 15)}${search.length > 15 ? "..." : ""}"`,
        onRemove: () => setSearch(""),
      });
    }
    if (location) {
      filters.push({
        label: `📍 ${location.slice(0, 15)}${location.length > 15 ? "..." : ""}`,
        onRemove: () => setLocation(""),
      });
    }
    if (type) {
      const typeLabel = PG_TYPES.find((t) => t.value === type)?.label;
      filters.push({
        label: typeLabel || type,
        onRemove: () => setType(""),
      });
    }
    if (maxPrice !== CONFIG.PRICE.MAX) {
      filters.push({
        label: `Under ${formatPrice(maxPrice)}`,
        onRemove: () => setMaxPrice(CONFIG.PRICE.MAX),
      });
    }
    selectedAmenities.forEach((amenityId) => {
      const amenityLabel = AMENITIES_LIST.find((a) => a.id === amenityId)?.label;
      filters.push({
        label: amenityLabel || amenityId,
        onRemove: () => toggleAmenity(amenityId),
      });
    });

    return filters;
  }, [search, location, type, maxPrice, selectedAmenities, toggleAmenity]);

  const hasFilters = activeFilters.length > 0;

  // Retry fetch
  const handleRetry = useCallback(() => {
    const controller = new AbortController();
    fetchPGs(controller.signal);
  }, [fetchPGs]);

  // Close mobile filters
  const closeMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Search Header Bar - Like Stanza Living */}
      <SearchHeaderBar
        location={location}
        setLocation={setLocation}
        search={search}
        setSearch={setSearch}
        resultsCount={filteredPGs.length}
        loading={loading}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 xl:w-96 bg-white border-r border-slate-200 sticky top-[73px] h-[calc(100vh-73px)] overflow-hidden shadow-sm">
          <FilterSidebar
            search={search}
            setSearch={setSearch}
            location={location}
            setLocation={setLocation}
            type={type}
            setType={setType}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedAmenities={selectedAmenities}
            toggleAmenity={toggleAmenity}
            activeFilters={activeFilters}
            clearFilters={clearFilters}
            isMobile={false}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {location ? (
                    <>
                      PGs in{" "}
                      <span className="text-emerald-600">{location}</span>
                    </>
                  ) : (
                    "Find Your Perfect PG"
                  )}
                </h1>
                <p className="text-slate-500 mt-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching properties...
                    </span>
                  ) : error ? (
                    <span className="text-red-500">Error loading properties</span>
                  ) : (
                    <>
                      <span className="font-semibold text-emerald-600">
                        {filteredPGs.length}
                      </span>{" "}
                      {filteredPGs.length === 1 ? "property" : "properties"}{" "}
                      found
                      {hasFilters && (
                        <span className="text-slate-400"> (filtered)</span>
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "grid"
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "list"
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasFilters && (
                    <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                      {activeFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Filters - Mobile visible */}
            <AnimatePresence>
              {hasFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter, idx) => (
                      <FilterChip key={filter.label + idx} {...filter} />
                    ))}
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-full transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PG Grid */}
            <div
              className={cn(
                "grid gap-5",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1 max-w-3xl"
              )}
            >
              {loading ? (
                Array.from({ length: CONFIG.SKELETON_COUNT }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : error ? (
                <ErrorState onRetry={handleRetry} />
              ) : filteredPGs.length === 0 ? (
                <EmptyState
                  onClear={clearFilters}
                  hasFilters={hasFilters}
                  searchLocation={location}
                />
              ) : (
                filteredPGs.map((pg, index) => (
                  <PGCard
                    key={pg._id}
                    pg={pg}
                    index={index}
                    searchLocation={location}
                  />
                ))
              )}
            </div>

            {/* Results Summary */}
            {!loading && !error && filteredPGs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center text-sm text-slate-500"
              >
                Showing all {filteredPGs.length} results
                {location && ` in "${location}"`}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeMobileFilters}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 lg:hidden shadow-2xl"
            >
              <FilterSidebar
                search={search}
                setSearch={setSearch}
                location={location}
                setLocation={setLocation}
                type={type}
                setType={setType}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedAmenities={selectedAmenities}
                toggleAmenity={toggleAmenity}
                activeFilters={activeFilters}
                clearFilters={clearFilters}
                onClose={closeMobileFilters}
                isMobile={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AllPGs;