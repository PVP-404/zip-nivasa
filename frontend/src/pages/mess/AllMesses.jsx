// src/pages/mess/AllMesses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getAllMesses } from "../../services/messService";

const AllMesses = () => {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const locationHook = useLocation();
  const locationQuery =
    new URLSearchParams(locationHook.search).get("location") || "";

  const userLoggedIn = !!localStorage.getItem("token");

  const load = async () => {
    setLoading(true);
    const res = await getAllMesses();
    setMesses(res);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = messes.filter((m) =>
    m.location.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const getAvgRating = (ratings = []) => {
    if (ratings.length === 0) return null;
    const total = ratings.reduce((acc, r) => acc + (r.stars || 0), 0);
    return (total / ratings.length).toFixed(1);
  };

  const handleCardClick = (id) => {
    if (userLoggedIn) {
      navigate(`/mess/${id}`);
    } else {
      navigate(`/login?role=student`);
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-5">
          Showing Messes in "{locationQuery}"
        </h1>

        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500">No messes found here.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((mess) => {
            const avgRating = getAvgRating(mess.ratings);

            return (
              <div
                key={mess._id}
                onClick={() => handleCardClick(mess._id)}
                className="bg-white cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 w-full">
                  <img
                    src={
                      mess.images?.[0]
                        ? `http://localhost:5000${mess.images[0]}`
                        : "https://via.placeholder.com/400"
                    }
                    alt={mess.title}
                    className="w-full h-full object-cover"
                  />

                  <span className="absolute bottom-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md">
                    ₹{mess.price}/month
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {mess.title}
                  </h3>

                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    {mess.location}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    {avgRating ? (
                      <>
                        <span className="text-yellow-500 text-lg">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {avgRating}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        No ratings yet
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold 
                      ${
                        mess.type === "Veg"
                          ? "bg-green-100 text-green-700"
                          : mess.type === "Non-Veg"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {mess.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AllMesses;
