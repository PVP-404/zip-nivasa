// src/pages/dashboard/PGOwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const PGOwnerDashboard = () => {
  const navigate = useNavigate();

  // ✅ Static mock user for now
  const user = {
    id: "user123",
    role: "owner",
    name: "Priya Sharma",
  };

  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]); // Still mock since backend not built
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");

  // ✅ Fetch PG listings from backend (REAL DATA)
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();

      setListings(data); // ✅ Assign DB data
    } catch (err) {
      console.error(err);
      setError("Failed to fetch listings. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load Dashboard Data
  useEffect(() => {
    fetchListings();

    // ✅ Hardcoded inquiries (for now)
    setInquiries([
      {
        id: "i1",
        listingTitle: "Cozy PG with Mess",
        tenantName: "Rahul Kumar",
        contact: "9876543210",
        status: "New",
        date: "2023-06-15T10:30:00",
        message: "I'm interested. More details about mess?",
      },
    ]);
  }, []);

  // ✅ Navigate to add listing page
  const handleAddListing = () => {
    navigate("/dashboard/add-listing");
  };

  // ✅ Navigate to edit listing
  const handleEditListing = (id) => {
    navigate(`/dashboard/edit-listing/${id}`);
  };

  // ✅ Delete listing (Frontend only for now)
  const handleDeleteListing = (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
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

  // ✅ View inquiry details
  const handleViewInquiry = (inq) => {
    alert(
      `Inquiry from ${inq.tenantName}\nMessage: ${inq.message}\nDate: ${new Date(
        inq.date
      ).toLocaleDateString()}`
    );
  };

  // ✅ Loading screen
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header userRole={user.role} isLoggedIn={true} />
        <div className="flex">
          <Sidebar />
          <p className="p-8 text-lg">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ Error screen
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header userRole={user.role} isLoggedIn={true} />
        <div className="flex">
          <Sidebar />
          <p className="p-8 text-red-600 text-lg">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header userRole={user.role} isLoggedIn={true} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Welcome, {user.name} 👋</h1>
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* ✅ DASHBOARD CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Listings
              </h3>
              <p className="text-4xl font-bold mt-2">{listings.length}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-700">
                Available Beds
              </h3>
              <p className="text-4xl font-bold mt-2">
                {listings.filter((l) => l.available).length}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-700">
                New Inquiries
              </h3>
              <p className="text-4xl font-bold mt-2">
                {inquiries.filter((i) => i.status === "New").length}
              </p>
            </div>
          </section>

          {/* ✅ TABS */}
          <div className="border-b mb-6">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2 text-sm font-semibold ${
                activeTab === "listings"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Listings
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-4 py-2 text-sm font-semibold ml-4 ${
                activeTab === "inquiries"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Inquiries
            </button>
          </div>

          {/* ✅ LISTINGS SECTION */}
          {activeTab === "listings" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Listings</h2>
                <button
                  onClick={handleAddListing}
                  className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                >
                  Add New Listing
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="bg-white shadow rounded-lg overflow-hidden"
                  >
                    {/* ✅ Image */}
                    <img
                      src={
                        listing.images?.length
                          ? `http://localhost:5000${listing.images[0]}`
                          : "https://via.placeholder.com/300"
                      }
                      alt="PG"
                      className="w-full h-48 object-cover"
                    />

                    {/* ✅ Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{listing.title}</h3>
                      <p className="text-gray-500 text-sm">
                        {listing.location}
                      </p>

                      <div className="flex justify-between mt-3 text-sm">
                        <span className="font-bold text-xl">
                          ₹{listing.monthlyRent}
                        </span>
                        <span className="text-gray-500">
                          {listing.beds} Beds
                        </span>
                      </div>

                      {/* ✅ Amenities */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {listing.amenities?.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 rounded"
                          >
                            {a}
                          </span>
                        ))}
                      </div>

                      {/* ✅ Views + Inquiries */}
                      <div className="flex justify-between mt-3 text-xs text-gray-500 border-t pt-2">
                        <span>{listing.views} views</span>
                        <span>{listing.inquiries} inquiries</span>
                      </div>
                    </div>

                    {/* ✅ Actions */}
                    <div className="p-3 border-t flex justify-between">
                      <button
                        onClick={() => handleEditListing(listing._id)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ✅ INQUIRIES */}
          {activeTab === "inquiries" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Tenant Inquiries</h2>

              {inquiries.length === 0 ? (
                <p>No inquiries yet.</p>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((i) => (
                    <div
                      className="p-4 bg-white shadow rounded-lg"
                      key={i.id}
                    >
                      <h3 className="font-semibold">{i.listingTitle}</h3>
                      <p className="text-gray-500">From: {i.tenantName}</p>
                      <p className="text-gray-600 mt-1">{i.message}</p>

                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => handleViewInquiry(i)}
                          className="text-blue-600"
                        >
                          View
                        </button>
                        {i.status === "New" && (
                          <button
                            onClick={() => handleMarkInquiry(i.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
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
