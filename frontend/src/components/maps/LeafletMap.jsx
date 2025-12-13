// src/components/maps/LeafletMap.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  X,
  Loader2,
  Navigation,
  MapPin,
  Home,
  Utensils,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  Maximize2,
  Clock,
  Star,
  Phone,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

// ============ Constants ============
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 8;
const MAX_RECENT_SEARCHES = 5;
const DEFAULT_ZOOM = 14;

const TILE_LAYERS = {
  default: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    name: "Default",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    name: "Satellite",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
    name: "Terrain",
  },
};

// ============ Fix Leaflet Icons ============
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ============ Utility Functions ============
const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatPrice = (price) => {
  if (!price && price !== 0) return null;
  return `₹${price.toLocaleString("en-IN")}`;
};

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

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

  const setStoredValue = useCallback((newValue) => {
    try {
      const valueToStore = typeof newValue === "function" ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error("LocalStorage error:", err);
    }
  }, [key, value]);

  return [value, setStoredValue];
};

// ============ Custom Icons ============
const createUserLocationIcon = () =>
  L.divIcon({
    className: "user-location-marker",
    html: `
      <div class="user-marker-container">
        <div class="user-marker-pulse"></div>
        <div class="user-marker-dot"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

const createPGIcon = (isHovered = false) =>
  L.divIcon({
    className: "pg-marker",
    html: `
      <div class="marker-container ${isHovered ? "marker-hovered" : ""}">
        <div class="marker-pin pg-pin">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="marker-icon">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="marker-shadow"></div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45],
  });

const createMessIcon = (isHovered = false) =>
  L.divIcon({
    className: "mess-marker",
    html: `
      <div class="marker-container ${isHovered ? "marker-hovered" : ""}">
        <div class="marker-pin mess-pin">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="marker-icon">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
          </svg>
        </div>
        <div class="marker-shadow"></div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45],
  });

// ============ Sub Components ============

// Map View Controller
const MapViewController = memo(({ center, zoom, onMapMove }) => {
  const map = useMap();

  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], zoom, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);

  useMapEvents({
    moveend: () => {
      const newCenter = map.getCenter();
      onMapMove?.({
        lat: newCenter.lat,
        lng: newCenter.lng,
      });
    },
  });

  return null;
});

MapViewController.displayName = "MapViewController";

// Search Input Component
const SearchInput = memo(({ onSelectLocation, recentSearches, onAddRecent }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  const containerRef = useRef(null);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < MIN_SEARCH_LENGTH) {
        setResults([]);
        return;
      }

      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();

      setLoading(true);

      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          debouncedQuery
        )}&filter=countrycode:in&limit=${MAX_SEARCH_RESULTS}&lang=en&apiKey=${GEOAPIFY_KEY}`;

        const res = await fetch(url, { signal: controllerRef.current.signal });
        const data = await res.json();

        const items = (data.features || []).map((f) => {
          const p = f.properties;
          const parts = [
            p.housenumber,
            p.street,
            p.suburb,
            p.locality,
            p.district,
            p.city,
            p.state,
          ].filter(Boolean);

          return {
            id: f.properties.place_id || Math.random().toString(),
            name: p.name || p.street || p.locality || "Location",
            address: parts.join(", ") || p.formatted || p.city || "",
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            type: p.result_type || "place",
          };
        });

        setResults(items);
        setFocusedIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (item) => {
      setQuery(item.name);
      setIsOpen(false);
      setResults([]);
      onSelectLocation({
        lat: item.lat,
        lng: item.lng,
        address: item.address || item.name,
      });
      onAddRecent?.(item);
    },
    [onSelectLocation, onAddRecent]
  );

  const handleKeyDown = useCallback(
    (e) => {
      const items = results.length > 0 ? results : recentSearches;
      const maxIndex = items.length - 1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            handleSelect(items[focusedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [results, recentSearches, focusedIndex, handleSelect]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }, []);

  const showDropdown = isOpen && (results.length > 0 || (query.length === 0 && recentSearches?.length > 0));

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[1000]"
    >
      <div className="relative">
        {/* Input Field */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search location, area, landmark..."
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl 
              shadow-lg text-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
              transition-all duration-200"
            aria-label="Search location"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
          />

          {/* Loading / Clear Button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            ) : query ? (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl 
              border border-gray-100 overflow-hidden z-[2000] max-h-80 overflow-y-auto"
            role="listbox"
          >
            {/* Recent Searches */}
            {query.length === 0 && recentSearches?.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </p>
                </div>
                {recentSearches.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-start gap-3 transition-colors",
                      focusedIndex === index ? "bg-indigo-50" : "hover:bg-gray-50"
                    )}
                    role="option"
                    aria-selected={focusedIndex === index}
                  >
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.address}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Suggestions
                  </p>
                </div>
                {results.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-start gap-3 transition-colors",
                      focusedIndex === index ? "bg-indigo-50" : "hover:bg-gray-50"
                    )}
                    role="option"
                    aria-selected={focusedIndex === index}
                  >
                    <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.address}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

SearchInput.displayName = "SearchInput";

// Custom Marker with Popup
const CustomMarker = memo(({ marker, isHovered, onHover, onLeave }) => {
  const markerRef = useRef(null);

  // Get icon based on type and hover state
  const icon = useMemo(() => {
    if (marker.isCenter) return createUserLocationIcon();
    if (marker.type === "mess") return createMessIcon(isHovered);
    return createPGIcon(isHovered);
  }, [marker.type, marker.isCenter, isHovered]);

  // Open popup on hover
  useEffect(() => {
    if (isHovered && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isHovered]);

  if (marker.isCenter) {
    return (
      <Marker
        position={[marker.lat, marker.lng]}
        icon={icon}
        ref={markerRef}
      >
        <Popup className="custom-popup center-popup">
          <div className="text-center py-1">
            <p className="font-semibold text-gray-900 text-sm">
              {marker.address || "Search Area"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Your search center
            </p>
          </div>
        </Popup>
      </Marker>
    );
  }

  const isPG = marker.type !== "mess";
  const price = marker.extra?.monthlyRent;

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      ref={markerRef}
      eventHandlers={{
        mouseover: () => {
          onHover?.(marker.id);
          markerRef.current?.openPopup();
        },
        mouseout: () => {
          onLeave?.();
          markerRef.current?.closePopup();
        },
      }}
    >
      <Popup className={`custom-popup ${isPG ? "pg-popup" : "mess-popup"}`}>
        <div className="min-w-[200px] max-w-[260px]">
          {/* Header */}
          <div className="flex items-start gap-2 mb-2">
            <div
              className={cn(
                "p-1.5 rounded-lg flex-shrink-0",
                isPG ? "bg-indigo-100" : "bg-orange-100"
              )}
            >
              {isPG ? (
                <Home className="w-4 h-4 text-indigo-600" />
              ) : (
                <Utensils className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                {marker.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {marker.address || "No address"}
              </p>
            </div>
          </div>

          {/* Price */}
          {price && (
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold mb-2",
                isPG ? "bg-indigo-50 text-indigo-700" : "bg-orange-50 text-orange-700"
              )}
            >
              {formatPrice(price)}
              <span className="text-xs font-normal opacity-70">/month</span>
            </div>
          )}

          {/* Rating & Distance */}
          {(marker.extra?.rating || marker.extra?.distance) && (
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              {marker.extra?.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {marker.extra.rating}
                </span>
              )}
              {marker.extra?.distance && (
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  {marker.extra.distance}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {marker.extra?.phone && (
              <a
                href={`tel:${marker.extra.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 
                  bg-gray-100 text-gray-700 text-xs font-medium rounded-lg
                  hover:bg-gray-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            )}
            <a
              href={isPG ? `/services/pg/${marker.id.replace("pg-", "")}` : `/mess/${marker.id.replace("mess-", "")}`}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-colors",
                isPG
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              )}
            >
              View
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

CustomMarker.displayName = "CustomMarker";

// Map Controls Component
const MapControls = memo(({
  onZoomIn,
  onZoomOut,
  onLocate,
  onFullscreen,
  isLocating,
  activeLayer,
  onLayerChange,
}) => {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="absolute right-4 top-20 z-[1000] flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2.5 hover:bg-gray-50 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* My Location */}
      <button
        onClick={onLocate}
        disabled={isLocating}
        className="p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 
          hover:bg-gray-50 transition-colors disabled:opacity-50"
        aria-label="My location"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        ) : (
          <Locate className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Layer Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={cn(
            "p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 transition-colors",
            showLayers ? "bg-indigo-50 border-indigo-200" : "hover:bg-gray-50"
          )}
          aria-label="Map layers"
        >
          <Layers className="w-5 h-5 text-gray-600" />
        </button>

        {showLayers && (
          <div className="absolute right-full mr-2 top-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[120px]">
            {Object.entries(TILE_LAYERS).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => {
                  onLayerChange(key);
                  setShowLayers(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  activeLayer === key
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {layer.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen */}
      <button
        onClick={onFullscreen}
        className="p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 
          hover:bg-gray-50 transition-colors"
        aria-label="Fullscreen"
      >
        <Maximize2 className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
});

MapControls.displayName = "MapControls";

// Location Info Bar
const LocationInfoBar = memo(({ address, markerCounts }) => (
  <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto z-[1000]">
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 px-4 py-2.5 flex items-center gap-3">
      <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {address || "Move map or search to select area"}
        </p>
      </div>
      
      {/* Marker counts */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {markerCounts.pg > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
            <Home className="w-3 h-3" />
            {markerCounts.pg}
          </span>
        )}
        {markerCounts.mess > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            <Utensils className="w-3 h-3" />
            {markerCounts.mess}
          </span>
        )}
      </div>
    </div>
  </div>
));

LocationInfoBar.displayName = "LocationInfoBar";

// ============ Main Component ============
const LeafletMap = forwardRef(({
  center,
  markers = [],
  radiusKm,
  onCenterChange,
  hoveredMarkerId,
  onMarkerHover,
  onMarkerLeave,
  className = "",
  showSearch = true,
  showControls = true,
  showInfoBar = true,
}, ref) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("default");
  const [isLocating, setIsLocating] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage("mapRecentSearches", []);

  // Expose map methods via ref
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom) => {
      mapRef.current?.flyTo([lat, lng], zoom || DEFAULT_ZOOM);
    },
    setZoom: (zoom) => {
      mapRef.current?.setZoom(zoom);
    },
    getCenter: () => mapRef.current?.getCenter(),
    getZoom: () => mapRef.current?.getZoom(),
  }), []);

  // Calculate marker counts
  const markerCounts = useMemo(() => {
    const pgs = markers.filter((m) => m.type === "pg" && !m.isCenter);
    const messes = markers.filter((m) => m.type === "mess" && !m.isCenter);
    return { pg: pgs.length, mess: messes.length };
  }, [markers]);

  // Add recent search
  const handleAddRecent = useCallback((item) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.id !== item.id);
      return [item, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, [setRecentSearches]);

  // Location selection
  const handleLocationSelect = useCallback((loc) => {
    onCenterChange?.({
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
    });
  }, [onCenterChange]);

  // Map controls handlers
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onCenterChange?.({
          lat: latitude,
          lng: longitude,
          address: "Your Location",
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onCenterChange]);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen?.();
    }
  }, []);

  // Get current tile layer
  const tileLayer = TILE_LAYERS[activeLayer] || TILE_LAYERS.default;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", className)}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="w-full h-full"
        ref={mapRef}
      >
        {/* Tile Layer */}
        <TileLayer
          url={tileLayer.url}
          attribution={tileLayer.attribution}
        />

        {/* Map View Controller */}
        <MapViewController
          center={center}
          zoom={DEFAULT_ZOOM}
          onMapMove={(newCenter) => {
            // Optional: update center on map drag
          }}
        />

        {/* Radius Circle */}
        {radiusKm && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#6366f1",
              fillColor: "#818cf8",
              fillOpacity: 0.1,
              weight: 2,
              dashArray: "5, 5",
            }}
          />
        )}

        {/* Markers */}
        {markers
          .filter((m) => m.lat && m.lng)
          .map((marker) => (
            <CustomMarker
              key={marker.id}
              marker={marker}
              isHovered={hoveredMarkerId === marker.id}
              onHover={onMarkerHover}
              onLeave={onMarkerLeave}
            />
          ))}
      </MapContainer>

      {/* Search Input */}
      {showSearch && (
        <SearchInput
          onSelectLocation={handleLocationSelect}
          recentSearches={recentSearches}
          onAddRecent={handleAddRecent}
        />
      )}

      {/* Map Controls */}
      {showControls && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocate={handleLocate}
          onFullscreen={handleFullscreen}
          isLocating={isLocating}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />
      )}

      {/* Location Info Bar */}
      {showInfoBar && (
        <LocationInfoBar
          address={center.address}
          markerCounts={markerCounts}
        />
      )}

      {/* Styles */}
      <style>{`
        /* User Location Marker */
        .user-marker-container {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .user-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: 3px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
          z-index: 2;
        }

        .user-marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(99, 102, 241, 0.5);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }

        /* Marker Container */
        .marker-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .marker-container.marker-hovered .marker-pin {
          transform: scale(1.15) translateY(-4px);
        }

        .marker-container.marker-hovered .marker-shadow {
          transform: scale(1.3);
          opacity: 0.3;
        }

        /* Marker Pin Base */
        .marker-pin {
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease;
        }

        .marker-pin .marker-icon {
          width: 16px;
          height: 16px;
          color: white;
          transform: rotate(45deg);
        }

        /* PG Pin */
        .pg-pin {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        }

        /* Mess Pin */
        .mess-pin {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        }

        /* Marker Shadow */
        .marker-shadow {
          position: absolute;
          bottom: -4px;
          width: 20px;
          height: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          filter: blur(2px);
          transition: all 0.2s ease;
        }

        /* Custom Popup Styles */
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .leaflet-popup-content {
          margin: 12px 14px !important;
          font-family: inherit;
        }

        .leaflet-popup-tip-container {
          display: none;
        }

        .leaflet-popup-close-button {
          display: none !important;
        }

        /* Popup Type Colors */
        .pg-popup .leaflet-popup-content-wrapper {
          border-top: 3px solid #6366f1;
        }

        .mess-popup .leaflet-popup-content-wrapper {
          border-top: 3px solid #f97316;
        }

        .center-popup .leaflet-popup-content-wrapper {
          border-top: 3px solid #06b6d4;
        }

        /* Hide default Leaflet attribution on mobile */
        @media (max-width: 640px) {
          .leaflet-control-attribution {
            font-size: 8px;
            padding: 2px 4px;
          }
        }

        /* Fullscreen styles */
        .leaflet-container:-webkit-full-screen {
          width: 100% !important;
          height: 100% !important;
        }

        .leaflet-container:fullscreen {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
});

LeafletMap.displayName = "LeafletMap";

export default memo(LeafletMap);