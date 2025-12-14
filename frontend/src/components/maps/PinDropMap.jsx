import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  Check,
  ChevronRight,
  Clock,
  Target,
  Crosshair,
  RotateCcw,
  Info,
  CheckCircle2,
} from "lucide-react";


const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

const CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_RESULTS: 6,
  MAX_RECENT_SEARCHES: 5,
  DEFAULT_ZOOM: 15,
  DEFAULT_CENTER: { lat: 19.076, lng: 72.8777 },
  FLY_DURATION: 0.8,
};

const TILE_LAYERS = {
  default: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
    name: "Standard",
    icon: "🗺️",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    name: "Satellite",
    icon: "🛰️",
  },
};


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


const cn = (...classes) => classes.filter(Boolean).join(" ");

function useDebounce(value, delay = CONFIG.DEBOUNCE_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function useLocalStorage(key, initialValue) {
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
}


const createPinIcon = () =>
  L.divIcon({
    className: "custom-pin-marker",
    html: `
      <div class="pin-wrapper">
        <div class="pin-container">
          <div class="pin-head">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="pin-stem"></div>
        </div>
        <div class="pin-shadow"></div>
        <div class="pin-pulse"></div>
      </div>
    `,
    iconSize: [48, 64],
    iconAnchor: [24, 64],
  });


// Click Handler Component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Fly to position Component
function FlyToPosition({ position, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.flyTo([position.lat, position.lng], zoom || CONFIG.DEFAULT_ZOOM, {
        duration: CONFIG.FLY_DURATION,
      });
    }
  }, [position, zoom, map]);

  return null;
}

// Map Reference Component
function MapRef({ onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

// LOCATION SEARCH COMPONENT

function LocationSearch({ onSelectLocation, recentSearches, onAddRecent }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  const containerRef = useRef(null);

  const debouncedQuery = useDebounce(query, CONFIG.DEBOUNCE_MS);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < CONFIG.MIN_SEARCH_LENGTH) {
        setResults([]);
        return;
      }

      // Check if API key exists
      if (!GEOAPIFY_KEY) {
        console.warn("Geoapify API key is missing");
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
        )}&filter=countrycode:in&limit=${CONFIG.MAX_SEARCH_RESULTS}&lang=en&apiKey=${GEOAPIFY_KEY}`;

        const res = await fetch(url, { signal: controllerRef.current.signal });
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        const items = (data.features || []).map((f) => {
          const p = f.properties;
          return {
            id: p.place_id || `${f.geometry.coordinates[0]}-${f.geometry.coordinates[1]}`,
            name: p.name || p.street || p.locality || "Location",
            address: p.formatted || "",
            city: p.city || p.county || "",
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        });

        setResults(items);
        setFocusedIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Search error:", err);
          setResults([]);
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

  // Click outside
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
        name: item.name,
      });
      if (onAddRecent) {
        onAddRecent(item);
      }
    },
    [onSelectLocation, onAddRecent]
  );

  const handleKeyDown = useCallback(
    (e) => {
      const items = results.length > 0 ? results : recentSearches || [];
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
          if (inputRef.current) {
            inputRef.current.blur();
          }
          break;
        default:
          break;
      }
    },
    [results, recentSearches, focusedIndex, handleSelect]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const showDropdown =
    isOpen &&
    (results.length > 0 || (query.length === 0 && recentSearches?.length > 0));

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>

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
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl
            text-sm placeholder-slate-400 shadow-lg
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
            transition-all duration-200"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading ? (
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl
              border border-slate-100 overflow-hidden z-[2000] max-h-72 overflow-y-auto"
          >
            {/* Recent Searches */}
            {query.length === 0 && recentSearches && recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </p>
                </div>
                {recentSearches.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-start gap-3 transition-colors",
                      focusedIndex === index ? "bg-emerald-50" : "hover:bg-slate-50"
                    )}
                  >
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.address || item.city}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div>
                {query.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Suggestions
                    </p>
                  </div>
                )}
                {results.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-start gap-3 transition-colors",
                      focusedIndex === index ? "bg-emerald-50" : "hover:bg-slate-50"
                    )}
                  >
                    <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.address}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.length >= CONFIG.MIN_SEARCH_LENGTH &&
              !loading &&
              results.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No locations found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// MAP CONTROLS COMPONENT

function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onReset,
  isLocating,
  activeLayer,
  onLayerChange,
  hasPin,
}) {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 active:bg-slate-100"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2.5 hover:bg-slate-50 transition-colors active:bg-slate-100"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* My Location */}
      <button
        type="button"
        onClick={onLocate}
        disabled={isLocating}
        className={cn(
          "p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 transition-all",
          isLocating
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-slate-50 active:bg-slate-100"
        )}
        aria-label="My location"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        ) : (
          <Locate className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Layer Switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLayers(!showLayers)}
          className={cn(
            "p-2.5 rounded-xl shadow-lg border transition-all",
            showLayers
              ? "bg-emerald-50 border-emerald-200"
              : "bg-white border-slate-200 hover:bg-slate-50"
          )}
          aria-label="Map layers"
        >
          <Layers className="w-5 h-5 text-slate-600" />
        </button>

        <AnimatePresence>
          {showLayers && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-full mr-2 top-0 bg-white rounded-xl shadow-xl 
                border border-slate-200 overflow-hidden min-w-[130px]"
            >
              {Object.entries(TILE_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onLayerChange(key);
                    setShowLayers(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors flex items-center gap-2",
                    activeLayer === key
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>{layer.icon}</span>
                  {layer.name}
                  {activeLayer === key && (
                    <Check className="w-4 h-4 ml-auto text-emerald-600" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset */}
      {hasPin && (
        <button
          type="button"
          onClick={onReset}
          className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 
            hover:bg-slate-50 transition-colors active:bg-slate-100"
          aria-label="Reset pin"
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
        </button>
      )}
    </div>
  );
}

// INSTRUCTION OVERLAY

function InstructionOverlay({ hasPin }) {
  if (hasPin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000]"
    >
      <div
        className="bg-slate-900/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl
        shadow-xl flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium">Tap on map to drop pin</p>
          <p className="text-xs text-slate-400">Or search for a location above</p>
        </div>
      </div>
    </motion.div>
  );
}

// LOCATION INFO CARD

function LocationInfoCard({ position, address, onConfirm, onCancel, loading }) {
  if (!position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute bottom-4 left-4 right-4 z-[1000]"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-base">
                Selected Location
              </h3>
              <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                {address || "Fetching address..."}
              </p>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              Lat: {position.lat.toFixed(6)}
            </span>
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 rotate-90" />
              Lng: {position.lng.toFixed(6)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-medium
              rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !address}
            className={cn(
              "flex-1 py-3 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2",
              loading || !address
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirm Location
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// MAIN COMPONENT

function PinDropMap({ onConfirm, initialPosition, className }) {
  const [position, setPosition] = useState(initialPosition || null);
  const [address, setAddress] = useState("");
  const [activeLayer, setActiveLayer] = useState("default");
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage(
    "pinDropRecentSearches",
    []
  );
  const mapRef = useRef(null);

  // Reverse geocode to get address
  const fetchAddress = useCallback(async (lat, lng) => {
    if (!GEOAPIFY_KEY) {
      setAddress("Location selected (API key missing)");
      return;
    }

    setIsLoadingAddress(true);
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.features?.length > 0) {
        const p = data.features[0].properties;
        setAddress(p.formatted || "Unknown location");
      } else {
        setAddress("Location selected");
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
      setAddress("Unable to fetch address");
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (latlng) => {
      setPosition({ lat: latlng.lat, lng: latlng.lng });
      fetchAddress(latlng.lat, latlng.lng);
    },
    [fetchAddress]
  );

  // Handle search location select
  const handleSearchSelect = useCallback((loc) => {
    setPosition({ lat: loc.lat, lng: loc.lng });
    setAddress(loc.address || loc.name);
  }, []);

  // Add to recent searches
  const handleAddRecent = useCallback(
    (item) => {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.id !== item.id);
        return [item, ...filtered].slice(0, CONFIG.MAX_RECENT_SEARCHES);
      });
    },
    [setRecentSearches]
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (position && address && onConfirm) {
      onConfirm({
        lat: position.lat,
        lng: position.lng,
        address,
      });
    }
  }, [position, address, onConfirm]);

  // Handle reset
  const handleReset = useCallback(() => {
    setPosition(null);
    setAddress("");
  }, []);

  // Get current location
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        fetchAddress(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to get your location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchAddress]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  // Get tile layer
  const tileLayer = TILE_LAYERS[activeLayer] || TILE_LAYERS.default;

  // Pin icon
  const pinIcon = useMemo(() => createPinIcon(), []);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Bar */}
      <div className="mb-4">
        <LocationSearch
          onSelectLocation={handleSearchSelect}
          recentSearches={recentSearches}
          onAddRecent={handleAddRecent}
        />
      </div>

      {/* Map Container */}
      <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
        <MapContainer
          center={[
            initialPosition?.lat || CONFIG.DEFAULT_CENTER.lat,
            initialPosition?.lng || CONFIG.DEFAULT_CENTER.lng,
          ]}
          zoom={CONFIG.DEFAULT_ZOOM}
          scrollWheelZoom
          zoomControl={false}
          className="w-full h-full"
        >
          {/* Tile Layer */}
          <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />

          {/* Map Reference */}
          <MapRef onMapReady={(map) => { mapRef.current = map; }} />

          {/* Click Handler */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Fly to selected position */}
          {position && <FlyToPosition position={position} />}

          {/* Pin Marker */}
          {position && (
            <Marker position={[position.lat, position.lng]} icon={pinIcon} />
          )}

          {/* Accuracy Circle */}
          {position && (
            <Circle
              center={[position.lat, position.lng]}
              radius={50}
              pathOptions={{
                color: "#10b981",
                fillColor: "#34d399",
                fillOpacity: 0.1,
                weight: 2,
                dashArray: "4, 4",
              }}
            />
          )}
        </MapContainer>

        {/* Map Controls */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocate={handleLocate}
          onReset={handleReset}
          isLocating={isLocating}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          hasPin={!!position}
        />

        {/* Crosshair in center when no pin */}
        {!position && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[500]">
            <Crosshair className="w-10 h-10 text-emerald-500/50" />
          </div>
        )}

        {/* Instructions Overlay */}
        <InstructionOverlay hasPin={!!position} />

        {/* Location Info Card */}
        <AnimatePresence>
          {position && (
            <LocationInfoCard
              position={position}
              address={address}
              onConfirm={handleConfirm}
              onCancel={handleReset}
              loading={isLoadingAddress}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5" />
        <span>Click on the map or search to select a location</span>
      </div>

      {/* Styles */}
      <style>{`
        .custom-pin-marker {
          background: transparent !important;
          border: none !important;
        }

        .pin-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pin-container {
          position: relative;
          z-index: 2;
          animation: dropIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes dropIn {
          0% {
            transform: translateY(-40px);
            opacity: 0;
          }
          60% {
            transform: translateY(4px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .pin-head {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          border: 3px solid white;
        }

        .pin-head svg {
          width: 20px;
          height: 20px;
          color: white;
          transform: rotate(45deg);
        }

        .pin-stem {
          width: 4px;
          height: 16px;
          background: linear-gradient(to bottom, #059669, #047857);
          margin-top: -2px;
          border-radius: 0 0 2px 2px;
        }

        .pin-shadow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          filter: blur(3px);
          z-index: 1;
        }

        .pin-pulse {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          border: 2px solid rgba(16, 185, 129, 0.4);
          border-radius: 50%;
          animation: pinPulse 2s ease-out infinite;
          z-index: 0;
        }

        @keyframes pinPulse {
          0% {
            transform: translateX(-50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) scale(1.5);
            opacity: 0;
          }
        }

        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
        }

        .leaflet-popup-tip-container {
          display: none;
        }

        .leaflet-popup-close-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default PinDropMap;