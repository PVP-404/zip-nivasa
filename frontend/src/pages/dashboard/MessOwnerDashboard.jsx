import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AppLayout from "../../layouts/AppLayout";

import {
  getMessesByOwner,
  publishSpecial,
  updateMess,
  deleteMess,
} from "../../services/messService";

import { getAllMessOwners } from "../../services/messOwnerService";

import { FaUsers, FaEnvelopeOpenText, FaStar, FaUtensils, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLink } from "react-icons/fa";

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-emerald-600 font-medium text-sm mb-2 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-slate-900 text-3xl font-extrabold">{value}</p>
        <p className="text-slate-400 text-xs mt-2">{subtitle}</p>
      </div>
      <div className={`${color} p-3 rounded-full text-white shadow-md`}>
        {icon}
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={`relative py-3 px-6 font-semibold text-sm transition-all whitespace-nowrap rounded-t-lg ${
      active
        ? "text-emerald-600 bg-white border-b-2 border-emerald-600 shadow-inner"
        : "text-slate-600 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-100"
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

const MessOwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [activeTab, setActiveTab] = useState("subscribers");

  const ownerId = localStorage.getItem("ownerId");

  const [data, setData] = useState({
    subscribers: [],
    inquiries: [],
    reviews: [],
  });

  const [todaysSpecial, setTodaysSpecial] = useState({
    lunch: "",
    dinner: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!ownerId) {
        setLoading(false);
        return;
      }

      try {
        const [messes, owners] = await Promise.all([
          getMessesByOwner(ownerId),
          getAllMessOwners(),
        ]);
        const ownerData = owners.find((o) => o.userId === ownerId);
        setOwner(ownerData);

        const subscribers = messes.map((m) => ({
          id: m._id,
          name: m.title || m.messName || "Unnamed Mess",
          location: m.location || "N/A",
          plan: `${m.type || "Veg"} • ₹${m.price || 0}`,
          status: "Active",
          joined: m.createdAt,
        }));

        const inquiries = [
          {
            id: "i1",
            customerName: "Priya Sharma",
            contact: "9876543210",
            status: "New",
            date: new Date(Date.now() - 86400000),
            message: "Looking for lunch subscription near your mess, 5-day plan.",
          },
          {
            id: "i2",
            customerName: "Rohan Verma",
            contact: "9988776655",
            status: "Contacted",
            date: new Date(Date.now() - 2 * 86400000),
            message: "Enquiring about your weekend meal package options.",
          },
        ];

        const reviews = messes.flatMap((mess) =>
          (mess.ratings || []).map((r) => ({
            id: r._id,
            messId: mess._id,
            messName: mess.title || mess.messName || "Unnamed Mess",
            customer: r.studentId?.name || "Student",
            rating: r.stars || 0,
            comment: r.comment || "",
            date: r.date || mess.createdAt,
          }))
        );

        setData({ subscribers, inquiries, reviews });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ownerId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTodaysSpecial({ ...todaysSpecial, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setTodaysSpecial({ ...todaysSpecial, image: null });
      setImagePreview(null);
    }
  };

  const handleSpecialSubmit = async (e) => {
    e.preventDefault();
    if (!todaysSpecial.lunch && !todaysSpecial.dinner) {
      alert("Please enter at least one menu item (Lunch or Dinner).");
      return;
    }

    try {
      const res = await publishSpecial({
        messOwnerId: ownerId,
        lunch: todaysSpecial.lunch,
        dinner: todaysSpecial.dinner,
        imageUrl: imagePreview || "",
      });

      if (res.success) {
        alert("Special Published!");
        setTodaysSpecial({ lunch: "", dinner: "", image: null });
        setImagePreview(null);
      } else {
        alert(res.message || "Failed to publish special.");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleDeleteMess = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this mess listing? This cannot be undone.")) return;

    try {
      const res = await deleteMess(id);
      if (res.success) {
        alert("Mess deleted successfully!");
        setData((prev) => ({
          ...prev,
          subscribers: prev.subscribers.filter((s) => s.id !== id),
        }));
      } else {
        alert(res.message || "Error deleting mess.");
      }
    } catch (err) {
      alert("Error deleting mess.");
    }
  };

  const handleEditMess = (mess) => {
    const newName = prompt("Enter new Mess Name:", mess.name);
    if (!newName) return;

    updateMess(mess.id, { title: newName }).then((res) => {
      if (res.success) {
        alert("Mess name updated successfully!");

        setData((prev) => ({
          ...prev,
          subscribers: prev.subscribers.map((m) =>
            m.id === mess.id ? { ...m, name: newName } : m
          ),
        }));
      } else {
        alert(res.message || "Error updating mess.");
      }
    }).catch(() => alert("Server error during update."));
  };

  const handleContacted = (inqId) => {
    setData((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((i) =>
        i.id === inqId ? { ...i, status: "Contacted" } : i
      ),
    }));
  };

  const avgRating =
    data.reviews.length > 0
      ? (
          data.reviews.reduce((sum, r) => sum + r.rating, 0) /
          data.reviews.length
        ).toFixed(1)
      : "0.0";

  const newInquiries = data.inquiries.filter((i) => i.status === "New").length;

  const renderContent = () => {
    switch (activeTab) {
      case "subscribers":
        return (
          <div className="grid gap-4">
            {data.subscribers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200">
                <FaUsers className="mx-auto w-10 h-10 text-emerald-300 mb-3" />
                <p className="font-semibold">No active mess listings found.</p>
                <p className="text-sm text-slate-400">Use the 'Add New Mess' button to get started.</p>
              </div>
            ) : (
              data.subscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white p-5 rounded-xl shadow-md border border-emerald-100 flex justify-between items-center transition duration-200 hover:shadow-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-slate-900 truncate">{sub.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <FaLink className="w-3 h-3 text-emerald-400" />
                      <span>{sub.plan}</span>
                      <span className="text-xs text-slate-400 ml-3">| Listed at: {sub.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {sub.status}
                    </span>
                    <button
                      onClick={() => handleEditMess(sub)}
                      title="Edit Mess Name"
                      className="p-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDeleteMess(sub.id)}
                      title="Delete Mess"
                      className="p-2 text-sm bg-emerald-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="h-10"></div>
          </div>
        );

      case "inquiries":
        return (
          <div className="grid gap-4">
            {data.inquiries.map((inq) => (
              <div
                key={inq.id}
                className={`p-5 rounded-xl shadow-md border transition-all duration-300 ${
                  inq.status === "New"
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-white border-emerald-100"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{inq.customerName}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed italic">
                      "{inq.message}"
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium min-w-[80px] text-center shadow-sm ${
                      inq.status === "New"
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-emerald-100 mt-2">
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <FaEnvelopeOpenText className="w-3 h-3" /> {inq.contact}
                  </p>
                  {inq.status === "New" && (
                    <button
                      onClick={() => handleContacted(inq.id)}
                      className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                    >
                      Mark Contacted
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="h-10"></div>
          </div>
        );

      case "reviews":
        const StarRating = ({ rating }) => (
          <span className="text-emerald-400 font-bold text-lg">
            {Array(rating).fill("★").join("")}
            {Array(5 - rating).fill("☆").join("")}
          </span>
        );
        return (
          <div className="grid gap-4">
            {data.reviews.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200">
                <FaStar className="mx-auto w-10 h-10 text-emerald-300 mb-3" />
                <p className="font-semibold">No reviews yet.</p>
                <p className="text-sm text-slate-400">Your customers' ratings will appear here.</p>
              </div>
            ) : (
              data.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-base">
                        {rev.customer}
                      </h4>
                      <p className="text-xs text-slate-500">
                        For mess: <span className="font-medium">{rev.messName}</span>
                      </p>
                    </div>
                    <StarRating rating={rev.rating} />
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed border-b pb-3 mb-3 italic">
                    "{rev.comment}"
                  </p>
                  <p className="text-xs text-slate-400">
                    Reviewed on {new Date(rev.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
            <div className="h-10"></div>
          </div>
        );

      case "special":
        return (
          <form
            onSubmit={handleSpecialSubmit}
            className="bg-white p-8 rounded-xl shadow-2xl border border-emerald-100 max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <FaUtensils className="text-emerald-600" /> Publish Today's Special Menu
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  🍽️ Lunch Special (e.g., Dal, Roti, Rice, Veg Curry)
                </label>
                <input
                  type="text"
                  placeholder="Enter the main items for lunch"
                  value={todaysSpecial.lunch}
                  onChange={(e) =>
                    setTodaysSpecial({ ...todaysSpecial, lunch: e.target.value })
                  }
                  className="w-full border border-emerald-300 p-3 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  🍛 Dinner Special (e.g., Paneer, Naan, Salad, Sweet)
                </label>
                <input
                  type="text"
                  placeholder="Enter the main items for dinner"
                  value={todaysSpecial.dinner}
                  onChange={(e) =>
                    setTodaysSpecial({ ...todaysSpecial, dinner: e.target.value })
                  }
                  className="w-full border border-emerald-300 p-3 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
                />
              </div>

              <div className="border-t pt-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  📸 Upload Special Dish Image (Optional)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />

                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md"
                  >
                    {todaysSpecial.image ? "Change Image" : "Choose Image"}
                  </label>

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Special Preview"
                        className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-400 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setTodaysSpecial({ ...todaysSpecial, image: null });
                          setImagePreview(null);
                          document.getElementById('image-upload').value = '';
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center shadow-lg"
                      >
                        <FaTimesCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No image selected</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Publish Special Menu
            </button>
            <div className="h-10"></div>
          </form>
        );

      default:
        return (
          <div className="text-center py-10 text-slate-500 bg-emerald-50/50 rounded-xl">
            <FaUtensils className="mx-auto w-10 h-10 text-emerald-300 mb-3" />
            <p className="font-semibold">Select a tab to view content.</p>
          </div>
        );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-emerald-50/50">
        <div className="text-xl font-semibold text-emerald-600">Loading Dashboard...</div>
      </div>
    );

  return (
    <AppLayout>
      <div className="pt-20 px-6 pb-6 w-full">
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-emerald-100">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text">
              {owner ? owner.messName : "Mess Owner Dashboard"}
            </h1>
            <p className="text-slate-500 mt-1 text-base">
              {owner
                ? `📍 ${owner.messLocation || "Unknown"} • ${owner.messType || "N/A"}`
                : "Manage your services and grow your business."}
            </p>
          </div>

          <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition font-semibold">
            ➕ Add New Mess
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 w-full">
          <StatCard
            title="My Messes"
            value={data.subscribers.length}
            color="bg-emerald-500"
            subtitle="Active customers"
            icon={<FaUsers className="w-5 h-5" />}
          />
          <StatCard
            title="New Inquiries"
            value={newInquiries}
            color="bg-emerald-600"
            subtitle="Pending responses"
            icon={<FaEnvelopeOpenText className="w-5 h-5" />}
          />
          <StatCard
            title="Average Rating"
            value={`${avgRating} ★`}
            color="bg-emerald-400"
            subtitle={`${data.reviews.length} total reviews`}
            icon={<FaStar className="w-5 h-5" />}
          />
        </div>

        <div className="mt-10 bg-white rounded-xl shadow-2xl p-6 border border-emerald-100 w-full">
          <div className="flex space-x-1 border-b mb-6 -mt-6 -mx-6 px-6 pt-6 border-emerald-100">
            <TabButton active={activeTab === "subscribers"} onClick={() => setActiveTab("subscribers")}>
              Listings & Subscribers
            </TabButton>
            <TabButton active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")} badge={newInquiries}>
              Inquiries
            </TabButton>
            <TabButton active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")}>
              Reviews
            </TabButton>
            <TabButton active={activeTab === "special"} onClick={() => setActiveTab("special")}>
              Today's Special
            </TabButton>
          </div>

          <div className="py-4 w-full">{renderContent()}</div>
        </div>

        <Footer />
      </div>
    </AppLayout>
  );
};

export default MessOwnerDashboard;
