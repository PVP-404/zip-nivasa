// src/pages/dashboard/PGOwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const PGOwnerDashboard = () => {
  const navigate = useNavigate();

  const user = {
    id: "user123",
    role: "owner",
    name: "Priya Sharma",
  };

  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // New state for tab navigation

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call for listings and inquiries
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockListings = [
          {
            id: "l1",
            type: "PG",
            title: "Cozy PG with Mess",
            location: "Pimpri-Chinchwad",
            price: 7500,
            beds: 3,
            available: true,
            amenities: ["Wi-Fi", "Laundry", "Mess Food"],
            thumbnail: "https://via.placeholder.com/150",
            views: 124,
            inquiries: 8,
          },
          {
            id: "l2",
            type: "PG",
            title: "Single Room PG for Girls",
            location: "Hinjewadi",
            price: 9000,
            beds: 1,
            available: false,
            amenities: ["24/7 Water", "AC", "Power Backup"],
            thumbnail: "https://via.placeholder.com/150",
            views: 89,
            inquiries: 5,
          },
          {
            id: "l5",
            type: "Room",
            title: "Spacious 1BHK Flat",
            location: "Lohegaon",
            price: 11000,
            available: true,
            amenities: ["Modular Kitchen", "Reserved Parking"],
            thumbnail: "https://via.placeholder.com/150",
            views: 156,
            inquiries: 12,
          },
        ];

        const mockInquiries = [
          { 
            id: "i1", 
            listingTitle: "Cozy PG with Mess", 
            tenantName: "Rahul Kumar", 
            contact: "9876543210", 
            status: "New",
            date: "2023-06-15T10:30:00",
            message: "I'm interested in your PG. Could you share more details about the food menu?"
          },
          { 
            id: "i2", 
            listingTitle: "Single Room PG for Girls", 
            tenantName: "Anjali Singh", 
            contact: "9988776655", 
            status: "Contacted",
            date: "2023-06-14T16:45:00",
            message: "When can I come for a visit? I'm available on weekends."
          },
          { 
            id: "i3", 
            listingTitle: "Spacious 1BHK Flat", 
            tenantName: "Vikram Patel", 
            contact: "8899776655", 
            status: "New",
            date: "2023-06-16T09:15:00",
            message: "Is parking available for two vehicles?"
          },
        ];

        setListings(mockListings);
        setInquiries(mockInquiries);
      } catch (err) {
        setError("Failed to fetch dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === "owner") {
      fetchDashboardData();
    }
  }, [user.role]);

  const handleAddListing = () => {
    navigate("/dashboard/add-listing");
  };

  const handleEditListing = (listingId) => {
    navigate(`/dashboard/edit-listing/${listingId}`);
  };

  const handleDeleteListing = (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      // Simulate deletion
      setListings(listings.filter(listing => listing.id !== listingId));
    }
  };

  const handleMarkInquiry = (inquiryId, newStatus) => {
    setInquiries(inquiries.map(inquiry => 
      inquiry.id === inquiryId ? {...inquiry, status: newStatus} : inquiry
    ));
  };

  const handleViewInquiry = (inquiry) => {
    // In a real app, this would open a modal or navigate to a detail page
    alert(`Inquiry Details:\nFrom: ${inquiry.tenantName}\nMessage: ${inquiry.message}\nDate: ${new Date(inquiry.date).toLocaleDateString()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header userRole={user.role} isLoggedIn={true} />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white p-6 rounded-lg shadow-md h-32"></div>
                ))}
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-sm h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header userRole={user.role} isLoggedIn={true} />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <div className="text-xl text-red-500 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header userRole={user.role} isLoggedIn={true} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user.name}! 👋
            </h1>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Listings</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{listings.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Manage your property listings</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Available Beds</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {listings.filter((l) => l.available).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Ready for new tenants</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">New Inquiries</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {inquiries.filter((i) => i.status === "New").length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Need your attention</p>
            </div>
          </section>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("listings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "listings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Your Listings
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "inquiries"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tenant Inquiries
                {inquiries.filter(i => i.status === "New").length > 0 && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {inquiries.filter(i => i.status === "New").length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {activeTab === "listings" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Listings</h2>
                <button
                  onClick={handleAddListing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Listing
                </button>
              </div>
              
              <section className="bg-white p-6 rounded-lg shadow-xl mb-8">
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-4">
                      You haven't listed any accommodations yet.
                    </p>
                    <button
                      onClick={handleAddListing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <div key={listing.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="relative">
                          <img
                            src={listing.thumbnail}
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                          <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${
                            listing.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {listing.available ? "Available" : "Booked"}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {listing.type} in {listing.location}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-xl">₹{listing.price.toLocaleString()}</span>
                            {listing.beds && (
                              <span className="text-sm text-gray-500">
                                {listing.beds} {listing.beds > 1 ? 'Beds' : 'Bed'}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {listing.amenities.slice(0, 3).map((amenity, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {amenity}
                              </span>
                            ))}
                            {listing.amenities.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{listing.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                            <span>{listing.views} views</span>
                            <span>{listing.inquiries} inquiries</span>
                          </div>
                        </div>
                        <div className="flex justify-between p-4 border-t border-gray-100">
                          <button
                            onClick={() => handleEditListing(listing.id)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === "inquiries" && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tenant Inquiries</h2>
              <div className="bg-white p-6 rounded-lg shadow-xl">
                {inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No inquiries yet.</p>
                    <p className="text-gray-400 text-sm mt-1">When tenants contact you, their inquiries will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className={`p-4 rounded-lg border ${
                        inquiry.status === "New" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{inquiry.listingTitle}</h3>
                            <p className="text-sm text-gray-500">From: {inquiry.tenantName}</p>
                            <p className="text-sm text-gray-500 mt-1">{inquiry.message}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inquiry.status === "New" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                            }`}>
                              {inquiry.status}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(inquiry.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                          <div className="text-sm">
                            <span className="text-gray-600">Contact: </span>
                            <a href={`tel:${inquiry.contact}`} className="text-blue-600 hover:text-blue-800">
                              {inquiry.contact}
                            </a>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewInquiry(inquiry)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                            {inquiry.status === "New" && (
                              <button
                                onClick={() => handleMarkInquiry(inquiry.id, "Contacted")}
                                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                              >
                                Mark as Contacted
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PGOwnerDashboard;