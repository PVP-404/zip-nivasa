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
      const res = await getMessById(id);
      setMess(res);
    };
    loadMess();
  }, [id]);

  const submitRating = async () => {
    const studentId = localStorage.getItem("studentId");

    const res = await submitMessRating(id, {
      studentId,
      stars: rating,
      comment,
    });

    alert(res.message);
  };

  if (!mess)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 max-w-6xl mx-auto w-full">

          <h1 className="text-3xl font-bold">{mess.title}</h1>
          <p className="text-gray-600">{mess.location}</p>

          {/* SPECIAL TODAY */}
          <SpecialToday special={mess.specialToday} />

          {/* MENU */}
          <MenuSection menu={mess.menu} />

          {/* RATING */}
          <div className="bg-white p-6 mt-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">Rate this Mess</h2>

            <RatingStars rating={rating} setRating={setRating} />

            <textarea
              className="w-full mt-3 p-3 border rounded-lg"
              placeholder="Write your feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={submitRating}
              className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Submit Rating
            </button>
          </div>

          {/* CONTACT OWNER */}
          <div className="bg-white p-6 mt-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Contact Mess Owner</h3>

            <a
              href={`tel:${mess.contact}`}
              className="block mt-3 bg-green-600 text-white p-3 rounded-lg text-center"
            >
              Call Owner
            </a>

            <Link
              to={`/chat/${mess.messOwnerId}`}
              className="block mt-3 bg-indigo-600 text-white p-3 rounded-lg text-center"
            >
              Message Owner
            </Link>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MessDetails;
