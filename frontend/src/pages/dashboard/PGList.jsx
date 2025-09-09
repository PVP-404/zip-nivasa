import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PGList = () => {
  const [pgs, setPGs] = useState([]);
  const navigate = useNavigate();

  // Fetch all PGs from backend
  const fetchPGs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();
      setPGs(data);
    } catch (err) {
      console.error("Error fetching PGs:", err);
    }
  };

  useEffect(() => {
    fetchPGs();
  }, []);

  const handleSelectPG = (pg) => {
    // Navigate to a details page or store selected PG
    console.log("Selected PG:", pg);
    // Example: navigate(`/dashboard/student/pg/${pg._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Available PGs/Hostels</h1>

      {pgs.length === 0 ? (
        <p className="text-gray-500">No PGs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pgs.map((pg) => (
            <div
              key={pg._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl cursor-pointer transition duration-300"
              onClick={() => handleSelectPG(pg)}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">{pg.name}</h2>
              <p className="text-gray-600 mb-1">{pg.address}</p>
              <p className="text-gray-600 mb-1">
                Beds: {pg.occupiedBeds}/{pg.totalBeds}
              </p>
              <p className="text-gray-600">Price: ₹{pg.pricePerMonth}/month</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PGList;
