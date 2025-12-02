import React, { useEffect, useRef } from "react";

const PGMapModal = ({ open, onClose, center, pg }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      if (window.__mapplsLoaded && window.mappls) {
        clearInterval(interval);
        initMapplsMap();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [open]);

  const initMapplsMap = () => {
    if (!mapRef.current) {
      console.error("Map container missing");
      return;
    }

    if (!center?.lat || !center?.lng) {
      console.error("Coordinates missing");
      return;
    }

    // ⭐ Mappls SDK v2 Initialization (CORRECT for your script)
    const map = new window.mappls.Map(mapRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 15,
    });

    // ⭐ Marker for v2 SDK
    const marker = new window.mappls.Marker({
      map: map,
      position: { lat: center.lat, lng: center.lng },
      title: pg.title,
    });

    // ⭐ InfoWindow for v2 SDK
    new window.mappls.InfoWindow({
      map: map,
      position: { lat: center.lat, lng: center.lng },
      content: `
        <div style="font-size:13px;">
          <strong>${pg.title}</strong><br/>
          ${pg.address}
        </div>
      `,
    });

    console.log("Mappls Map Loaded ✔");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-5 w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-3">{pg.title}</h2>

        <div
          ref={mapRef}
          id="map-container"
          className="w-full h-[400px] border rounded-lg shadow-inner"
        ></div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Powered by Mappls Maps
        </p>
      </div>
    </div>
  );
};

export default PGMapModal;
