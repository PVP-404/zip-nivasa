// frontend/src/components/ZipNivasaMap.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  MarkerClustererF,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const ZipNivasaMap = ({
  markers = [],
  initialCenter = { lat: 18.5204, lng: 73.8567 }, // Pune
  showUserLocation = true,
  onMarkerClick = () => {},
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "zip-nivasa-map",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Get user's current location
  useEffect(() => {
    if (!showUserLocation || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
      }
    );
  }, [showUserLocation]);

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;

      // Fit bounds to markers + user location
      if (markers.length > 0 || userLocation) {
        const bounds = new window.google.maps.LatLngBounds();

        markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
        if (userLocation) bounds.extend(userLocation);

        map.fitBounds(bounds);
      }
    },
    [markers, userLocation]
  );

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    onMarkerClick(marker);
  };

  if (loadError) return <p className="text-red-500">Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={12}
        onLoad={onLoad}
      >
        {/* User current location */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            }}
          />
        )}

        {/* Clustered PG markers */}
        <MarkerClustererF>
          {(clusterer) =>
            markers.map((marker) => (
              <Marker
                key={`${marker.type}-${marker.id}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                clusterer={clusterer}
                onClick={() => handleMarkerClick(marker)}
              />
            ))
          }
        </MarkerClustererF>

        {/* InfoWindow */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="text-sm max-w-xs">
              <p className="text-xs uppercase text-gray-500">
                {selectedMarker.type.toUpperCase()}
              </p>
              <h3 className="font-bold text-base">{selectedMarker.name}</h3>
              <p className="text-gray-600">{selectedMarker.location}</p>
              {selectedMarker.extra?.monthlyRent && (
                <p className="text-blue-600 font-semibold mt-1">
                  ₹{selectedMarker.extra.monthlyRent} / month
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default ZipNivasaMap;
