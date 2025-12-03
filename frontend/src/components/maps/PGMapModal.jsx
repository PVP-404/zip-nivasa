// frontend/src/components/maps/PGMapModal.jsx
import React, { useEffect, useRef } from "react";

const PGMapModal = ({ open, onClose, eloc, address, pg }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // We only want to initialize ONCE for this DOM node
    if (
      !mapRef.current ||          // div not rendered yet
      !window.mappls ||           // SDK not ready
      !window.mappls.pinMarker || // plugin not ready
      !eloc                       // no pin
    ) {
      return;
    }

    // If we've already initialized a map on this div, do nothing.
    if (mapRef.current.dataset.mapplsInitialized === "1") {
      return;
    }

    try {
      // 1️⃣ Create a new Mappls map
      const map = new window.mappls.Map(mapRef.current, {
        center: [20.5937, 78.9629], // India fallback
        zoom: 5,
      });

      // 2️⃣ Prepare popup HTML
      const popupHtml = `
        <div style="font-size:13px;">
          <strong>${pg?.title || ""}</strong><br/>
          ${address || ""}
          <br/>
          <span style="font-size:11px;color:#666;">Pin: ${eloc}</span>
        </div>
      `;

      // 3️⃣ Add marker from eLoc
      const markerObj = window.mappls.pinMarker({
        map,
        pin: eloc,
        popupHtml,
        popupOptions: {
          openPopup: true,
        },
      });

      // 4️⃣ Auto-fit map to marker bounds if available
      if (markerObj && typeof markerObj.fitbounds === "function") {
        markerObj.fitbounds();
      }

      // Mark this map container as initialized so we don't re-init
      mapRef.current.dataset.mapplsInitialized = "1";

      console.log("✅ Mappls map + pin initialized (guarded) for", eloc);
    } catch (err) {
      console.error("PGMapModal guarded init error:", err);
    }
  }, [eloc, address, pg]); // NOT dependent on `open`

  // Keep component mounted; just hide with CSS so map DOM stays alive
  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition ${
        open
          ? "bg-black/60 opacity-100 pointer-events-auto"
          : "bg-transparent opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-xl p-5 w-full max-w-3xl relative shadow-2xl">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>

        {/* TITLE */}
        <h2 className="text-xl font-bold mb-1 text-gray-900">
          {pg?.title || "PG Location"}
        </h2>
        {address && (
          <p className="text-xs text-gray-500 mb-3">{address}</p>
        )}

        {/* MAP CONTAINER */}
        <div
          ref={mapRef}
          id="mappls-map-container"
          className="w-full h-[400px] border rounded-lg shadow-inner"
        />

        <p className="text-xs text-gray-400 mt-2 text-center">
          Location powered by Mappls {eloc ? `(eLoc: ${eloc})` : ""}
        </p>
      </div>
    </div>
  );
};

export default PGMapModal;
