import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaHistory,
  FaSpinner,
  FaTimes,
  FaSearchLocation,
} from "react-icons/fa";
import { LocateFixed, Navigation } from "lucide-react";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Click outside hook
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// Local storage helpers
const RECENT_SEARCHES_KEY = "recentLocationSearches";
const MAX_RECENT_SEARCHES = 5;

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (location) => {
  try {
    const recent = getRecentSearches();
    // Use fullAddress for comparison to avoid duplicates
    const filtered = recent.filter(
      (item) => item.fullAddress !== location.fullAddress
    );
    const updated = [location, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving recent search:", err);
  }
};

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper to create full address
const createFullAddress = (placeName, placeAddress) => {
  if (!placeAddress || placeAddress.trim() === "") {
    return placeName;
  }
  return `${placeName}, ${placeAddress}`;
};

// Highlight matching text component
const HighlightText = memo(function HighlightText({ text, highlight }) {
  if (!highlight.trim()) return <span>{text}</span>;

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-emerald-100 text-emerald-800 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
});

const LocationAutosuggest = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [geoLoading, setGeoLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const debouncedQuery = useDebounce(inputValue, 300);

  // Close dropdown on click outside
  useClickOutside(containerRef, () => setIsOpen(false));

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Sync with parent value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
    }
  }, [value]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      const query = debouncedQuery.trim();

      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      // Check cache first
      const cached = getCachedData(query.toLowerCase());
      if (cached) {
        setSuggestions(cached);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/map/autosuggest`,
          {
            params: { query },
            signal: abortControllerRef.current.signal,
            timeout: 5000,
          }
        );

        const results = res.data.suggestions || [];
        setSuggestions(results);
        setCachedData(query.toLowerCase(), results);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Autosuggest error:", err);
        setError("Failed to fetch suggestions");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  const handleInputChange = useCallback(
    (e) => {
      const text = e.target.value;
      setInputValue(text);
      onChange(text);
      setIsOpen(true);
      setActiveIndex(-1);
      setError(null);
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (item) => {
      // Create full address combining placeName and placeAddress
      const fullAddress = createFullAddress(item.placeName, item.placeAddress);

      // Set input value to full address
      setInputValue(fullAddress);

      // Pass full address to parent
      onChange(fullAddress);

      // Close dropdown
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);

      // Save to recent searches with all data
      const searchItem = {
        placeName: item.placeName,
        placeAddress: item.placeAddress || "",
        fullAddress: fullAddress,
        lat: item.lat,
        lng: item.lng,
      };
      saveRecentSearch(searchItem);
      setRecentSearches(getRecentSearches());
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
    setSuggestions([]);
    setError(null);
    inputRef.current?.focus();
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
    if (!inputValue.trim()) {
      setRecentSearches(getRecentSearches());
    }
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e) => {
      const items = suggestions.length > 0 ? suggestions : recentSearches;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && items[activeIndex]) {
            handleSelect(items[activeIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [suggestions, recentSearches, activeIndex, handleSelect]
  );

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setGeoLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/map/reverse-geocode`,
        { params: { lat: latitude, lng: longitude } }
      );

      if (res.data.address) {
        const location = {
          placeName: res.data.placeName || res.data.address,
          placeAddress: res.data.placeAddress || "",
          lat: latitude,
          lng: longitude,
        };
        handleSelect(location);
      }
    } catch (err) {
      console.error("Geolocation error:", err);
      setError(
        err.code === 1 ? "Location access denied" : "Could not get location"
      );
    } finally {
      setGeoLoading(false);
    }
  }, [handleSelect]);

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }, []);

  const showDropdown =
    isOpen &&
    (loading ||
      suggestions.length > 0 ||
      (inputValue.trim().length === 0 && recentSearches.length > 0) ||
      error);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search area, landmark, city..."}
          className="w-full pl-10 pr-20 py-3 border border-slate-200 rounded-xl 
                     focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 
                     text-base font-medium transition-all duration-200
                     placeholder:text-slate-400"
          autoComplete="off"
          aria-label="Search location"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Right side buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Clear input"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={geoLoading}
            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 
                       rounded-lg transition-colors disabled:opacity-50"
            aria-label="Use current location"
            title="Use current location"
          >
            {geoLoading ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute mt-2 w-full bg-white shadow-xl rounded-xl border border-slate-100 
                     max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {/* Loading State */}
          {loading && (
            <div className="flex items-center gap-3 p-4 text-slate-500">
              <FaSpinner className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center gap-3 p-4 text-red-500 bg-red-50">
              <FaSearchLocation className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Suggestions */}
          {!loading && suggestions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                Suggestions
              </div>
              {suggestions.map((item, idx) => {
                const fullAddress = createFullAddress(
                  item.placeName,
                  item.placeAddress
                );
                return (
                  <div
                    key={`suggestion-${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-start gap-3 p-3 cursor-pointer border-b border-slate-50 last:border-0
                               transition-colors duration-150
                               ${
                                 activeIndex === idx
                                   ? "bg-emerald-50"
                                   : "hover:bg-slate-50"
                               }`}
                    role="option"
                    aria-selected={activeIndex === idx}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FaMapMarkerAlt className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        <HighlightText
                          text={item.placeName}
                          highlight={inputValue}
                        />
                      </p>
                      {item.placeAddress && (
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {item.placeAddress}
                        </p>
                      )}
                      {/* Show full address preview on hover */}
                      {activeIndex === idx && (
                        <p className="text-xs text-emerald-600 mt-1 truncate">
                          → {fullAddress}
                        </p>
                      )}
                    </div>
                    <Navigation className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!loading &&
            !error &&
            inputValue.trim().length >= 2 &&
            suggestions.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                <FaSearchLocation className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No locations found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try a different search term
                </p>
              </div>
            )}

          {/* Recent Searches */}
          {!loading &&
            !error &&
            inputValue.trim().length === 0 &&
            recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((item, idx) => (
                  <div
                    key={`recent-${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-50 last:border-0
                               transition-colors duration-150
                               ${
                                 activeIndex === idx
                                   ? "bg-emerald-50"
                                   : "hover:bg-slate-50"
                               }`}
                    role="option"
                    aria-selected={activeIndex === idx}
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaHistory className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">
                        {item.placeName}
                      </p>
                      {item.placeAddress && (
                        <p className="text-sm text-slate-400 truncate">
                          {item.placeAddress}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Empty State - First Time */}
          {!loading &&
            !error &&
            inputValue.trim().length === 0 &&
            recentSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                <FaMapMarkerAlt className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium">Start typing to search</p>
                <p className="text-xs text-slate-400 mt-1">
                  Search by area, landmark, or city
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default memo(LocationAutosuggest);