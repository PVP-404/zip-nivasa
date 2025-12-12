import React, { useState } from "react";
import axios from "axios";

const MapSearchBar = ({ onLocationSelected }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      setLoading(true);
      const res = await axios.get(`${API}/api/map/geocode`, {
        params: { address: query },
      })

      const { lat, lng } = res.data;
      onLocationSelected({ lat, lng, label: query });
    } catch (error) {
      console.error("Search location error:", error);
      alert("Could not find this location. Try another area.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex gap-2 items-center mb-4 max-w-xl"
    >
      <input
        type="text"
        value={query}
        placeholder="Search area (e.g., Akurdi, Wakad, Hinjawadi)"
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 border rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default MapSearchBar;
