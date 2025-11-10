import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PGOwnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);

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
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error("Profile error:", err);
      setError("Could not fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch PG listings
  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pgs/owner/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListings(data.pgs || []);
    } catch (err) {
      console.error(err);
      setError("Could not load PG listings");
    }
  };

  // ✅ Fetch inquiries
  const fetchInquiries = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/messages/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUserProfile();
      await fetchListings();
      await fetchInquiries();
    };
    load();
  }, []);

  // ✅ Open chat modal
  const handleOpenChat = async (inq) => {
    setSelectedInquiry(inq);
    setShowChatModal(true);
    await fetchChat(inq.pgId._id, inq.senderId._id);
  };

  // ✅ Fetch conversation thread
  const fetchChat = async (pgId, tenantId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/${pgId}/${tenantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setChatMessages(data.messages);
    } catch (err) {
      console.error("Chat fetch error:", err);
    }
  };

  // ✅ Send reply
  const handleReplySend = async () => {
    if (!replyMessage.trim()) return toast.warn("Enter message first");
    try {
      const res = await fetch("http://localhost:5000/api/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pgId: selectedInquiry.pgId._id,
          tenantId: selectedInquiry.senderId._id,
          replyText: replyMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reply sent!");
        setReplyMessage("");
        await fetchChat(selectedInquiry.pgId._id, selectedInquiry.senderId._id);
      } else toast.error(data.message);
    } catch (err) {
      console.error("Error sending reply:", err);
      toast.error("Server error");
    }
  };

  // ✅ Mark as contacted
  const handleMarkContacted = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/mark/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Marked as contacted!");
        fetchInquiries();
      } else toast.error("Failed to update status");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // ✅ Helper to format timestamps
  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = inquiries.filter((i) => !i.isRead).length;

  // ✅ Loading / Error
  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
        </div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header username={user?.name} userRole={user?.role} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
          {/* ✅ Welcome */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome Back, {user?.name}
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your properties today
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded shadow-sm border text-sm text-gray-600">
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

          {/* ✅ Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between mb-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12H4V4z" />
                  </svg>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-sm text-gray-600">Total Listings</h3>
              <p className="text-4xl font-bold">{listings.length}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between mb-2">
                <div className="bg-green-50 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2l8 8H2l8-8z" />
                  </svg>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                  AVAILABLE
                </span>
              </div>
              <h3 className="text-sm text-gray-600">Available Beds</h3>
              <p className="text-4xl font-bold">
                {listings.reduce((sum, pg) => sum + (pg.beds || 0), 0)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
              <div className="flex justify-between mb-2">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 4h16v12H2z" />
                  </svg>
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h3 className="text-sm text-gray-600">New Inquiries</h3>
              <p className="text-4xl font-bold">{inquiries.length}</p>
            </div>
          </section>

          {/* ✅ Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex gap-1 border border-gray-200">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-6 py-2.5 rounded-md font-medium ${
                activeTab === "listings"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`relative px-6 py-2.5 rounded-md font-medium ${
                activeTab === "inquiries"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Inquiries
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* ✅ Inquiries Section */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border">
                  <p className="text-gray-500">No inquiries yet.</p>
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq._id}
                    className="bg-white shadow-sm rounded-lg p-5 border hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {inq.pgId?.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          From: {inq.senderId?.name} ({inq.senderId?.email})
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(inq.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenChat(inq)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          💬 Reply
                        </button>
                        <button
                          onClick={() => handleMarkContacted(inq._id)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            inq.isContacted
                              ? "bg-green-100 text-green-600 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-600"
                          }`}
                          disabled={inq.isContacted}
                        >
                          {inq.isContacted ? "✅ Contacted" : "Mark Contacted"}
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg border text-sm">
                      {inq.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />

      {/* ✅ Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-lg p-6 relative">
            <button
              onClick={() => setShowChatModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Chat with {selectedInquiry?.senderId?.name}
            </h3>

            <div className="border rounded-lg p-3 h-72 overflow-y-auto bg-gray-50 mb-4">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400 text-center mt-12">No messages yet.</p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`mb-3 flex ${
                      msg.senderId._id === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.senderId._id === user._id
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.message}
                      <div className="text-xs opacity-70 mt-1">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleReplySend}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default PGOwnerDashboard;
