// frontend/src/pages/tenant/Complaints.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const statusBadge = (s) => {
  const map = {
    Open: "bg-yellow-100 text-yellow-800",
    "In-progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };
  return map[s] || "bg-gray-100 text-gray-700";
};

const Complaints = () => {
  const [list, setList] = useState([]);
  const [category, setCategory] = useState("Water");
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/complaints/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setList(data.complaints || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async () => {
    if (!message.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, message, room }),
      });
      if (!res.ok) throw new Error();
      setCategory("Water");
      setMessage("");
      setRoom("");
      fetchComplaints();
      alert("Complaint submitted");
    } catch {
      alert("Failed to submit complaint");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="max-w-7xl mx-auto w-full px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Support & Complaints</h1>
            <p className="text-gray-600">Raise and track maintenance requests</p>
          </div>

          <section className="bg-white border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create a Request</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-700">Category</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Water</option>
                  <option>Cleaning</option>
                  <option>Wi-Fi</option>
                  <option>Electricity</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Room/Bed</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. A-204 / Bed 2"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-gray-700">Describe the issue</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 h-28"
                  placeholder="Explain the problem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={submitComplaint}
              className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-lg"
            >
              Submit
            </button>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Your Requests</h2>
            {loading ? (
              <div className="py-10 text-gray-500">Loading...</div>
            ) : list.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-gray-600">
                No requests yet
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {list.map((c) => (
                  <div key={c._id} className="bg-white border rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{c.category}</h3>
                        <p className="text-gray-500 text-sm">{c.room || "—"}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700">{c.message}</p>
                    {c.ownerNote && (
                      <p className="mt-2 text-sm text-gray-500">
                        Owner note: {c.ownerNote}
                      </p>
                    )}
                    <div className="mt-4 text-xs text-gray-500">
                      Created: {new Date(c.createdAt).toLocaleString()}
                      {c.updatedAt && ` • Updated: ${new Date(c.updatedAt).toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Complaints;
