// src/pages/dashboard/PGOwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const PGOwnerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ Redirect if not logged in or invalid role
  useEffect(() => {
    if (!token || role !== "pgowner") navigate("/login");
  }, []);

  // ✅ Fetch logged user profile
  const fetchUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Force JSON parse safely
      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        data = {};
      }

      if (data.user) {
        setUser(data.user);
      } else {
        throw new Error("Invalid profile response");
      }
    } catch (err) {
      console.error("Profile error:", err);
      setError("Could not fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch PG listings for this owner
  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pgs/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.pgs) setListings(data.pgs);
      else setListings([]);
    } catch (err) {
      console.error(err);
      setError("Could not load PG listings");
    }
  };

  // ✅ Load all dashboard data
  useEffect(() => {
    const load = async () => {
      await fetchUserProfile();
      await fetchListings();

      // ✅ Dummy inquiries for now
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
    };

    load();
  }, []);

  // ✅ Navigation actions
  const handleAddListing = () => navigate("/dashboard/add-listing");
  const handleEditListing = (id) => navigate(`/dashboard/edit-listing/${id}`);
  const handleDeleteListing = (id) => {
    if (window.confirm("Delete listing permanently?")) {
      setListings(listings.filter((l) => l._id !== id));
    }
  };

  // ✅ Mark inquiry as contacted
  const handleMarkInquiry = (id) => {
    setInquiries(
      inquiries.map((inq) =>
        inq.id === id ? { ...inq, status: "Contacted" } : inq
      )
    );
  };

  // ✅ Loading screen
  if (loading || !user)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );

  // ✅ Error screen
  if (error)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );

  // ✅ MAIN UI - Subtle Professional Design
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header username={user?.name} userRole={user?.role} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
          {/* ✅ WELCOME HEADER */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back, {user?.name}
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your properties today
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm px-4 py-2 border border-gray-200">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ DASHBOARD STATS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Listings Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Total Listings
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {listings.length}
              </p>
            </div>

            {/* Available Beds Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  AVAILABLE
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Available Beds
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {listings.reduce((acc, pg) => acc + (pg.beds || 0), 0)}
              </p>
            </div>

            {/* New Inquiries Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                {inquiries.filter((i) => i.status === "New").length > 0 && (
                  <span className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded">
                    NEW
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                New Inquiries
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {inquiries.filter((i) => i.status === "New").length}
              </p>
            </div>
          </section>

          {/* ✅ TABS */}
          <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex gap-1 border border-gray-200">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === "listings"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                    clipRule="evenodd"
                  />
                </svg>
                Listings
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    activeTab === "listings"
                      ? "bg-white/20"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {listings.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === "inquiries"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Inquiries
                {inquiries.filter((i) => i.status === "New").length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    {inquiries.filter((i) => i.status === "New").length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* ✅ LISTINGS SECTION */}
          {activeTab === "listings" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Your Property Listings
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Manage and showcase your PG properties
                  </p>
                </div>
                <button
                  onClick={handleAddListing}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add New PG
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Listings Yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start by adding your first property listing to attract
                    potential tenants
                  </p>
                  <button
                    onClick={handleAddListing}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Create First Listing
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((pg) => (
                    <div
                      key={pg._id}
                      className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
                    >
                      {/* Image Section */}
                      <div className="relative h-48">
                        <img
                          src={
                            pg.images?.length
                              ? `http://localhost:5000${pg.images[0]}`
                              : "https://via.placeholder.com/300"
                          }
                          className="w-full h-full object-cover"
                          alt={pg.title}
                        />
                        
                        {/* Price Badge */}
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-md shadow-md">
                          <p className="text-sm font-bold text-indigo-600">
                            ₹{pg.monthlyRent || "N/A"}
                          </p>
                        </div>

                        {/* Status Badge */}
                        {pg.available && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-md text-xs font-semibold">
                            Available
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {pg.title}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center gap-1 mb-3">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {pg.location}
                        </p>

                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span className="font-medium">{pg.beds || 0}</span> Beds
                          </span>
                        </div>

                        {/* Amenities */}
                        {pg.amenities && pg.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {pg.amenities.slice(0, 3).map((amenity, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded font-medium"
                              >
                                {amenity}
                              </span>
                            ))}
                            {pg.amenities.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{pg.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="px-5 pb-5 flex gap-2">
                        <button
                          onClick={() => handleEditListing(pg._id)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(pg._id)}
                          className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ✅ INQUIRIES SECTION */}
          {activeTab === "inquiries" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Tenant Inquiries
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage inquiries from potential tenants
                </p>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Inquiries Yet
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    When tenants show interest in your properties, their inquiries
                    will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-white shadow-sm rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-shadow"
                    >
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                              {inq.listingTitle}
                            </h3>
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {inq.tenantName}
                              </div>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {inq.contact}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">
                              {new Date(inq.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${
                              inq.status === "New"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>

                        {/* Message */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                          <p className="text-gray-700 text-sm">
                            "{inq.message}"
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => alert(inq.message)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            View Details
                          </button>
                          {inq.status === "New" && (
                            <button
                              onClick={() => handleMarkInquiry(inq.id)}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Mark Contacted
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PGOwnerDashboard;