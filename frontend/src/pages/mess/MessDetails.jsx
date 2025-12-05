import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { getMessById, submitMessRating } from "../../services/messService";

import RatingStars from "./components/RatingStars";
import MenuSection from "./components/MenuSection";
import SpecialToday from "./components/SpecialToday";

import {
  MapPin,
  Users,
  Phone,
  Star,
  MessageCircle,
  Camera,
  UtensilsCrossed,
  Calendar,
  X,
} from "lucide-react";

const MessDetails = () => {
  const { id } = useParams();
  const [mess, setMess] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMessById(id);
        setMess(data);
      } catch (error) {
        setMess({ error: true });
      }
    })();
  }, [id]);

  const submitRatingHandler = async () => {
    const studentId = localStorage.getItem("userId");

    if (!studentId) return alert("Please login first");
    if (rating === 0) return alert("Select a rating");

    setIsSubmitting(true);

    try {
      await submitMessRating(id, { studentId, stars: rating, comment });
      const updated = await getMessById(id);
      setMess(updated);

      setRating(0);
      setComment("");
      setShowRatingForm(false);
    } catch (err) {
      alert("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mess)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div>
      </div>
    );

  if (mess.error)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Mess not found.
      </div>
    );

  const hasRatings = Array.isArray(mess.ratings) && mess.ratings.length > 0;
  const avgRating = mess.averageRating ?? 
    (hasRatings ? mess.ratings.reduce((a, r) => a + (r.stars || 0), 0) / mess.ratings.length : null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          
          <div className="relative h-72 bg-gradient-to-r from-indigo-700 to-blue-600">
            {mess.images?.length > 0 && (
              <>
                <img
                  src={mess.images[0]}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </>
            )}

            <div className="relative h-full flex items-end px-6 pb-8 max-w-6xl mx-auto">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-white drop-shadow-sm">{mess.title}</h1>

                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>{mess.location}</span>
                  </div>

                  {avgRating && (
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                      <Star size={16} className="text-yellow-300" />
                      <span className="font-medium">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs bg-white/20 text-white rounded-full">
                    ₹{mess.price}/month
                  </span>
                  <span className="px-3 py-1 text-xs bg-white/20 text-white rounded-full flex items-center gap-1">
                    <Users size={16} /> {mess.capacity} capacity
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-0 bg-white border-b z-40">
            <div className="flex gap-4 max-w-6xl mx-auto px-6 py-3 overflow-x-auto">
              {["overview", "menu", "photos", "reviews"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === t
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-8">

            {activeTab === "overview" && (
              <div className="space-y-6">

                {mess.description && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      About This Mess
                    </h2>
                    <p className="text-gray-600">{mess.description}</p>
                  </div>
                )}

                {mess.specialToday && (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl shadow border">
                    <div className="flex items-center gap-3 mb-3">
                      <UtensilsCrossed className="text-orange-600" />
                      <h2 className="text-xl font-semibold text-gray-800">Today's Special</h2>
                    </div>
                    <SpecialToday special={mess.specialToday} />
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatItem icon={<Users />} label="Capacity" value={mess.capacity} />
                  <StatItem icon={<Calendar />} label="Monthly Price" value={`₹${mess.price}`} />
                  <StatItem icon={<Star />} label="Rating" value={avgRating?.toFixed(1) || "N/A"} />
                  <StatItem icon={<MessageCircle />} label="Reviews" value={mess.ratings?.length || 0} />
                </div>
              </div>
            )}

            {activeTab === "menu" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UtensilsCrossed className="text-indigo-600" /> Weekly Menu
                </h2>
                <MenuSection menu={mess.menu} />
              </div>
            )}

            {activeTab === "photos" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Camera className="text-indigo-600" /> Gallery
                </h2>

                {mess.images?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mess.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative rounded-xl overflow-hidden group cursor-pointer"
                        onClick={() => {
                          setSelectedImage(img);
                          setImageModalOpen(true);
                        }}
                      >
                        <img
                          src={img}
                          className="w-full h-40 object-cover transition group-hover:scale-110"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 py-6 text-center">No photos available</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">

                <div className="bg-white rounded-xl shadow-sm border p-6">

                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Share Your Review</h2>
                    {!showRatingForm && (
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                      >
                        Write Review
                      </button>
                    )}
                  </div>

                  {showRatingForm && (
                    <div className="space-y-4">
                      <RatingStars rating={rating} setRating={setRating} />

                      <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border p-3 rounded-lg"
                        placeholder="Write your experience..."
                      ></textarea>

                      <div className="flex gap-3">
                        <button
                          onClick={submitRatingHandler}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                        >
                          Submit
                        </button>

                        <button
                          onClick={() => setShowRatingForm(false)}
                          className="bg-gray-100 px-6 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    All Reviews ({mess.ratings?.length || 0})
                  </h3>

                  {hasRatings ? (
                    <div className="space-y-4">
                      {mess.ratings.map((r, i) => (
                        <ReviewItem key={i} review={r} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 py-6 text-center">No reviews yet</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Footer />
        </main>
      </div>

      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setImageModalOpen(false)}
          >
            <X size={32} />
          </button>

          <img
            src={selectedImage}
            className="max-h-[90vh] rounded-xl shadow-xl"
            alt="Full size"
          />
        </div>
      )}
    </div>
  );
};

export default MessDetails;

const StatItem = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center">
    <div className="text-indigo-600 mb-2">{icon}</div>
    <div className="text-xl font-semibold">{value}</div>
    <div className="text-gray-500 text-sm">{label}</div>
  </div>
);

const ReviewItem = ({ review }) => (
  <div className="border-b pb-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
        {review.studentName?.[0] || "U"}
      </div>
      <div>
        <p className="font-semibold">{review.studentName}</p>
        <RatingStars rating={review.stars} />
      </div>
    </div>
    <p className="text-gray-600">{review.comment}</p>
  </div>
);
