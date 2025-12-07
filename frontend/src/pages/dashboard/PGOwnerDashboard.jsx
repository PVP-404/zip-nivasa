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

  useEffect(() => {
    if (!token || role !== "pgowner") navigate("/login");
  }, []);

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

  useEffect(() => {
    const load = async () => {
      await fetchUserProfile();
      await fetchListings();

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

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50/90 via-emerald-50 to-mint-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
            <p className="mt-4 text-emerald-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50/90 via-emerald-50 to-mint-50">
        <Header />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="bg-emerald-50/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-emerald-200 max-w-md">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-emerald-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50/90 via-emerald-50 to-mint-50">
      <Header onToggleSidebar={() => setIsSidebarOpen((p) => !p)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 overflow-y-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800">
                Welcome, {user?.name}
              </h1>
              <p className="text-emerald-600 mt-1 font-medium">
                Manage your PG listings and inquiries
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
              <p className="text-xs text-emerald-500">Last updated</p>
              <p className="text-sm font-semibold text-emerald-800">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex justify-between mb-3">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                  </svg>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-emerald-600">Total Listings</p>
              <p className="text-4xl font-bold text-emerald-800">
                {listings.length}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex justify-between mb-3">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor">
                    <path d="M10.707 2.293l-7 7a1 1 0 001.414 1.414L4 10.414V17h12V10.414l-.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-emerald-600">Available Beds</p>
              <p className="text-4xl font-bold text-emerald-800">
                {listings.reduce((acc, pg) => acc + (pg.beds || 0), 0)}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex justify-between mb-3">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  </svg>
                </div>
                {inquiries.some((i) => i.status === "New") && (
                  <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
              </div>

              <p className="text-sm text-emerald-600">New Inquiries</p>
              <p className="text-4xl font-bold text-emerald-800">
                {inquiries.filter((i) => i.status === "New").length}
              </p>
            </div>
          </section>

          <div className="mb-6 bg-white/95 backdrop-blur-sm rounded-2xl inline-flex p-1 border border-emerald-200 shadow-sm">
            {["listings", "inquiries"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white shadow-md" 
                    : "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                }`}
              >
                {tab === "listings" ? "Listings" : "Inquiries"}
              </button>
            ))}
          </div>

          {activeTab === "listings" && (
            <>
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-emerald-800">
                    Your Property Listings
                  </h2>
                  <p className="text-emerald-600 text-sm font-medium">
                    Manage and view your PGs
                  </p>
                </div>

                <button
                  onClick={handleAddListing}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-md hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-semibold"
                >
                  + Add New PG
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="bg-white/95 backdrop-blur-sm p-12 rounded-2xl text-center border border-emerald-100 shadow-xl">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                    No Listings Yet
                  </h3>
                  <p className="text-emerald-600 mb-5">
                    Add your first PG listing to attract tenants
                  </p>
                  <button
                    onClick={handleAddListing}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
                  >
                    Create Listing
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((pg) => (
                    <div
                      key={pg._id}
                      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={pg.images?.length ? pg.images[0] : "https://via.placeholder.com/300"}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          alt={pg.title}
                        />

                        <span className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-xl shadow-lg font-semibold">
                          ₹{pg.monthlyRent}
                        </span>

                        {pg.available && (
                          <span className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 text-xs rounded-full font-semibold shadow-lg">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-emerald-800 text-lg truncate">
                          {pg.title}
                        </h3>
                        <p className="text-emerald-600 text-sm mt-1">
                          {pg.address}
                        </p>
                        <p className="text-emerald-700 text-sm mt-2 font-medium">
                          Beds: <span className="font-bold text-emerald-800">{pg.beds}</span>
                        </p>
                        {pg.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {pg.amenities.slice(0, 3).map((am, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
                              >
                                {am}
                              </span>
                            ))}
                            {pg.amenities.length > 3 && (
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-200">
                                +{pg.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="px-6 pb-6 flex gap-3">
                        <button
                          onClick={() => handleEditListing(pg._id)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(pg._id)}
                          className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200 font-semibold"
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

          {activeTab === "inquiries" && (
            <div>
              <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                Tenant Inquiries
              </h2>

              {inquiries.length === 0 ? (
                <div className="bg-white/95 backdrop-blur-sm p-10 text-center rounded-2xl border border-emerald-100 shadow-xl">
                  <p className="text-emerald-600 font-medium">No inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-emerald-800">
                            {inq.listingTitle}
                          </h3>
                          <p className="text-emerald-600 text-sm font-medium mt-1">
                            {inq.tenantName} • {inq.contact}
                          </p>
                          <p className="text-emerald-500 text-xs mt-1">
                            {new Date(inq.date).toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`px-4 py-2 text-sm rounded-xl font-semibold ${
                            inq.status === "New"
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="bg-emerald-50/50 backdrop-blur-sm p-4 mt-4 rounded-xl border border-emerald-200 text-emerald-700 text-sm">
                        "{inq.message}"
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          className="flex-1 px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all border border-emerald-200 font-semibold hover:shadow-sm"
                          onClick={() => alert(inq.message)}
                        >
                          View Details
                        </button>

                        {inq.status === "New" && (
                          <button
                            onClick={() => handleMarkInquiry(inq.id)}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
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

      <Footer />
    </div>
  );
};

export default PGOwnerDashboard;
