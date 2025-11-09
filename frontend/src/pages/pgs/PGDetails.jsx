import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d={path} />
  </svg>
);

const StarRating = ({ rating = 4.5 }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="ml-2 text-sm font-semibold text-gray-700">{rating}</span>
  </div>
);

const PGDetails = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [chat, setChat] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ✅ Fetch PG Details + Recommendations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pgRes, allRes] = await Promise.all([
          fetch(`http://localhost:5000/api/pgs/${id}`),
          fetch(`http://localhost:5000/api/pgs`),
        ]);
        const pgData = await pgRes.json();
        const allData = await allRes.json();
        setPg(pgData.pg);
        setRecommendations(allData.filter((p) => p._id !== id).slice(0, 3));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Fetch Chat Messages
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/messages/${id}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success) setChat(data.messages);
      } catch (err) {
        console.error("Error fetching chat:", err);
      }
    };
    if (token && userId) fetchChat();

    // Optional: Poll every 5s for live updates
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [id, userId, token]);

  // ✅ Send New Message
 const handleSendMessage = async () => {
  if (!newMessage.trim()) return;
  try {
    const res = await fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pgId: id,
        ownerId: pg.owner?._id,
        message: newMessage,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setChat([...chat, data.data]);
      setNewMessage("");
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error("Error sending message:", err);
  }
};


  if (loading || !pg)
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading property details...</p>
            </div>
          </div>
        </div>
      </div>
    );

  const images =
    pg.images?.length > 0 ? pg.images : ["https://via.placeholder.com/800x600"];
  const rating = pg.rating || 4.5;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <ol className="flex items-center gap-2 text-gray-600">
                <li>
                  <Link to="/" className="hover:text-indigo-600">
                    Home
                  </Link>
                </li>
                <li>›</li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-600">
                    Dashboard
                  </Link>
                </li>
                <li>›</li>
                <li className="text-gray-900 font-medium truncate">
                  {pg.title}
                </li>
              </ol>
            </nav>

            {/* PG Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {pg.title}
                  </h1>
                  <StarRating rating={rating} />
                  <p className="text-gray-600 mt-3">{pg.location}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    ₹{pg.monthlyRent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <img
                  src={
                    pg.images?.length > 0
                      ? `http://localhost:5000${images[selectedImage]}`
                      : images[selectedImage]
                  }
                  className="w-full h-96 object-cover"
                  alt={pg.title}
                />
              </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold mb-2">About</h2>
                  <p className="text-gray-700">
                    {pg.description ||
                      "A comfortable PG with modern amenities and safe environment."}
                  </p>
                </div>

                {/* Amenities */}
                {pg.amenities?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">
                      Amenities & Facilities
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pg.amenities.map((a, i) => (
                        <div
                          key={i}
                          className="text-gray-700 bg-gray-50 rounded-lg p-3 flex items-center gap-2"
                        >
                          <Icon
                            path="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293z"
                            className="w-4 h-4 text-green-600"
                          />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact / Chat Box */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Chat with Owner
                  </h3>

                  {/* Chat Window */}
                  <div className="border border-gray-200 rounded-lg mb-3 h-60 overflow-y-auto p-3 bg-gray-50">
                    {chat.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center mt-8">
                        No messages yet. Start the conversation below 👇
                      </p>
                    ) : (
                      chat.map((msg) => (
                        <div
                          key={msg._id}
                          className={`mb-3 flex ${
                            msg.senderId._id === userId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg shadow text-sm ${
                              msg.senderId._id === userId
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <span className="text-xs block mt-1 opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Send Message */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-12 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Similar Properties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <Link
                      key={rec._id}
                      to={`/services/pg/${rec._id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <img
                        src={
                          rec.images?.[0]
                            ? `http://localhost:5000${rec.images[0]}`
                            : "https://via.placeholder.com/400"
                        }
                        className="w-full h-48 object-cover"
                        alt={rec.title}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {rec.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{rec.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default PGDetails;
