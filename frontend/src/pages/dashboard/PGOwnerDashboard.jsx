// src/pages/dashboard/PGOwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";

const PGOwnerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔐 Redirect invalid role
  useEffect(() => {
    if (!token || role !== "pgowner") navigate("/login");
  }, []);

  // 🔵 Fetch profile
  const fetchUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (data.user) setUser(data.user);
      else throw new Error("Invalid response");
    } catch (err) {
      setError("Failed to fetch user profile.");
    }
  };

  // 🔵 Fetch PG listings
  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pgs/owner/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setListings(data.pgs || []);
    } catch {
      setError("Could not load listings.");
    }
  };

  // 🔵 Load data on mount
  useEffect(() => {
    const load = async () => {
      await fetchUserProfile();
      await fetchListings();

      // temp dummy inquiries
      setInquiries([
        {
          id: "i1",
          listingTitle: "Cozy PG with Mess",
          tenantName: "Rahul Kumar",
          contact: "9876543210",
          status: "New",
          date: "2025-01-10T10:30:00",
          message: "I am interested in this PG. Is food included?",
        },
      ]);

      setLoading(false);
    };

    load();
  }, []);

  // 🔧 Actions
  const handleAddListing = () => navigate("/dashboard/add-listing");
  const handleEditListing = (id) => navigate(`/dashboard/edit-listing/${id}`);
  const handleDeleteListing = (id) => {
    if (window.confirm("Delete this PG permanently?")) {
      setListings((prev) => prev.filter((l) => l._id !== id));
    }
  };

  const handleMarkInquiry = (id) =>
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Contacted" } : i))
    );

  // ===========================
  // LOADING SCREEN
  // ===========================
  if (loading)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );

  // ===========================
  // ERROR SCREEN
  // ===========================
  if (error)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="bg-red-50 p-6 rounded-xl shadow-md border border-red-200 max-w-md">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );

  // ===========================
  // MAIN FINAL UI
  // ===========================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER (full width) */}
      <Header onToggleSidebar={() => setIsSidebarOpen((p) => !p)} />

      <div className="flex flex-1 min-h-0">
        {/* SIDEBAR (YouTube style) */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 overflow-y-auto">

          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your PG listings and inquiries
              </p>
            </div>

            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Listings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between mb-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                  </svg>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-4xl font-bold text-gray-900">
                {listings.length}
              </p>
            </div>

            {/* Available beds */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between mb-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor">
                    <path d="M10.707 2.293l-7 7a1 1 0 001.414 1.414L4 10.414V17h12V10.414l-.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600">Available Beds</p>
              <p className="text-4xl font-bold text-gray-900">
                {listings.reduce((acc, pg) => acc + (pg.beds || 0), 0)}
              </p>
            </div>

            {/* New inquiries */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between mb-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  </svg>
                </div>
                {inquiries.some((i) => i.status === "New") && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    NEW
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600">New Inquiries</p>
              <p className="text-4xl font-bold text-gray-900">
                {inquiries.filter((i) => i.status === "New").length}
              </p>
            </div>
          </section>

          {/* ===========================
              TABS
          =========================== */}
          <div className="mb-6 bg-white rounded-xl inline-flex p-1 border shadow-sm">
            {["listings", "inquiries"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {tab === "listings" ? "Listings" : "Inquiries"}
              </button>
            ))}
          </div>

          {/* ===========================
              LISTINGS TAB
          =========================== */}
          {activeTab === "listings" && (
            <>
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Property Listings
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Manage and view your PGs
                  </p>
                </div>

                <button
                  onClick={handleAddListing}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                >
                  + Add New PG
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Listings Yet
                  </h3>
                  <p className="text-gray-600 mb-5">
                    Add your first PG listing to attract tenants
                  </p>
                  <button
                    onClick={handleAddListing}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Create Listing
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((pg) => (
                    <div
                      key={pg._id}
                      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
                    >
                      <div className="relative h-48">
                        <img
                          src={pg.images?.length ? pg.images[0] : "https://via.placeholder.com/300"}

                          className="h-full w-full object-cover"
                          alt={pg.title}
                        />

                        <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow">
                          ₹{pg.monthlyRent}
                        </span>

                        {pg.available && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs rounded">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {pg.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {pg.location}
                        </p>

                        {/* Beds */}
                        <p className="text-gray-700 text-sm mt-2">
                          Beds: <span className="font-semibold">{pg.beds}</span>
                        </p>

                        {/* Amenities */}
                        {pg.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {pg.amenities.slice(0, 3).map((am, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {am}
                              </span>
                            ))}
                            {pg.amenities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{pg.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="px-5 pb-5 flex gap-2">
                        <button
                          onClick={() => handleEditListing(pg._id)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(pg._id)}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===========================
              INQUIRIES TAB
          =========================== */}
          {activeTab === "inquiries" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tenant Inquiries
              </h2>

              {inquiries.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-xl border shadow-sm">
                  <p className="text-gray-600">No inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {inq.listingTitle}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {inq.tenantName} • {inq.contact}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(inq.date).toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 text-xs rounded-md font-semibold ${
                            inq.status === "New"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-4 mt-4 rounded-lg border text-gray-700 text-sm">
                        "{inq.message}"
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          onClick={() => alert(inq.message)}
                        >
                          View Details
                        </button>

                        {inq.status === "New" && (
                          <button
                            onClick={() => handleMarkInquiry(inq.id)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                          >
                            Mark Contacted
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default PGOwnerDashboard;
