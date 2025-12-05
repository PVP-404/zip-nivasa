import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `
    <div class="ul-wrap">
      <span class="ul-pulse"></span>
      <span class="ul-dot"></span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const pgIcon = L.divIcon({
  className: "custom-pg-icon",
  html: `
    <div class="pg-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="2" stroke="white"
        class="pg-home">
        <path stroke-linecap="round" stroke-linejoin="round"
         d="m2.25 12 8.954-8.955c.44-.439 1.155-.439 1.595 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"/>
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 30],
  popupAnchor: [0, -26],
});

const MarkerWithHoverPopup = ({ marker }) => {
  const markerRef = useRef(null);

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={pgIcon}
      ref={markerRef}
      eventHandlers={{
        mouseover: () => markerRef.current?.openPopup(),
        mouseout: () => markerRef.current?.closePopup(),
      }}
    >
      <Popup>
        <div className="text-sm leading-snug">
          <p className="font-bold text-indigo-700 text-base">
            {marker.title}
          </p>
          <p className="text-xs text-gray-600 mt-1">{marker.address}</p>
          {marker.extra?.monthlyRent && (
            <p className="mt-2 text-green-600 font-semibold">
              ₹{marker.extra.monthlyRent.toLocaleString("en-IN")} / month
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 0.6 });
    }
  }, [center, zoom, map]);
  return null;
};

const SearchInput = ({ onSelectLocation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
  const controller = useRef(null);

  const fetchSuggestions = async (value) => {
    if (!value || value.length < 2) {
      setResults([]);
      return;
    }
    if (controller.current) controller.current.abort();
    controller.current = new AbortController();
    setLoading(true);
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        value
      )}&filter=countrycode:in&limit=10&lang=en&apiKey=${apiKey}`;
      const res = await fetch(url, { signal: controller.current.signal });
      const data = await res.json();
      const items = (data.features || []).map((f) => {
        const p = f.properties;
        const full = [
          p.housenumber,
          p.street,
          p.suburb,
          p.locality,
          p.district,
          p.city,
          p.state,
          p.postcode,
          p.country,
        ]
          .filter(Boolean)
          .join(", ");
        return {
          name: p.name || p.street || p.locality || "Place",
          label: full || p.formatted || p.city || "Location",
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        };
      });
      setResults(items);
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(window.__zn_timer);
    window.__zn_timer = setTimeout(() => {
      fetchSuggestions(value);
    }, 60);
  };

  const handleSelect = (item) => {
    setQuery(item.label);
    setResults([]);
    onSelectLocation(item);
  };

  return (
    <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-lg z-[1000] px-4">
      <div className="pointer-events-auto relative">
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search location, road, area, landmark..."
          className="w-full px-4 py-3 bg-white/95 border shadow-xl rounded-2xl text-sm backdrop-blur focus:ring-2 focus:ring-indigo-600"
        />
        {loading && (
          <div className="absolute top-3 right-4 h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        )}
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 bg-white shadow-xl rounded-xl border max-h-72 overflow-y-auto z-[2000] mt-2">
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => handleSelect(r)}
                className="px-4 py-3 cursor-pointer hover:bg-indigo-50"
              >
                <p className="font-semibold text-gray-800">{r.name}</p>
                <p className="text-[11px] text-gray-500">{r.label}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const LeafletMap = ({
  center,
  markers = [],
  radiusKm,
  onCenterChange,
  className = "w-full h-full rounded-xl",
}) => {
  const zoom = 14;

  const handleLocationSelect = useCallback(
    (loc) =>
      onCenterChange({
        lat: loc.lat,
        lng: loc.lng,
        address: loc.label,
      }),
    [onCenterChange]
  );

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom
        className="w-full h-full"
      >
        <SearchInput onSelectLocation={handleLocationSelect} />
        <ChangeMapView center={center} zoom={zoom} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {radiusKm && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#06B6D4",
              fillColor: "#22D3EE",
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        )}
        <Marker position={[center.lat, center.lng]} icon={userLocationIcon}>
          <Popup>{center.address}</Popup>
        </Marker>
        {markers
          .filter((m) => !m.isCenter)
          .map((m) => (
            <MarkerWithHoverPopup key={m.id} marker={m} />
          ))}
      </MapContainer>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 shadow-xl rounded-full px-4 py-2 text-xs backdrop-blur">
        <span className="font-semibold">📍 Area:</span> {center.address}
      </div>
      <style jsx>{`
        /* User location animated icon */
        .ul-wrap {
          position: relative;
          width: 36px;
          height: 36px;
        }
        .ul-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          background: #06b6d4; /* cyan */
          border: 3px solid #ffffff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.45);
        }
        .ul-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30px;
          height: 30px;
          border: 2px solid rgba(6, 182, 212, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ul-pulse 1.8s ease-out infinite;
        }
        @keyframes ul-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.9;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.25);
            opacity: 0.15;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }

        /* PG marker icon */
        .pg-wrap {
          width: 34px;
          height: 34px;
          background: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
        }
        .pg-home {
          width: 16px;
          height: 16px;
        }

        /* Improve popup readability */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
        }
        .leaflet-popup-content {
          margin: 10px 12px;
        }
      `}</style>
    </div>
  );
};

export default LeafletMap;
