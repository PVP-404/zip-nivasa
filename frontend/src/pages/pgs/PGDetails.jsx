import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Optimized SVG Icon Component
const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d={d} fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

// Memoized Image Gallery Component
const ImageGallery = React.memo(({ images, selected, onSelect }) => {
  const handlePrev = () => onSelect(selected === 0 ? images.length - 1 : selected - 1);
  const handleNext = () => onSelect(selected === images.length - 1 ? 0 : selected + 1);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="relative group">
        <img
          src={`http://localhost:5000${images[selected]}`}
          className="w-full h-[500px] object-cover"
          alt="Property"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Previous image"
            >
              <Icon d="M15 19l-7-7 7-7" className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Next image"
            >
              <Icon d="M9 5l7 7-7 7" className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selected === idx
                  ? "border-indigo-600 shadow-md scale-105"
                  : "border-gray-300 hover:border-indigo-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={`http://localhost:5000${img}`}
                className="w-full h-full object-cover"
                alt={`View ${idx + 1}`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Memoized Info Card Component
const InfoCard = React.memo(({ icon, title, description, bgColor, iconColor }) => (
  <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-6 border border-opacity-20`}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`${iconColor} p-2 rounded-lg`}>
        <Icon d={icon} className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-700">{description}</p>
  </div>
));

const PGDetails = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pgs/${id}`);
        const data = await res.json();
        setPg(data.pg);
      } catch (err) {
        toast.error("Failed to load PG details");
      } finally {
        setLoading(false);
      }
    };
    fetchPG();
  }, [id]);

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      toast.warn("Message cannot be empty");
      return;
    }
    
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
          message: trimmedMessage,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Message sent to owner!");
        setNewMessage("");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      toast.error("Server error while sending message");
    }
  };

  if (loading || !pg) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading PG details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = pg.images?.length > 0 ? pg.images : ["https://via.placeholder.com/800x600"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">›</li>
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">›</li>
                <li className="text-indigo-600 font-semibold truncate">
                  {pg.title}
                </li>
              </ol>
            </nav>

            {/* PG Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-3">
                    Featured Property
                  </span>
                  <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
                    {pg.title}
                  </h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <Icon d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    <span className="text-lg">{pg.location}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center min-w-[200px]">
                  <p className="text-white/80 text-sm font-medium mb-1">Monthly Rent</p>
                  <p className="text-4xl font-bold drop-shadow-lg">
                    ₹{pg.monthlyRent.toLocaleString()}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Per month</p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <ImageGallery
                images={images}
                selected={selectedImage}
                onSelect={setSelectedImage}
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* About Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Icon
                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        className="w-6 h-6 text-indigo-600"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">About This Property</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">{pg.description}</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"
                    title="Property Type"
                    description="Paying Guest Accommodation"
                    bgColor="from-blue-50 to-indigo-50"
                    iconColor="bg-blue-500"
                  />
                  <InfoCard
                    icon="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    title="Availability"
                    description="Immediate Move-in"
                    bgColor="from-green-50 to-emerald-50"
                    iconColor="bg-green-500"
                  />
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit sticky top-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Icon
                      d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                      className="w-6 h-6 text-indigo-600"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Send Inquiry</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  Interested in this property? Send a message to the owner!
                </p>
                
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this property. Could you please provide more details about..."
                  rows="5"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-700"
                  aria-label="Message to owner"
                />
                
                <button
                  onClick={handleSendMessage}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2 group"
                >
                  <span>Send Message</span>
                  <Icon d="M14 5l7 7m0 0l-7 7m7-7H3" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Icon
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-xs text-indigo-700">
                      Your message will be sent directly to the property owner. They typically respond within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default PGDetails;