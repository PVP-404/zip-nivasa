//frontend/pages/mess/messDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Core logic remains the same
import { getMessById, submitMessRating } from "../../services/messService";

import RatingStars from "./components/RatingStars";
import MenuSection from "./components/MenuSection";
import SpecialToday from "./components/SpecialToday";

const MessDetails = () => {
  // Core state logic remains the same
  const { id } = useParams();
  const [mess, setMess] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Core useEffect logic remains the same
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

  // Core submitRating logic remains the same
  const submitRating = async () => {
    const studentId = localStorage.getItem("studentId");
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
      // Clear local state after successful submission
      setRating(0);
      setComment("");
    } catch (error) {
      alert("Failed to submit rating. Please try again.");
      console.error("Rating submission error:", error);
    }
  };

  // Improved loading state and added basic error state
  if (!mess)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-medium text-gray-700">Loading Mess Details...</p>
      </div>
    );
  
  if (mess.error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-medium text-red-500">Error loading details. Mess not found.</p>
      </div>
    );

  // Enhanced UI structure
  return (
    // PRIMARY CONTAINER: min-h-screen ensures it takes full height
    <div className="flex bg-gray-50 min-h-screen"> 
      
      {/* SIDEBAR: Assumes 'Sidebar' component handles its own fixed positioning or is placed outside the scrolling container */}
      <Sidebar /> 
      
      {/* CONTENT WRAPPER: Added 'overflow-y-auto' and 'max-h-screen' to make this section scrollable */}
      <div className="flex-1 flex flex-col max-h-screen overflow-y-auto"> 
        <Header />
        
        {/* MAIN CONTENT AREA */}
        <main className="flex-grow p-4 sm:p-8">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            
            {/* MESS HEADER / INFO */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-1">{mess.title}</h1>
              <p className="text-lg text-gray-500 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {mess.location}
              </p>
              {mess.averageRating && (
                <div className="flex items-center text-yellow-500">
                  <span className="text-2xl font-bold mr-2">{mess.averageRating.toFixed(1)}</span>
                  <RatingStars rating={Math.round(mess.averageRating)} readOnly={true} />
                  <span className="ml-2 text-gray-500 text-sm">({mess.totalRatings || 0} Ratings)</span>
                </div>
              )}
            </div>

            {/* SPECIAL TODAY */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <SpecialToday special={mess.specialToday} />
            </div>

            {/* MENU SECTION */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <MenuSection menu={mess.menu} />
            </div>

            {/* RATING SUBMISSION */}
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">Share Your Experience</h2>

              <div className="flex items-center mb-5">
                <p className="text-lg font-medium text-gray-600 mr-4">Your Rating:</p>
                <RatingStars rating={rating} setRating={setRating} />
              </div>

              <textarea
                className="w-full mt-3 p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out resize-none"
                rows="4"
                placeholder="Write your detailed feedback and comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                onClick={submitRating}
                className="mt-4 w-full bg-indigo-600 text-white font-semibold tracking-wider px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition duration-200 ease-in-out transform hover:scale-[1.005]"
              >
                Submit Rating
              </button>
            </div>

            {/* CONTACT OWNER */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Connect with the Mess Owner</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <a
                  href={`tel:${mess.contact}`}
                  className="flex items-center justify-center bg-green-500 text-white font-semibold p-4 rounded-xl shadow-md hover:bg-green-600 transition duration-200"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  Call Owner
                </a>

                <Link
                  to={`/chat/${mess.messOwnerId}`}
                  className="flex items-center justify-center bg-indigo-500 text-white font-semibold p-4 rounded-xl shadow-md hover:bg-indigo-600 transition duration-200"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  Message Owner
                </Link>
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MessDetails;