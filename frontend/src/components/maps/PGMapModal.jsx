// frontend/src/components/maps/PGMapModal.jsx
import React, { useEffect, useRef, useState } from "react";

const PGMapModal = ({ open, onClose, eloc, address, pg }) => {
  const mapRef = useRef(null);
  const [userDistance, setUserDistance] = useState(null);
  const [isFindingLocation, setIsFindingLocation] = useState(false);

  // 1️⃣ PURE CLIENT-SIDE DISTANCE (No CORS issues)
  const getUserDistanceToPG = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this device/browser.");
      return;
    }

    // You should use the actual coordinates derived from 'eloc' here
    // For a real-world app, you'd call a geocoding API to convert eloc to (lat, lng)
    // Using a hardcoded fallback for demonstration purposes only, as in your original code.
    const pgLat = 28.6139; // Delhi fallback
    const pgLng = 77.2090;

    setIsFindingLocation(true);
    setUserDistance(null); // Clear previous distance
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Haversine distance to eLoc coordinates (approx Delhi for demo)
        const distance = haversineDistance(userLat, userLng, pgLat, pgLng);
        const distanceText = distance > 1 
          ? `${distance.toFixed(1)} km` 
          : `${Math.round(distance * 100) / 100} km` // Better to keep in KM for consistency
          
        setUserDistance(distanceText);
        setIsFindingLocation(false);
      },
      (error) => {
        setIsFindingLocation(false);
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // UX: maximumAge: 0 ensures a fresh reading
    );
  };

  // 2️⃣ HAVERSINE DISTANCE FORMULA (Kept as is - mathematically correct)
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (
      !mapRef.current ||
      !window.mappls || 
      !window.mappls.pinMarker ||
      !eloc
    ) {
      return;
    }

    if (mapRef.current.dataset.mapplsInitialized === "1") {
      return;
    }

    try {
      // 3️⃣ MAP INITIALIZATION - Subtle change: slightly less aggressive zoom on India
      const map = new window.mappls.Map(mapRef.current, {
        center: [20.5937, 78.9629], // India
        zoom: 5,
        zoomControl: true, 
        location: true, 
        traffic: false, // Turned off by default for cleaner look, user can enable via control
        scrollZoom: true,
        clickableIcons: true, 
        fullscreenControl: true, 
        mapTypeControl: true, 
        scaleControl: true, 
      });

      // 4️⃣ BEAUTIFUL RICH POPUP - Made colors softer and cleaner
      const popupHtml = `
        <div style="min-width:300px;padding:16px;font-family:system-ui;background:white;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,0.08);">
          <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
            <div style="width:40px;height:40px;background:#EBF5FF;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#3B82F6;font-weight:600;font-size:16px;">
              🏠
            </div>
            <div>
              <h3 style="margin:0 0 4px 0;font-size:17px;font-weight:700;color:#1F2937;">${pg?.title || "PG Accommodation"}</h3>
              <p style="margin:0;color:#6B7280;font-size:13px;">${address || "Premium student accommodation"}</p>
            </div>
          </div>
          
          <div style="background:#F3F4F6;padding:12px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:12px;color:#4B5563;font-weight:600;margin-bottom:4px;">📍 Mappls eLoc Pin</div>
            <code style="background:white;color:#1F2937;padding:6px 10px;border-radius:6px;font-size:12px;font-family:monospace;font-weight:500;border:1px solid #D1D5DB;">${eloc}</code>
          </div>

          ${pg?.monthlyRent ? `
            <div style="background:#F0FDF4;padding:12px;border-radius:8px;border-left:3px solid #10B981;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#059669;margin-bottom:2px;">₹${pg.monthlyRent.toLocaleString()}</div>
              <div style="color:#065F46;font-size:12px;">Monthly Rent Estimate</div>
            </div>
          ` : ''}
          
          <div style="text-align:center;padding-top:12px;margin-top:12px;border-top:1px solid #E5E7EB;">
            <a href="tel:${pg?.owner?.phone || ''}" style="color:#2563EB;font-size:13px;font-weight:600;text-decoration:none;">📞 Contact Owner Directly</a>
          </div>
        </div>
      `;

      // 5️⃣ PIN MARKER (PROVEN WORKING)
      const markerObj = window.mappls.pinMarker({
        map,
        pin: eloc,
        popupHtml,
        popupOptions: {
          openPopup: true,
          closeButton: true,
        },
      });

      // 6️⃣ AUTO ZOOM TO PERFECT FIT
      if (markerObj?.fitbounds) {
        // Reduced timeout for snappier UX
        setTimeout(() => markerObj.fitbounds(), 300); 
      }

      mapRef.current.dataset.mapplsInitialized = "1";
      console.log("✅ Mappls map loaded for eLoc:", eloc);

    } catch (err) {
      console.error("Mappls error:", err);
    }
  }, [eloc, address, pg]);

  // 7️⃣ ACTION BUTTONS (Kept as is)
  const getDirections = () => {
    // UX: Use 'dir' endpoint for direct directions experience
    window.open(`https://maps.mapmyindia.com/directions/driving/eloc/${eloc}`, '_blank');
  };

  const findNearby = () => {
    // UX: Added common student/migrant POIs (food, transit, health, money)
    window.open(`https://maps.mapmyindia.com/search/${eloc}/nearby?types=restaurant|cafe|bus|metro|hospital|atm`, '_blank');
  };

  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: pg?.title || 'PG Location',
        text: `Check out this great accommodation: ${pg?.title || 'PG'} at eLoc: ${eloc}`,
        url: `https://maps.mapmyindia.com/eloc/${eloc}`
      }).catch(error => console.error('Error sharing', error));
    } else {
      navigator.clipboard.writeText(`PG Location: ${pg?.title || address} - Mappls Link: https://maps.mapmyindia.com/eloc/${eloc}`);
      alert('Location link copied to clipboard!');
    }
  };

  return (
    <div
      // Refined transition for subtlety
      className={`fixed inset-0 flex justify-center items-center z-[9999] transition-all duration-300 ${
        open
          ? "bg-black/40 backdrop-blur-sm opacity-100 pointer-events-auto"
          : "bg-transparent opacity-0 pointer-events-none"
      }`}
      onClick={onClose} // UX: Click outside to close
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[95vh] relative shadow-2xl overflow-y-auto transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent click-outside-to-close on modal content
      >
        {/* ✨ HEADER - Simplified text styling */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
              {pg?.title || "PG Accommodation Map"}
            </h2>
            
            {address && (
              <p className="text-md text-gray-500 mb-4 leading-relaxed">{address}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900 text-xl font-semibold"
            title="Close Map"
          >
            &times;
          </button>
        </div>

        {/* 🗺️ MAP - Reduced border size, kept clean background */}
        <div className="w-full h-[500px] border border-gray-200 rounded-2xl shadow-xl mb-6 overflow-hidden bg-white">
          <div ref={mapRef} id="mappls-map-container" className="w-full h-full" />
        </div>

        {/* 🎮 ACTION BUTTONS - Subtler, uniform primary/secondary style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <ActionPill 
            icon="🚗" 
            label="Get Directions" 
            onClick={getDirections} 
            color="bg-blue-50 hover:bg-blue-100 text-blue-700"
          />
          <ActionPill 
            icon="🏪" 
            label="Nearby POIs" 
            onClick={findNearby} 
            color="bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
          />
          <ActionPill 
            icon="📤" 
            label="Share Location" 
            onClick={shareLocation} 
            color="bg-purple-50 hover:bg-purple-100 text-purple-700"
          />
          <a
            href={`https://maps.mapmyindia.com/eloc/${eloc}`}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-700 font-medium text-sm border border-gray-200"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition">🗺️</div>
            Open in Mappls App
          </a>
        </div>

        {/* 📍 FOOTER - Cleaned up footer section */}
        <div className="text-center pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
            <p className="text-gray-500">
              Map data provided by <strong className="text-blue-600 font-bold">Mappls Maps</strong>
            </p>
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              <span className="text-gray-600">eLoc:</span>
              <code className="font-mono text-gray-800 font-semibold">{eloc}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for subtle action buttons
const ActionPill = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-sm border border-transparent ${color}`}
  >
    <div className="text-2xl mb-1 group-hover:scale-110 transition">{icon}</div>
    {label}
  </button>
);

export default PGMapModal;