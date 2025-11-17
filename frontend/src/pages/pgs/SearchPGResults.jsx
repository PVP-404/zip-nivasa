// src/pages/pgs/SearchPGResults.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const SearchPGResults = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(null);

  const locationHook = useLocation();
  const navigate = useNavigate();
  const userLoggedIn = !!localStorage.getItem("token");

  const params = new URLSearchParams(locationHook.search);

  useEffect(() => {
    const locationParam = params.get("location") || "";
    const typeParam = params.get("type") || "";
    const budgetParam = params.get("budget") || "";

    setLocationFilter(locationParam);
    setTypeFilter(typeParam);

    if (budgetParam.includes("-")) {
      const [min, max] = budgetParam.split("-").map(Number);
      setSelectedBudget({ min, max });
    } else if (budgetParam.includes("+")) {
      setSelectedBudget({ min: 10000, max: Infinity });
    }
  }, []);

  const fetchPGs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();
      setPgs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPGs();
  }, []);

  const filteredPGs = useMemo(() => {
    let list = pgs;

    if (locationFilter) {
      list = list.filter((p) =>
        p.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== "pg") {
      list = list.filter(
        (p) => p.propertyType.toLowerCase() === typeFilter
      );
    }

    if (selectedBudget) {
      list = list.filter(
        (p) =>
          p.monthlyRent >= selectedBudget.min &&
          p.monthlyRent <= selectedBudget.max
      );
    }

    return list;
  }, [pgs, locationFilter, typeFilter, selectedBudget]);

  const handleCardClick = (id) => {
    if (userLoggedIn) {
      navigate(`/services/pg/${id}`);
    } else {
      navigate(`/login?role=student`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Showing {filteredPGs.length} Accommodations
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPGs.map((pg) => (
            <div
              key={pg._id}
              onClick={() => handleCardClick(pg._id)}
              className="cursor-pointer bg-white p-5 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >
              <img
                src={
                  pg.images?.[0]
                    ? `http://localhost:5000${pg.images[0]}`
                    : "https://via.placeholder.com/400"
                }
                className="h-48 w-full object-cover rounded-lg"
                alt={pg.title}
              />

              <h3 className="text-xl font-semibold mt-3">{pg.title}</h3>
              <p className="text-gray-600">{pg.location}</p>
              <p className="text-indigo-600 font-bold mt-2">
                ₹{pg.monthlyRent}/month
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SearchPGResults;
