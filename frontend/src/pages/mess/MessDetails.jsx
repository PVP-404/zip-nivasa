// frontend/pages/mess/MessDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { getMessById, submitMessRating } from "../../services/messService";

import RatingStars from "./components/RatingStars";
import MenuSection from "./components/MenuSection";
import SpecialToday from "./components/SpecialToday";

const MessDetails = () => {
  const { id } = useParams();
  const [mess, setMess] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Enhanced UX states
  const [activeTab, setActiveTab] = useState("overview");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMessById(id);
        setMess(res);
      } catch (error) {
        console.error("Failed to load mess details:", error);
        setMess({ error: true });
      }
    })();
  }, [id]);

  const submitRatingHandler = async () => {
    const studentId = localStorage.getItem("userId");

    if (!studentId) {
      alert("Please log in to submit a rating.");
      return;
    }
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitMessRating(id, {
        studentId,
        stars: rating,
        comment,
      });

      alert(res.message);
      setRating(0);
      setComment("");
      setShowRatingForm(false);
      
      // Refresh data
      const updatedMess = await getMessById(id);
      setMess(updatedMess);
    } catch (error) {
      alert("Error submitting rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mess)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading mess details...</p>
        </div>
      </div>
    );

  if (mess.error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl font-medium text-red-500">Mess not found.</p>
          <Link to="/mess" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Mess List
          </Link>
        </div>
      </div>
    );

  const hasRatings = Array.isArray(mess.ratings) && mess.ratings.length > 0;
  const avgRating = mess.averageRating ?? (hasRatings
    ? mess.ratings.reduce((s, r) => s + (r.stars || 0), 0) / mess.ratings.length
    : null);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* HEADER */}
      <Header onToggleSidebar={() => setIsSidebarOpen((p) => !p)} />

      <div className="flex flex-1 min-h-0">
        
        {/* SIDEBAR */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          
          {/* Hero Section with Background */}
          <div className="relative h-64 sm:h-80 bg-gradient-to-r from-indigo-600 to-blue-600 overflow-hidden">
            {mess.images?.[0] && (
              <>
                <img 
                  src={mess.images[0]} 
                  alt={mess.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </>
            )}
            
            <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {mess.type && (
                    <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-green-700 backdrop-blur-sm rounded-full shadow-lg">
                      {mess.type}
                    </span>
                  )}
                  {mess.price && (
                    <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-blue-700 backdrop-blur-sm rounded-full shadow-lg">
                      ₹{mess.price}/month
                    </span>
                  )}
                  {mess.capacity && (
                    <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-purple-700 backdrop-blur-sm rounded-full shadow-lg">
                      Capacity: {mess.capacity}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  {mess.title}
                </h1>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-white/90 flex items-center text-sm sm:text-base">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    {mess.location}
                  </p>
                  
                  {avgRating && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <span className="text-yellow-300 text-lg font-bold">★</span>
                      <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
                      <span className="text-white/80 text-sm">({mess.totalRatings ?? mess.ratings?.length ?? 0})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Tab Navigation */}
          <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-3">
                <div className="flex gap-2 overflow-x-auto">
                  {["overview", "menu", "photos", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                        activeTab === tab
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="hidden sm:flex gap-2">
                  <a
                    href={`tel:${mess.contact}`}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    Call
                  </a>
                  
                  <Link
                    to={`/chat/${mess.messOwnerId}`}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                    </svg>
                    Message
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {mess.description && (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📋</span>
                      About This Mess
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{mess.description}</p>
                  </div>
                )}

                {mess.specialToday && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">✨</span>
                      <h2 className="text-2xl font-bold text-amber-900">Today's Special</h2>
                    </div>
                    <SpecialToday special={mess.specialToday} />
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-2xl font-bold text-gray-800">{mess.capacity || "N/A"}</div>
                    <div className="text-sm text-gray-500">Capacity</div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-gray-800">₹{mess.price || "N/A"}</div>
                    <div className="text-sm text-gray-500">Per Month</div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-gray-800">{avgRating ? avgRating.toFixed(1) : "N/A"}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-2xl font-bold text-gray-800">{mess.totalRatings ?? mess.ratings?.length ?? 0}</div>
                    <div className="text-sm text-gray-500">Reviews</div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === "menu" && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">🍱</span>
                  Weekly Menu
                </h2>
                <MenuSection menu={mess.menu} />
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">📸</span>
                  Gallery
                </h2>
                {mess.images?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mess.images.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedImage(img);
                          setImageModalOpen(true);
                        }}
                        className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square shadow-md hover:shadow-xl transition-shadow"
                      >
                        <img
                          src={img}
                          alt={`Mess ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No photos available</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Share Your Experience</h2>
                    {!showRatingForm && (
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
                      >
                        Write Review
                      </button>
                    )}
                  </div>

                  {showRatingForm && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center gap-4">
                        <p className="font-medium text-gray-700">Your Rating:</p>
                        <RatingStars rating={rating} setRating={setRating} />
                      </div>

                      <textarea
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        rows="4"
                        placeholder="Share your experience with this mess..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={submitRatingHandler}
                          disabled={isSubmitting}
                          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                        <button
                          onClick={() => {
                            setShowRatingForm(false);
                            setRating(0);
                            setComment("");
                          }}
                          className="bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    All Reviews ({mess.totalRatings ?? mess.ratings?.length ?? 0})
                  </h3>
                  
                  {hasRatings ? (
                    <div className="space-y-4">
                      {mess.ratings.map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                                {review.studentName?.[0] || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{review.studentName || "Anonymous"}</p>
                                <RatingStars rating={review.stars} />
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 ml-13">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Action Buttons */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex gap-3 z-50">
              <a
                href={`tel:${mess.contact}`}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-600 transition shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                Call
              </a>
              
              <Link
                to={`/chat/${mess.messOwnerId}`}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
                Message
              </Link>
            </div>
          </div>

          <Footer />
        </main>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition"
            onClick={() => setImageModalOpen(false)}
          >
            ×
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default MessDetails;