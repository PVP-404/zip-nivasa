import React, { useEffect, useState } from "react";
import axios from "axios";
import ZipNivasaMap from "../components/ZipNivasaMap";
import MapSearchBar from "../components/MapSearchBar";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


const ExploreMapPage = () => {
  const [allMarkers, setAllMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [filterType, setFilterType] = useState("pg");
  const [center, setCenter] = useState({ lat: 18.5204, lng: 73.8567 }); 

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          `${API}/api/map/locations`
        );
        setAllMarkers(res.data);
        setFilteredMarkers(res.data.filter((m) => m.type === "pg"));
      } catch (error) {
        console.error("Error loading map locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (filterType === "all") setFilteredMarkers(allMarkers);
    else setFilteredMarkers(allMarkers.filter((m) => m.type === filterType));
  }, [filterType, allMarkers]);

  const handleLocationSelected = ({ lat, lng }) => {
    setCenter({ lat, lng });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <h1 className="text-2xl font-bold mb-2">
              Explore PGs on Map
            </h1>

            <MapSearchBar onLocationSelected={handleLocationSelected} />

            <div className="flex gap-2 mb-2">
              {["pg", "all"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    filterType === type
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {type === "pg" ? "PGs" : "All"}
                </button>
              ))}
            </div>

            <ZipNivasaMap
              markers={filteredMarkers}
              initialCenter={center}
              showUserLocation={true}
            />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default ExploreMapPage;
