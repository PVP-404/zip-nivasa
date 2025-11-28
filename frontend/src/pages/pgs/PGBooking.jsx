// ✅ frontend/src/pages/pgs/PGBooking.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PGBooking = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);

  const [moveIn, setMoveIn] = useState("");
  const [moveOut, setMoveOut] = useState("");

  const fetchPG = async () => {
    const res = await fetch(`http://localhost:5000/api/pgs/${id}`);
    const data = await res.json();
    setPg(data.pg);
  };

  useEffect(() => {
    fetchPG();
  }, [id]);

  const handleBook = async () => {
    const payload = { id, moveIn, moveOut };

    await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    alert("Booking request sent!");
  };

  if (!pg)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <>
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-bold mb-3">Book {pg.title}</h1>
        <p className="text-gray-600 mb-8">{pg.location}</p>

        <div className="bg-white p-6 rounded-xl shadow">

          <label className="font-semibold">Move-in Date</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded mb-4"
            onChange={(e) => setMoveIn(e.target.value)}
          />

          <label className="font-semibold">Move-out Date</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded mb-4"
            onChange={(e) => setMoveOut(e.target.value)}
          />

          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            onClick={handleBook}
          >
            Submit Booking Request
          </button>
        </div>
      </main>

      <Footer/>
    </>
  );
};

export default PGBooking;
