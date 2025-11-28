// frontend/src/pages/tenant/MyBookings.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";

const badge = (status) => {
  const map = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Cancelled: "bg-gray-100 text-gray-700",
  };
  return map[status] || "bg-indigo-100 text-indigo-700";
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e) {
      setErr("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `booking-${bookingId}-receipt.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download receipt");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="max-w-7xl mx-auto w-full px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">Track your stays, status and documents</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : err ? (
            <p className="text-red-600">{err}</p>
          ) : bookings.length === 0 ? (
            <div className="bg-white border rounded-xl p-10 text-center">
              <p className="text-gray-600">No bookings found</p>
              <Link
                to="/services/pgs"
                className="inline-block mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Explore PGs
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {bookings.map((b) => (
                <div key={b._id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                  <div className="relative h-40">
                    <img
                      src={
                        b.pg?.images?.[0]
                          ? `http://localhost:5000${b.pg.images[0]}`
                          : "https://via.placeholder.com/600x300"
                      }
                      className="w-full h-full object-cover"
                      alt={b.pg?.title || "PG"}
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${badge(b.status)}`}>
                      {b.status}
                    </span>
                    <span className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded text-sm font-semibold text-indigo-700">
                      ₹{b.monthlyRent || b.pg?.monthlyRent}/mo
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold">{b.pg?.title}</h3>
                    <p className="text-gray-600">{b.pg?.location}</p>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Room / Bed</p>
                        <p className="font-semibold">{b.roomNumber || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deposit</p>
                        <p className="font-semibold">₹{b.deposit || b.pg?.deposit || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Move-in</p>
                        <p className="font-semibold">{b.moveIn ? new Date(b.moveIn).toLocaleDateString() : "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Move-out</p>
                        <p className="font-semibold">{b.moveOut ? new Date(b.moveOut).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5">
                      <Link
                        to={`/services/pg/${b.pg?._id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                      >
                        View PG
                      </Link>
                      <button
                        onClick={() => downloadReceipt(b._id)}
                        className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg"
                      >
                        Download Receipt
                      </button>
                      <Link
                        to={`/services/pg/${b.pg?._id}/enquiry`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                      >
                        Contact Owner
                      </Link>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      Booked on {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MyBookings;
