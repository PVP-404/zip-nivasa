// src/pages/pgs/PGNearMe.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  lazy,
  Suspense,
  useRef,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Navigation,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  BedDouble,
  Utensils,
  X,
  Loader2,
  RefreshCw,
  WifiOff,
  AlertCircle,
  List,
  Map as MapIcon,
  Filter,
  ArrowRight,
  Locate,
  Minus,
  Plus,
  Star,
  Phone,
  ExternalLink,
} from "lucide-react";

import { fetchPGsNearMe } from "../../services/pgService";
import { fetchMessesNearMe } from "../../services/messService";

// Lazy load heavy components
const Header = lazy(() => import("../../components/Header"));
const LeafletMap = lazy(() => import("../../components/maps/LeafletMap"));

// ============ Constants ============
const DEFAULT_CENTER = {
  lat: 18.5204,
  lng: 73.8567,
  address: "Pune, Maharashtra, India",
};

const DEFAULT_RADIUS = 5;
const MIN_RADIUS = 1;
const MAX_RADIUS = 30;
const RADIUS_STEP = 1;
const MAX_PRICE = 100000;
const PRICE_STEP = 1000;

const VIEW_MODES = [
  { key: "pg", label: "PGs", icon: BedDouble, color: "indigo" },
  { key: "mess", label: "Messes", icon: Utensils, color: "orange" },
  { key: "both", label: "Both", icon: null, color: "purple" },
];

const SORT_OPTIONS = [
  { value: "distance", label: "Nearest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

// ============ Utilities ============
const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatPrice = (price) => {
  if (!price && price !== 0) return "N/A";
  return `₹${price.toLocaleString("en-IN")}`;
};

const formatDistance = (km) => {
  if (!km && km !== 0) return "N/A";
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
};

// ============ Custom Hooks ============
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
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

const useGeolocation = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    position: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        let message = "Unable to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        setState({ loading: false, error: message, position: null });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, getLocation };
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
        const valueToStore =
          typeof newValue === "function" ? newValue(value) : newValue;
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

// ============ Sub Components ============

// Loading Overlay
const LoadingOverlay = memo(({ message = "Loading..." }) => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  </div>
));

LoadingOverlay.displayName = "LoadingOverlay";

// Offline Banner
const OfflineBanner = memo(() => (
  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2">
    <WifiOff className="w-4 h-4 text-amber-600" />
    <span className="text-sm font-medium text-amber-700">
      You're offline. Some features may not work.
    </span>
  </div>
));

OfflineBanner.displayName = "OfflineBanner";

// Error State
const ErrorState = memo(({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-7 h-7 text-red-500" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">
      Something went wrong
    </h3>
    <p className="text-sm text-gray-500 mb-4 max-w-xs">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </div>
));

ErrorState.displayName = "ErrorState";

// Empty State
const EmptyState = memo(({ onAdjustFilters }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <MapPin className="w-7 h-7 text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">
      No results found
    </h3>
    <p className="text-sm text-gray-500 mb-4 max-w-xs">
      Try increasing the search radius or adjusting your filters.
    </p>
    <button
      onClick={onAdjustFilters}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
    >
      <SlidersHorizontal className="w-4 h-4" />
      Adjust Filters
    </button>
  </div>
));

EmptyState.displayName = "EmptyState";

// View Mode Toggle
const ViewModeToggle = memo(({ value, onChange }) => (
  <div className="flex items-center bg-gray-100 p-1 rounded-xl">
    {VIEW_MODES.map((mode) => {
      const Icon = mode.icon;
      const isActive = value === mode.key;

      return (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            isActive
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {mode.key === "both" ? (
            <span className="flex -space-x-1">
              <BedDouble className="w-3.5 h-3.5" />
              <Utensils className="w-3.5 h-3.5" />
            </span>
          ) : (
            Icon && <Icon className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      );
    })}
  </div>
));

ViewModeToggle.displayName = "ViewModeToggle";

// Radius Slider
const RadiusSlider = memo(({ value, onChange, min = MIN_RADIUS, max = MAX_RADIUS }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={() => onChange(Math.max(min, value - RADIUS_STEP))}
      disabled={value <= min}
      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Minus className="w-4 h-4 text-gray-600" />
    </button>

    <div className="flex-1 flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={RADIUS_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600 h-1.5 cursor-pointer"
      />
      <span className="text-sm font-bold text-indigo-600 min-w-[4ch] text-right">
        {value}km
      </span>
    </div>

    <button
      onClick={() => onChange(Math.min(max, value + RADIUS_STEP))}
      disabled={value >= max}
      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Plus className="w-4 h-4 text-gray-600" />
    </button>
  </div>
));

RadiusSlider.displayName = "RadiusSlider";

// Location Button
const LocationButton = memo(({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 
      text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25
      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
  >
    {loading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Locate className="w-4 h-4" />
    )}
    <span className="hidden sm:inline">My Location</span>
  </button>
));

LocationButton.displayName = "LocationButton";

// PG Card
const PGCard = memo(({ item, index, isHovered, onHover, onLeave }) => (
  <Link
    to={`/services/pg/${item._id}`}
    onMouseEnter={() => onHover(`pg-${item._id}`)}
    onMouseLeave={onLeave}
    className={cn(
      "block relative bg-white rounded-xl border p-4 transition-all duration-200",
      "hover:shadow-lg hover:-translate-y-0.5",
      isHovered
        ? "border-indigo-400 shadow-lg ring-2 ring-indigo-500/20"
        : "border-gray-200 shadow-sm"
    )}
  >
    {/* Rank Badge */}
    <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-lg">
      #{index + 1}
    </div>

    {/* Content */}
    <div className="flex gap-3">
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BedDouble className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
          {item.title}
        </h3>

        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2 line-clamp-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{item.address || item.location}</span>
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Price */}
          <span className="text-base font-bold text-indigo-600">
            {formatPrice(item.monthlyRent)}
            <span className="text-xs font-normal text-gray-400">/mo</span>
          </span>

          {/* Distance */}
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
            {formatDistance(item.distanceKm)}
          </span>

          {/* Rating */}
          {item.rating && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {item.rating}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 self-center" />
    </div>
  </Link>
));

PGCard.displayName = "PGCard";

// Mess Card
const MessCard = memo(({ item, index, isHovered, onHover, onLeave }) => (
  <Link
    to={`/mess/${item._id}`}
    onMouseEnter={() => onHover(`mess-${item._id}`)}
    onMouseLeave={onLeave}
    className={cn(
      "block relative bg-white rounded-xl border p-4 transition-all duration-200",
      "hover:shadow-lg hover:-translate-y-0.5",
      isHovered
        ? "border-orange-400 shadow-lg ring-2 ring-orange-500/20"
        : "border-gray-200 shadow-sm"
    )}
  >
    {/* Type Badge */}
    <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs rounded-lg flex items-center justify-center shadow-lg">
      🍽
    </div>

    {/* Content */}
    <div className="flex gap-3">
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
            {item.title}
          </h3>
          {item.type && (
            <span
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase flex-shrink-0",
                item.type === "Veg"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {item.type}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2 line-clamp-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {item.mapplsAddress || item.streetAddress || item.location}
          </span>
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Price */}
          <span className="text-base font-bold text-orange-600">
            {formatPrice(item.price)}
            <span className="text-xs font-normal text-gray-400">/mo</span>
          </span>

          {/* Distance */}
          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
            {formatDistance(item.distanceKm)}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 self-center" />
    </div>
  </Link>
));

MessCard.displayName = "MessCard";

// Results Stats Badge
const ResultsBadge = memo(({ pgCount, messCount, radius }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
    <span className="text-xs font-semibold text-gray-700">
      {pgCount + messCount} results
    </span>
    <span className="w-1 h-1 rounded-full bg-gray-300" />
    <span className="text-xs text-gray-500">{radius}km radius</span>
  </div>
));

ResultsBadge.displayName = "ResultsBadge";

// Mobile Bottom Sheet
const MobileBottomSheet = memo(({
  isOpen,
  onToggle,
  children,
  title,
  count,
}) => (
  <div
    className={cn(
      "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200",
      "transform transition-transform duration-300 ease-out",
      "max-h-[70vh] flex flex-col",
      isOpen ? "translate-y-0" : "translate-y-[calc(100%-4rem)]"
    )}
  >
    {/* Handle */}
    <button
      onClick={onToggle}
      className="w-full py-3 flex flex-col items-center gap-2"
    >
      <div className="w-10 h-1 bg-gray-300 rounded-full" />
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{title}</span>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
          {count}
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </button>

    {/* Content */}
    <div className="flex-1 overflow-y-auto px-4 pb-safe">{children}</div>
  </div>
));

MobileBottomSheet.displayName = "MobileBottomSheet";

// Desktop Side Panel
const DesktopSidePanel = memo(({
  isCollapsed,
  onToggle,
  loading,
  children,
  pgCount,
  messCount,
}) => (
  <div
    className={cn(
      "absolute right-4 top-20 bottom-4 w-96 z-40",
      "transform transition-all duration-300 ease-out",
      isCollapsed ? "translate-x-[calc(100%+1rem)]" : "translate-x-0"
    )}
  >
    {/* Collapse Toggle */}
    <button
      onClick={onToggle}
      className={cn(
        "absolute top-4 -left-10 w-8 h-8 bg-white rounded-l-lg shadow-lg",
        "flex items-center justify-center hover:bg-gray-50 transition-colors"
      )}
    >
      {isCollapsed ? (
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-600" />
      )}
    </button>

    {/* Panel */}
    <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Search className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Nearby Results</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{pgCount} PGs</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{messCount} Messes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>Real-time results</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            PG
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Mess
          </span>
        </div>
      </div>
    </div>
  </div>
));

DesktopSidePanel.displayName = "DesktopSidePanel";

// Filters Panel
const FiltersPanel = memo(({
  sortBy,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  isOpen,
  onClose,
  isMobile,
}) => {
  const content = (
    <div className="space-y-4">
      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort by
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm 
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Max Price</label>
          <span className="text-sm font-semibold text-indigo-600">
            {formatPrice(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹0</span>
          <span>₹1L</span>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 transform transition-transform duration-300",
            isOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  }

  return isOpen ? (
    <div className="p-4 border-t border-gray-100">{content}</div>
  ) : null;
});

FiltersPanel.displayName = "FiltersPanel";

// Map View Toggle (Mobile)
const MapListToggle = memo(({ showMap, onToggle }) => (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:hidden">
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-full shadow-lg"
    >
      {showMap ? (
        <>
          <List className="w-4 h-4" />
          <span className="text-sm font-medium">List</span>
        </>
      ) : (
        <>
          <MapIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Map</span>
        </>
      )}
    </button>
  </div>
));

MapListToggle.displayName = "MapListToggle";

// ============ Main Component ============
const PGNearMe = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isOnline = useOnlineStatus();
  const { loading: geoLoading, error: geoError, position, getLocation } = useGeolocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Refs
  const mapRef = useRef(null);

  // State
  const [searchCenter, setSearchCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useLocalStorage("nearbyRadius", DEFAULT_RADIUS);
  const [viewMode, setViewMode] = useLocalStorage("nearbyViewMode", "both");
  const [sortBy, setSortBy] = useState("distance");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // Data State
  const [pgs, setPgs] = useState([]);
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showMapMobile, setShowMapMobile] = useState(true);
  const [hoveredCardKey, setHoveredCardKey] = useState(null);

  // Handle geolocation result
  useEffect(() => {
    if (position) {
      setSearchCenter({
        lat: position.lat,
        lng: position.lng,
        address: "Your Location",
      });
    }
  }, [position]);

  // Fetch nearby data
  const fetchNearbyData = useCallback(async () => {
    if (!searchCenter?.lat || !searchCenter?.lng) return;

    setLoading(true);
    setError(null);

    try {
      const [pgRes, messRes] = await Promise.all([
        fetchPGsNearMe(searchCenter.lat, searchCenter.lng, radiusKm),
        fetchMessesNearMe(searchCenter.lat, searchCenter.lng, radiusKm),
      ]);

      setPgs(pgRes?.data?.pgs || pgRes?.pgs || []);
      setMesses(messRes?.data?.messes || messRes?.messes || []);
    } catch (err) {
      console.error("Error fetching nearby data:", err);
      setError("Failed to load nearby results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchCenter, radiusKm]);

  useEffect(() => {
    fetchNearbyData();
  }, [fetchNearbyData]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    const filterByPrice = (items, priceField) =>
      items.filter((item) => (item[priceField] ?? 0) <= maxPrice);

    const sortItems = (items, priceField) => {
      const sorted = [...items];
      switch (sortBy) {
        case "distance":
          return sorted.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
        case "price-low":
          return sorted.sort((a, b) => (a[priceField] ?? 0) - (b[priceField] ?? 0));
        case "price-high":
          return sorted.sort((a, b) => (b[priceField] ?? 0) - (a[priceField] ?? 0));
        case "rating":
          return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        default:
          return sorted;
      }
    };

    const filteredPGs = sortItems(filterByPrice(pgs, "monthlyRent"), "monthlyRent");
    const filteredMesses = sortItems(filterByPrice(messes, "price"), "price");

    return {
      pgs: viewMode === "mess" ? [] : filteredPGs,
      messes: viewMode === "pg" ? [] : filteredMesses,
    };
  }, [pgs, messes, viewMode, maxPrice, sortBy]);

  const totalCount = filteredData.pgs.length + filteredData.messes.length;

  // Map markers
  const markers = useMemo(() => {
    const markerList = [];

    // Center marker
    if (searchCenter) {
      markerList.push({
        id: "center",
        lat: searchCenter.lat,
        lng: searchCenter.lng,
        title: searchCenter.address || "Search Area",
        isCenter: true,
      });
    }

    // PG markers
    filteredData.pgs
      .filter((p) => p.latitude && p.longitude)
      .forEach((p) => {
        markerList.push({
          id: `pg-${p._id}`,
          lat: p.latitude,
          lng: p.longitude,
          title: p.title,
          address: p.address || p.location,
          extra: { monthlyRent: p.monthlyRent },
          type: "pg",
        });
      });

    // Mess markers
    filteredData.messes
      .filter((m) => m.latitude && m.longitude)
      .forEach((m) => {
        markerList.push({
          id: `mess-${m._id}`,
          lat: m.latitude,
          lng: m.longitude,
          title: m.title,
          address: m.mapplsAddress || m.streetAddress || m.location,
          extra: { monthlyRent: m.price },
          type: "mess",
        });
      });

    return markerList;
  }, [searchCenter, filteredData]);

  // Handlers
  const handleMapCenterChange = useCallback((newCenter) => {
    setSearchCenter(newCenter);
  }, []);

  const handleHover = useCallback((key) => {
    setHoveredCardKey(key);
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredCardKey(null);
  }, []);

  const handleAdjustFilters = useCallback(() => {
    setShowFilters(true);
    if (isMobile) {
      setIsBottomSheetOpen(false);
    }
  }, [isMobile]);

  // Render results list
  const renderResults = () => {
    if (loading && totalCount === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Finding nearby places...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={fetchNearbyData} />;
    }

    if (totalCount === 0) {
      return <EmptyState onAdjustFilters={handleAdjustFilters} />;
    }

    return (
      <div className="space-y-4 p-4">
        {/* PGs */}
        {filteredData.pgs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              PGs near you ({filteredData.pgs.length})
            </h3>
            {filteredData.pgs.map((pg, index) => (
              <PGCard
                key={pg._id}
                item={pg}
                index={index}
                isHovered={hoveredCardKey === `pg-${pg._id}`}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}

        {/* Messes */}
        {filteredData.messes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Messes near you ({filteredData.messes.length})
            </h3>
            {filteredData.messes.map((mess, index) => (
              <MessCard
                key={mess._id}
                item={mess}
                index={index}
                isHovered={hoveredCardKey === `mess-${mess._id}`}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}

      {/* Header */}
      <Suspense fallback={<div className="h-16 bg-white border-b" />}>
        <Header />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Map */}
        <div
          className={cn(
            "absolute inset-0 z-10",
            isMobile && !showMapMobile && "hidden"
          )}
        >
          <Suspense
            fallback={
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            }
          >
            <LeafletMap
              ref={mapRef}
              center={searchCenter}
              markers={markers}
              radiusKm={radiusKm}
              onCenterChange={handleMapCenterChange}
              hoveredMarkerId={hoveredCardKey}
              className="h-full w-full"
            />
          </Suspense>
        </div>

        {/* Results Badge (Desktop) */}
        <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <ResultsBadge
            pgCount={filteredData.pgs.length}
            messCount={filteredData.messes.length}
            radius={radiusKm}
          />
        </div>

        {/* Controls Panel */}
        <div
          className={cn(
            "absolute z-40",
            isMobile
              ? "top-2 left-2 right-2"
              : "top-4 left-4 w-80"
          )}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Location & Radius */}
            <div className="p-3 sm:p-4 space-y-3">
              {/* Location Row */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                    Searching in
                  </p>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {searchCenter.address?.split(",")[0] || "Search Area"}
                    </span>
                  </div>
                </div>
                <LocationButton onClick={getLocation} loading={geoLoading} />
              </div>

              {/* Radius */}
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                  Search Radius
                </p>
                <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
              </div>

              {/* View Mode & Filters */}
              <div className="flex items-center justify-between gap-2">
                <ViewModeToggle value={viewMode} onChange={setViewMode} />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                    showFilters
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Filters Panel (Desktop) */}
            {!isMobile && (
              <FiltersPanel
                sortBy={sortBy}
                onSortChange={setSortBy}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                isMobile={false}
              />
            )}
          </div>
        </div>

        {/* Desktop Side Panel */}
        {!isMobile && (
          <DesktopSidePanel
            isCollapsed={isPanelCollapsed}
            onToggle={() => setIsPanelCollapsed(!isPanelCollapsed)}
            loading={loading}
            pgCount={filteredData.pgs.length}
            messCount={filteredData.messes.length}
          >
            {renderResults()}
          </DesktopSidePanel>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <MobileBottomSheet
            isOpen={isBottomSheetOpen}
            onToggle={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
            title="Results"
            count={totalCount}
          >
            {renderResults()}
          </MobileBottomSheet>
        )}

        {/* Mobile Map/List Toggle */}
        {isMobile && (
          <MapListToggle
            showMap={showMapMobile}
            onToggle={() => setShowMapMobile(!showMapMobile)}
          />
        )}

        {/* Mobile Filters Modal */}
        {isMobile && (
          <FiltersPanel
            sortBy={sortBy}
            onSortChange={setSortBy}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            isMobile={true}
          />
        )}

        {/* Mobile List View */}
        {isMobile && !showMapMobile && (
          <div className="absolute inset-0 z-20 bg-gray-50 overflow-y-auto">
            {renderResults()}
          </div>
        )}

        {/* Geolocation Error Toast */}
        {geoError && (
          <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{geoError}</p>
                <button
                  onClick={getLocation}
                  className="text-xs text-red-600 font-medium hover:underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Styles */}
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default memo(PGNearMe);