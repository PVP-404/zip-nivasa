// src/pages/dashboard/StudentDashboard.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Star,
  Phone,
  ChevronRight,
  Search,
  X,
  Loader2,
  Home,
  UtensilsCrossed,
  Shirt,
  Navigation,
  Heart,
  Filter,
  RefreshCw,
  WifiOff,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  Grid3X3,
  LayoutList,
  SlidersHorizontal,
} from "lucide-react";
import { getAllMesses } from "../../services/messService";

// Lazy load heavy components
const Header = lazy(() => import("../../components/Header"));
const Footer = lazy(() => import("../../components/Footer"));
const Sidebar = lazy(() => import("../../components/Sidebar"));

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============ Constants ============
const DEBOUNCE_MS = 300;
const SKELETON_COUNT = 6;

const SERVICES = [
  { key: "housing", label: "Housing", description: "PGs & Hostels", icon: Home },
  { key: "mess", label: "Mess", description: "Daily Meals", icon: UtensilsCrossed },
  { key: "laundry", label: "Laundry", description: "Wash & Iron", icon: Shirt },
];

const MOCK_LAUNDRY = [
  {
    id: 1,
    name: "Quick Wash Laundry",
    location: "Main Street, Sector 12",
    rating: 4.5,
    reviewCount: 128,
    services: ["Washing", "Ironing", "Dry Cleaning"],
    price: 50,
    turnaround: "24 hours",
  },
  {
    id: 2,
    name: "Fresh & Clean",
    location: "Campus Road",
    rating: 4.7,
    reviewCount: 89,
    services: ["Washing", "Ironing", "Premium Care"],
    price: 60,
    turnaround: "Same Day",
  },
  {
    id: 3,
    name: "Express Laundry",
    location: "Market Complex",
    rating: 4.3,
    reviewCount: 56,
    services: ["Washing", "Dry Cleaning"],
    price: 45,
    turnaround: "48 hours",
  },
];

// ============ Utilities ============
const toArray = (val) =>
  Array.isArray(val) ? val : Array.isArray(val?.data) ? val.data : [];

const formatPrice = (price) => {
  if (!price && price !== 0) return "N/A";
  return `₹${price.toLocaleString("en-IN")}`;
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ============ Custom Hooks ============
const useDebounce = (value, delay = DEBOUNCE_MS) => {
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

  const setStoredValue = useCallback(
    (newValue) => {
      try {
        const valueToStore = typeof newValue === "function" ? newValue(value) : newValue;
        setValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error("LocalStorage error:", err);
      }
    },
    [key, value]
  );

  return [value, setStoredValue];
};

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

// ============ Sub Components ============

// Skeleton Loader
const Skeleton = memo(({ className = "" }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)} />
));

Skeleton.displayName = "Skeleton";

// Card Skeleton
const CardSkeleton = memo(() => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <Skeleton className="h-44 rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  </div>
));

CardSkeleton.displayName = "CardSkeleton";

// Image Slideshow
const ImageSlideshow = memo(({ images = [], alt, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef(null);

  const safeImages = useMemo(
    () => (images.length > 0 ? images : ["/placeholder-property.jpg"]),
    [images]
  );

  useEffect(() => {
    if (safeImages.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, [safeImages.length]);

  const goTo = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-gray-100 group", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
          <Home className="w-8 h-8 text-gray-300 mb-2" />
          <span className="text-xs text-gray-400">No image</span>
        </div>
      ) : (
        <img
          src={safeImages[currentIndex]}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoading ? "opacity-0" : "opacity-100",
            "group-hover:scale-105"
          )}
        />
      )}

      {/* Navigation Arrows */}
      {safeImages.length > 1 && !hasError && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 
              flex items-center justify-center opacity-0 group-hover:opacity-100 
              transition-opacity hover:bg-white shadow-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % safeImages.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 
              flex items-center justify-center opacity-0 group-hover:opacity-100 
              transition-opacity hover:bg-white shadow-sm"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots */}
      {safeImages.length > 1 && !hasError && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {safeImages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => goTo(e, idx)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentIndex ? "bg-white w-3" : "bg-white/60"
              )}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ImageSlideshow.displayName = "ImageSlideshow";

// Rating Badge
const RatingBadge = memo(({ rating, count }) => (
  <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
    <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
    <span className="text-xs font-semibold text-emerald-700">
      {rating?.toFixed(1) || "New"}
    </span>
    {count > 0 && (
      <span className="text-xs text-gray-400">({count})</span>
    )}
  </div>
));

RatingBadge.displayName = "RatingBadge";

// Service Tab
const ServiceTab = memo(({ service, isActive, onClick }) => {
  const Icon = service.icon;

  return (
    <button
      onClick={() => onClick(service.key)}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left w-full",
        isActive
          ? "bg-emerald-50 border-emerald-500"
          : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
      )}
    >
      <div
        className={cn(
          "p-2.5 rounded-lg transition-colors",
          isActive ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-sm",
          isActive ? "text-emerald-700" : "text-gray-900"
        )}>
          {service.label}
        </h3>
        <p className="text-xs text-gray-500 truncate">{service.description}</p>
      </div>
    </button>
  );
});

ServiceTab.displayName = "ServiceTab";

// Search Input
const SearchInput = memo(({ value, onChange, onClear, placeholder }) => (
  <div className="relative group">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 
      group-focus-within:text-emerald-500 transition-colors" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
        transition-all placeholder-gray-400"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full 
          hover:bg-gray-100 transition-colors"
        aria-label="Clear search"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    )}
  </div>
));

SearchInput.displayName = "SearchInput";

// Housing Card
const HousingCard = memo(({ item, onFavorite, isFavorite }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate(`/services/pg/${item.id}`);
  }, [navigate, item.id]);

  return (
    <article
      className="bg-white rounded-xl border border-gray-100 overflow-hidden 
        hover:shadow-lg hover:border-gray-200 transition-all duration-300 group cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Image */}
      <div className="relative h-44">
        <ImageSlideshow images={item.images} alt={item.name} className="h-full" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(item.id);
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all",
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-500 hover:bg-white hover:text-red-500"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(item.price)}
          </span>
          <span className="text-xs text-gray-500">/mo</span>
        </div>

        {/* Rating Badge */}
        {item.rating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-900">{item.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
            {item.type}
          </p>
        </div>

        <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {item.location}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <a
            href={`tel:${item.contact}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
              bg-gray-50 text-gray-700 text-sm font-medium
              hover:bg-gray-100 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
              bg-emerald-500 text-white text-sm font-medium
              hover:bg-emerald-600 transition-colors"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
});

HousingCard.displayName = "HousingCard";

// Mess Card
const MessCard = memo(({ item, onClick }) => {
  const avgRating = useMemo(() => {
    if (item.averageRating) return item.averageRating;
    if (item.ratings?.length > 0) {
      return item.ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / item.ratings.length;
    }
    return null;
  }, [item]);

  return (
    <article
      onClick={() => onClick(item._id)}
      className="bg-white rounded-xl border border-gray-100 p-5
        hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {item.title || item.name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </p>
        </div>

        <span
          className={cn(
            "px-2 py-1 rounded-md text-xs font-semibold uppercase",
            item.type === "Veg"
              ? "bg-green-50 text-green-700"
              : item.type === "Non-Veg"
              ? "bg-red-50 text-red-700"
              : "bg-orange-50 text-orange-700"
          )}
        >
          {item.type || "Both"}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4">
        <RatingBadge rating={avgRating} count={item.ratings?.length} />
        <span className="text-gray-300">•</span>
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(item.price)}
          <span className="text-xs font-normal text-gray-500">/mo</span>
        </span>
      </div>

      {/* CTA */}
      <button
        className="w-full py-2.5 rounded-lg border border-emerald-200 text-emerald-600 
          text-sm font-medium hover:bg-emerald-500 hover:text-white hover:border-emerald-500 
          transition-all duration-200 flex items-center justify-center gap-2"
      >
        View Menu
        <ChevronRight className="w-4 h-4" />
      </button>
    </article>
  );
});

MessCard.displayName = "MessCard";

// Laundry Card
const LaundryCard = memo(({ item }) => (
  <article className="bg-white rounded-xl border border-gray-100 p-5
    hover:shadow-lg hover:border-gray-200 transition-all duration-300">
    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          {item.location}
        </p>
      </div>
      <RatingBadge rating={item.rating} count={item.reviewCount} />
    </div>

    {/* Services */}
    <div className="flex flex-wrap gap-1.5 mb-4">
      {item.services.map((service, i) => (
        <span
          key={i}
          className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full"
        >
          {service}
        </span>
      ))}
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div>
        <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
        <span className="text-xs text-gray-500">/kg</span>
      </div>
      <span className="text-xs text-gray-500">{item.turnaround}</span>
    </div>
  </article>
));

LaundryCard.displayName = "LaundryCard";

// Empty State
const EmptyState = memo(({ service, onReset }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-gray-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
    <p className="text-gray-500 text-sm text-center max-w-sm mb-4">
      We couldn't find any {service} matching your search. Try different keywords.
    </p>
    <button
      onClick={onReset}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 
        hover:bg-emerald-50 rounded-lg transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Clear Search
    </button>
  </div>
));

EmptyState.displayName = "EmptyState";

// Error State
const ErrorState = memo(({ message, onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h3>
    <p className="text-gray-500 text-sm text-center max-w-sm mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm 
        font-medium rounded-lg hover:bg-emerald-600 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </div>
));

ErrorState.displayName = "ErrorState";

// Offline Banner
const OfflineBanner = memo(() => (
  <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
    <div className="flex items-center justify-center gap-2 text-amber-700">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">You're offline</span>
    </div>
  </div>
));

OfflineBanner.displayName = "OfflineBanner";

// ============ Main Component ============
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOnline = useOnlineStatus();
  const searchInputRef = useRef(null);

  // User info
  const username = useMemo(() => localStorage.getItem("username") || "Student", []);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage("dashboardViewMode", "grid");
  const [favorites, setFavorites] = useLocalStorage("favorites", []);

  // Data State
  const [housing, setHousing] = useState([]);
  const [messes, setMesses] = useState([]);
  const [laundry] = useState(MOCK_LAUNDRY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [activeService, setActiveService] = useState(
    searchParams.get("tab") || "housing"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebounce(searchQuery);

  // Fetch housing data
  const fetchHousing = useCallback(async () => {
    const res = await fetch(`${API}/api/pgs`);
    if (!res.ok) throw new Error("Failed to fetch housing");
    const data = await res.json();
    const list = toArray(data);

    return list.map((pg) => ({
      id: pg._id,
      name: pg.title,
      type: pg.propertyType || "PG",
      location: pg.streetAddress || pg.location || "",
      price: pg.monthlyRent,
      rating: pg.averageRating || 4.5,
      images: pg.images?.length > 0 ? pg.images : [],
      amenities: pg.amenities || [],
      contact: pg.contact || "+919999999999",
    }));
  }, []);

  // Fetch messes
  const fetchMesses = useCallback(async () => {
    const res = await getAllMesses();
    return Array.isArray(res) ? res : Array.isArray(res?.messes) ? res.messes : [];
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [housingData, messData] = await Promise.all([
          fetchHousing(),
          fetchMesses(),
        ]);
        setHousing(housingData);
        setMesses(messData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchHousing, fetchMesses]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeService !== "housing") params.set("tab", activeService);
    if (debouncedSearch) params.set("q", debouncedSearch);
    setSearchParams(params, { replace: true });
  }, [activeService, debouncedSearch, setSearchParams]);

  // Filtered data
  const filteredData = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    const filterFn = (items, fields) => {
      if (!q) return items;
      return items.filter((item) =>
        fields.some((field) => {
          const value = item[field];
          if (Array.isArray(value)) {
            return value.some((v) => v.toLowerCase().includes(q));
          }
          return value?.toString().toLowerCase().includes(q);
        })
      );
    };

    return {
      housing: filterFn(housing, ["name", "location", "type"]),
      mess: filterFn(messes, ["title", "name", "location"]),
      laundry: filterFn(laundry, ["name", "location", "services"]),
    };
  }, [housing, messes, laundry, debouncedSearch]);

  const activeList = filteredData[activeService] || [];

  // Handlers
  const handleServiceChange = useCallback((service) => {
    setActiveService(service);
    setSearchQuery("");
  }, []);

  const handleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, [setFavorites]);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleMessClick = useCallback((id) => {
    navigate(`/mess/${id}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}

      {/* Header */}
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      </Suspense>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Suspense fallback={null}>
          <Sidebar isOpen={isSidebarOpen} />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Welcome Header */}
          <section className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                    Welcome back
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    Hi, {username} 👋
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Find your perfect stay, meals, and services
                  </p>
                </div>

                <Link
                  to="/pgs/near-me"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 
                    text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  PGs Near Me
                </Link>
              </div>
            </div>
          </section>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Service Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {SERVICES.map((service) => (
                <ServiceTab
                  key={service.key}
                  service={service}
                  isActive={activeService === service.key}
                  onClick={handleServiceChange}
                />
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <div className="flex-1">
                <SearchInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={handleReset}
                  placeholder={`Search ${activeService}...`}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
                >
                  {viewMode === "grid" ? (
                    <LayoutList className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Grid3X3 className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                <button
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 
                    rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeService === "housing" && "Available PGs"}
                  {activeService === "mess" && "Mess Services"}
                  {activeService === "laundry" && "Laundry Services"}
                </h2>
                <p className="text-sm text-gray-500">
                  {loading ? "Loading..." : `${activeList.length} results`}
                </p>
              </div>

              {debouncedSearch && (
                <button
                  onClick={handleReset}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium 
                    flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Results Grid */}
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {/* Loading */}
              {loading &&
                [...Array(SKELETON_COUNT)].map((_, i) => <CardSkeleton key={i} />)}

              {/* Error */}
              {!loading && error && (
                <ErrorState message={error} onRetry={handleRetry} />
              )}

              {/* Empty */}
              {!loading && !error && activeList.length === 0 && (
                <EmptyState service={activeService} onReset={handleReset} />
              )}

              {/* Housing */}
              {!loading &&
                !error &&
                activeService === "housing" &&
                activeList.map((item) => (
                  <HousingCard
                    key={item.id}
                    item={item}
                    isFavorite={favorites.includes(item.id)}
                    onFavorite={handleFavorite}
                  />
                ))}

              {/* Mess */}
              {!loading &&
                !error &&
                activeService === "mess" &&
                activeList.map((item) => (
                  <MessCard key={item._id} item={item} onClick={handleMessClick} />
                ))}

              {/* Laundry */}
              {!loading &&
                !error &&
                activeService === "laundry" &&
                activeList.map((item) => (
                  <LaundryCard key={item.id} item={item} />
                ))}
            </div>
          </div>

          {/* Footer */}
          <Suspense fallback={<div className="h-48 bg-gray-900" />}>
            <Footer />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default memo(StudentDashboard);