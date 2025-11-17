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

  useEffect(() => {
    const loadMess = async () => {
      try {
        const res = await getMessById(id);
        setMess(res);
      } catch (error) {
        console.error("Failed to load mess details:", error);
        setMess({ error: true });
      }
    };
    loadMess();
  }, [id]);

  const submitRating = async () => {
    const studentId = localStorage.getItem("userId");
    if (!studentId) {
      alert("Please log in to submit a rating.");
      return;
    }
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    try {
      const res = await submitMessRating(id, {
        studentId,
        stars: rating,
        comment,
      });

      alert(res.message);
      setRating(0);
      setComment("");
    } catch (error) {
      alert("Failed to submit rating. Please try again.");
      console.error("Rating submission error:", error);
    }
  };

  if (!mess)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-medium text-gray-700">
          Loading mess details...
        </p>
      </div>
    );

  if (mess.error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-medium text-red-500">
          Error loading details. Mess not found.
        </p>
      </div>
    );

  const hasRatings = Array.isArray(mess.ratings) && mess.ratings.length > 0;
  const avgRating =
    mess.averageRating ??
    (hasRatings
      ? mess.ratings.reduce((sum, r) => sum + (r.stars || 0), 0) /
        mess.ratings.length
      : null);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
        <Header />

        <main className="flex-grow p-4 sm:p-8">
          <div className="max-w-5xl mx-auto w-full space-y-8">
            {/* Top section: Title + meta + rating */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
                    {mess.title}
                  </h1>

                  <p className="text-base sm:text-lg text-gray-500 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    {mess.location}
                  </p>

                  {/* Tags row: type, price, capacity */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mess.type && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        {mess.type}
                      </span>
                    )}
                    {typeof mess.price === "number" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        ₹{mess.price} / month
                      </span>
                    )}
                    {mess.capacity && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        Capacity: {mess.capacity} people
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating summary */}
                <div className="flex flex-col items-start sm:items-end space-y-2">
                  {avgRating ? (
                    <>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-3xl font-bold mr-2">
                          {avgRating.toFixed(1)}
                        </span>
                        {/* readOnly visual stars – uses same component for consistency */}
                        <RatingStars rating={Math.round(avgRating)} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {mess.totalRatings ?? mess.ratings?.length ?? 0} ratings
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No ratings yet. Be the first to rate!
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {mess.description && (
                <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {mess.description}
                </p>
              )}
            </section>

            {/* Images gallery (if any) */}
            {Array.isArray(mess.images) && mess.images.length > 0 && (
              <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mess.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Mess image ${idx + 1}`}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-100"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Today's Special */}
            <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span role="img" aria-label="sparkles">
                    ✨
                  </span>
                  Today’s Special
                </h2>
              </div>
              <SpecialToday special={mess.specialToday} />
            </section>

            {/* Menu Section – day-wise cards */}
            <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100">
              <MenuSection menu={mess.menu} />
            </section>

            {/* Rating submission */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">
                Share your experience
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center mb-5 gap-3">
                <p className="text-lg font-medium text-gray-600">
                  Your Rating:
                </p>
                <RatingStars rating={rating} setRating={setRating} />
              </div>

              <textarea
                className="w-full mt-3 p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out resize-none text-sm sm:text-base"
                rows="4"
                placeholder="Write your detailed feedback and comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                onClick={submitRating}
                className="mt-4 w-full sm:w-auto sm:min-w-[200px] bg-indigo-600 text-white font-semibold tracking-wider px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition duration-200 ease-in-out transform hover:scale-[1.01]"
              >
                Submit Rating
              </button>
            </section>

            {/* Contact owner */}
            <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Connect with the mess owner
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${mess.contact}`}
                  className="flex items-center justify-center bg-green-500 text-white font-semibold p-3 sm:p-4 rounded-xl shadow-md hover:bg-green-600 transition duration-200 text-sm sm:text-base"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  Call Owner
                </a>

                <Link
                  to={`/chat/${mess.messOwnerId}`}
                  className="flex items-center justify-center bg-indigo-500 text-white font-semibold p-3 sm:p-4 rounded-xl shadow-md hover:bg-indigo-600 transition duration-200 text-sm sm:text-base"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    ></path>
                  </svg>
                  Message Owner
                </Link>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MessDetails;
