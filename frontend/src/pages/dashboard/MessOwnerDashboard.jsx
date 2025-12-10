import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AppLayout from "../../layouts/AppLayout";

import {
  getMessesByOwner,
  publishSpecial,
  deleteMess,
  updateMess,
} from "../../services/messService";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  FaUsers,
  FaEnvelopeOpenText,
  FaStar,
  FaUtensils,
  FaEdit,
  FaTrash,
  FaTimesCircle,
  FaChartBar,
} from "react-icons/fa";

/* -------------------- STAT CARD -------------------- */
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-emerald-600 uppercase tracking-wide text-xs font-semibold">
          {title}
        </h3>
        <p className="text-slate-900 text-3xl font-extrabold">{value}</p>
        <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
      </div>
      <div className={`${color} p-3 rounded-full text-white shadow-md`}>{icon}</div>
    </div>
  </div>
);

/* -------------------- TAB BUTTON -------------------- */
const TabButton = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={`relative py-3 px-6 font-semibold text-sm transition-all rounded-t-lg ${
      active
        ? "text-emerald-700 bg-white shadow-md border-b-2 border-emerald-600"
        : "text-slate-600 hover:text-emerald-700"
    }`}
  >
    {children}
    {badge > 0 && (
      <span className="absolute -top-1 right-2 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
        {badge}
      </span>
    )}
  </button>
);

/* ---------------- MAIN COMPONENT -------------------- */

const MessOwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const [activeTab, setActiveTab] = useState("subscribers");

  const [data, setData] = useState({
    messes: [],
    inquiries: [],
    reviews: [],
  });

  const [todaysSpecial, setTodaysSpecial] = useState({
    lunch: "",
    dinner: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  /* ------------ JWT DECODE USER ---------------- */
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      setOwnerId(decoded.id);
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }, []);

  /* ------------ LOAD DATA ---------------- */
  useEffect(() => {
    if (!ownerId) return;

    const loadData = async () => {
      try {
        const messes = await getMessesByOwner(ownerId);

        const fakeInquiries = [
          {
            id: "1",
            customerName: "Amit Sharma",
            message: "Interested in monthly tiffin service.",
            contact: "9876543210",
            status: "New",
          },
          {
            id: "2",
            customerName: "Priya Verma",
            message: "Do you offer dinner-only plans?",
            contact: "9988776655",
            status: "Contacted",
          },
        ];

        const reviews = messes.flatMap((m) =>
          (m.ratings || []).map((r) => ({
            messName: m.title,
            customer: r.studentId?.name || "Student",
            rating: r.stars,
            comment: r.comment,
            date: r.date,
          }))
        );

        setData({
          messes,
          inquiries: fakeInquiries,
          reviews,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ownerId]);

  /* ------------ HANDLERS ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mess?")) return;
    const res = await deleteMess(id);
    if (res.success) {
      setData((prev) => ({
        ...prev,
        messes: prev.messes.filter((m) => m._id !== id),
      }));
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!todaysSpecial.lunch && !todaysSpecial.dinner) {
      alert("Enter at least Lunch or Dinner");
      return;
    }

    await publishSpecial({
      messOwnerId: ownerId,
      lunch: todaysSpecial.lunch,
      dinner: todaysSpecial.dinner,
      imageUrl: imagePreview || "",
    });

    alert("Special Published!");
    setTodaysSpecial({ lunch: "", dinner: "", image: null });
    setImagePreview(null);
  };

  /* ------------ CHART DATA ---------------- */
  const chartData = data.messes.map((m) => ({
    name: m.title,
    subscribers: Math.floor(Math.random() * 50) + 5, // fake visualization
  }));

  /* ------------ RENDER BASED ON TABS ---------------- */
  const renderContent = () => {
    switch (activeTab) {
      case "subscribers":
        return (
          <div className="grid gap-4">
            {data.messes.map((mess) => (
              <div
                key={mess._id}
                className="bg-white p-5 rounded-xl shadow-md border border-emerald-100 flex items-center justify-between hover:shadow-xl transition"
              >
                <div>
                  <h4 className="text-xl font-bold text-emerald-800">{mess.title}</h4>
                  <p className="text-sm text-slate-600">
                    ₹{mess.price} • {mess.type || "Veg"}  
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(mess._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case "inquiries":
        return (
          <div className="grid gap-4">
            {data.inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white p-5 rounded-xl shadow-md border border-emerald-100"
              >
                <h4 className="font-semibold text-lg text-emerald-900">{inq.customerName}</h4>
                <p className="italic text-slate-600 my-2">"{inq.message}"</p>
                <p className="text-xs text-slate-400">📞 {inq.contact}</p>

                <button
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      inquiries: prev.inquiries.map((i) =>
                        i.id === inq.id ? { ...i, status: "Contacted" } : i
                      ),
                    }))
                  }
                  className={`mt-4 px-4 py-2 rounded-lg text-white text-xs font-semibold ${
                    inq.status === "New"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-emerald-300 cursor-not-allowed"
                  }`}
                >
                  {inq.status === "New" ? "Mark Contacted" : "Contacted"}
                </button>
              </div>
            ))}
          </div>
        );

      case "reviews":
        return (
          <div className="space-y-4">
            {data.reviews.map((r, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl shadow-md border border-emerald-100 hover:shadow-xl transition"
              >
                <h4 className="font-bold text-emerald-900">{r.customer}</h4>
                <p className="text-sm my-1">⭐ {r.rating}/5</p>
                <p className="italic text-slate-700">"{r.comment}"</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(r.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        );

      case "special":
        return (
          <form
            onSubmit={handlePublish}
            className="bg-white p-8 rounded-xl shadow-xl border border-emerald-200 max-w-xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <FaUtensils /> Publish Today's Special
            </h3>

            <input
              type="text"
              placeholder="Lunch Special"
              value={todaysSpecial.lunch}
              onChange={(e) =>
                setTodaysSpecial({ ...todaysSpecial, lunch: e.target.value })
              }
              className="w-full p-3 border border-emerald-300 rounded-xl mb-4"
            />

            <input
              type="text"
              placeholder="Dinner Special"
              value={todaysSpecial.dinner}
              onChange={(e) =>
                setTodaysSpecial({ ...todaysSpecial, dinner: e.target.value })
              }
              className="w-full p-3 border border-emerald-300 rounded-xl mb-4"
            />

            <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow hover:bg-emerald-700">
              Publish
            </button>
          </form>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  /* -------------- DASHBOARD UI ------------------ */
  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl text-emerald-600">
        Loading Dashboard…
      </div>
    );

  const avgRating =
    data.reviews.length > 0
      ? (
          data.reviews.reduce((a, b) => a + b.rating, 0) / data.reviews.length
        ).toFixed(1)
      : "0.0";

  const newInquiries = data.inquiries.filter((i) => i.status === "New").length;

  return (
    <AppLayout>
      <div className="pt-20 px-6 pb-6 w-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text">
              Mess Owner Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Manage your services professionally</p>
          </div>

          <Link
            to="/dashboard/add-mess"
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition font-semibold"
          >
            ➕ Add New Mess
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="My Messes"
            value={data.messes.length}
            subtitle="Total mess listings"
            icon={<FaUsers />}
            color="bg-emerald-500"
          />
          <StatCard
            title="New Inquiries"
            value={newInquiries}
            subtitle="Pending messages"
            icon={<FaEnvelopeOpenText />}
            color="bg-emerald-600"
          />
          <StatCard
            title="Average Rating"
            value={`${avgRating} ★`}
            subtitle={`${data.reviews.length} reviews`}
            icon={<FaStar />}
            color="bg-emerald-400"
          />
        </div>

        {/* Chart */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg mb-10 border border-emerald-100">
          <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <FaChartBar /> Subscription Insights
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="subscribers" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-xl p-6 border border-emerald-100">
          <div className="flex space-x-1 mb-6 border-b border-emerald-100">
            <TabButton active={activeTab === "subscribers"} onClick={() => setActiveTab("subscribers")}>
              Listings
            </TabButton>
            <TabButton
              active={activeTab === "inquiries"}
              onClick={() => setActiveTab("inquiries")}
              badge={newInquiries}
            >
              Inquiries
            </TabButton>
            <TabButton active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")}>
              Reviews
            </TabButton>
            <TabButton active={activeTab === "special"} onClick={() => setActiveTab("special")}>
              Today's Special
            </TabButton>
          </div>

          {renderContent()}
        </div>

        <Footer />
      </div>
    </AppLayout>
  );
};

export default MessOwnerDashboard;
