// ✅ frontend/src/pages/pgs/PGEnquiry.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PGEnquiry = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [message, setMessage] = useState("");

  const fetchPG = async () => {
    const res = await fetch(`http://localhost:5000/api/pgs/${id}`);
    const data = await res.json();
    setPg(data.pg);
  };

  useEffect(() => {
    fetchPG();
  }, []);

  const sendEnquiry = async () => {
    const payload = { pgId: id, message };

    await fetch("http://localhost:5000/api/enquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    alert("Enquiry Sent!");
  };

  if (!pg) return <div>Loading...</div>;

  return (
    <>
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-bold mb-3">Enquiry for {pg.title}</h1>
        <p className="text-gray-600 mb-7">{pg.location}</p>

        <textarea
          placeholder="Write your message here..."
          className="w-full border rounded-lg p-4 h-40"
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendEnquiry}
          className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg"
        >
          Send Enquiry
        </button>

      </main>

      <Footer />
    </>
  );
};

export default PGEnquiry;
