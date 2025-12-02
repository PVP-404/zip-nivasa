// frontend/src/components/maps/MapplsPGMap.jsx

import React, { useEffect, useRef, useState } from "react";
import useMapplsLoader from "../../hooks/useMapplsLoader";
import { DEFAULT_COORDS } from "../../utils/mapplsConfig";

const MapplsPGMap = ({ center, title, address, monthlyRent, onLocationSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const loaded = useMapplsLoader();

  /* --------------------------------------------------------
     1) Fetch location suggestions from Mappls (FAST & ACCURATE)
  ---------------------------------------------------------*/
  const fetchSuggestions = async (value) => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const url = `https://atlas.mappls.com/api/places/search/json?query=${encodeURIComponent(
        value
      )}&region=IND&itemCount=8`;

      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          "access_token": import.meta.env.VITE_MAPPLS_REST_KEY,
        },
      });

      const data = await res.json();
      const items =
        data.suggestedLocations?.map((loc) => ({
          name: loc.placeName,
          address: loc.placeAddress,
          lat: loc.latitude,
          lng: loc.longitude,
        })) || [];

      setSuggestions(items);
    } catch (e) {
      console.error("Suggestion Error:", e);
    }
  };

  const handleSelectSuggestion = (item) => {
    setSearchQuery(item.address);
    setSuggestions([]);
    onLocationSelect?.(item);
  };

  /* --------------------------------------------------------
     2) Initialize Map + Marker + Styles
  ---------------------------------------------------------*/
  useEffect(() => {
    if (!loaded || !window.mappls) return;

    const mapCenter = center || DEFAULT_COORDS;

    // Initialize map
    const map = new window.mappls.Map(mapRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 15,
      zoomControl: true,
      traffic: false,
      style: "vector",
    });

    mapInstanceRef.current = map;

    // Add Click → Get LatLng
    map.on("click", function (e) {
      const { lat, lng } = e.lnglat;
      onLocationSelect?.({ lat, lng, address: `Lat: ${lat}, Lng: ${lng}` });
    });

    // PG Marker
    if (center?.lat && center?.lng) {
      const marker = new window.mappls.Marker({
        map,
        position: { lat: center.lat, lng: center.lng },
        title: title || "PG",
      });

      const html = `
        <div style="font-family: system-ui; font-size: 12px;">
          <strong>${title || "PG"}</strong><br/>
          ${address || ""}<br/>
          ${
            monthlyRent
              ? "₹" + monthlyRent.toLocaleString("en-IN") + " / month"
              : ""
          }
        </div>
      `;

      const info = new window.mappls.InfoWindow({
        map,
        position: { lat: center.lat, lng: center.lng },
        content: html,
      });

      info.close();
      marker.addListener("click", () => info.open(map, marker));
    }

    return () => {};
  }, [loaded, center]);

  /* --------------------------------------------------------
     3) Map Style Toggle: Default | Hybrid | Night
  ---------------------------------------------------------*/
  const switchMapStyle = (style) => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.setStyle(style);
  };

  /* --------------------------------------------------------
     4) “Use My Location”
  ---------------------------------------------------------*/
  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationSelect?.({
          lat: latitude,
          lng: longitude,
          address: "Your Current Location",
        });
      },
      () => alert("Please allow location access!")
    );
  };

  return (
    <div className="relative w-full h-full">
      
      {/* ---------------- SEARCH BAR ---------------- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[75%] z-[999] pointer-events-auto">
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          placeholder="Search place, address, landmark..."
          className="w-full px-4 py-3 bg-white shadow-xl rounded-xl border border-gray-200"
        />

        {suggestions.length > 0 && (
          <ul className="bg-white border shadow-xl rounded-xl max-h-64 overflow-y-auto mt-2">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelectSuggestion(s)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-gray-600">{s.address}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------------- STYLE SWITCHER ---------------- */}
      <div className="absolute top-4 right-4 bg-white shadow-lg border rounded-lg p-2 z-[999] space-y-2">
        <button
          onClick={() => switchMapStyle("vector")}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Default
        </button>

        <button
          onClick={() => switchMapStyle("hybrid")}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Hybrid
        </button>

        <button
          onClick={() => switchMapStyle("night")}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Night
        </button>
      </div>

      {/* ---------------- MY LOCATION BUTTON ---------------- */}
      <button
        onClick={detectMyLocation}
        className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg z-[999]"
      >
        Use My Location
      </button>

      {/* ---------------- MAP ---------------- */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default MapplsPGMap;
