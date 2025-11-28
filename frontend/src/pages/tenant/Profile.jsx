// frontend/src/pages/tenant/Profile.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [collegeId, setCollegeId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchMe = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setMsg({ type: "success", text: "Profile updated" });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const uploadKYC = async (e) => {
    e.preventDefault();
    if (!aadhaar && !collegeId) return;
    try {
      const fd = new FormData();
      if (aadhaar) fd.append("aadhaar", aadhaar);
      if (collegeId) fd.append("collegeId", collegeId);

      const res = await fetch("http://localhost:5000/api/auth/kyc", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("KYC upload failed");
      setMsg({ type: "success", text: "KYC uploaded" });
      setAadhaar(null);
      setCollegeId(null);
      fetchMe();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="max-w-5xl mx-auto w-full px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile & KYC</h1>
            <p className="text-gray-600">Keep your info up to date</p>
          </div>

          {msg && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left - Profile Card */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-700">
                    {user.name?.[0] || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                <p>Email: <span className="font-medium">{user.email}</span></p>
                {user.phone && <p>Phone: <span className="font-medium">{user.phone}</span></p>}
              </div>
            </div>

            {/* Middle - Edit Form */}
            <form onSubmit={saveProfile} className="bg-white border rounded-xl p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">Full Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={user.name || ""}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Phone</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={user.phone || ""}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Emergency Contact</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={user.emergencyContact || ""}
                    onChange={(e) =>
                      setUser({ ...user, emergencyContact: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Email</label>
                  <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={user.email} disabled />
                </div>
              </div>
              <button
                disabled={saving}
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* KYC */}
          <section className="bg-white border rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">KYC Documents</h2>
            <form onSubmit={uploadKYC} className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-gray-700">Aadhaar (PDF/JPG/PNG)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="w-full border rounded-lg px-3 py-2"
                  onChange={(e) => setAadhaar(e.target.files[0])}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">College ID (PDF/JPG/PNG)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="w-full border rounded-lg px-3 py-2"
                  onChange={(e) => setCollegeId(e.target.files[0])}
                />
              </div>
              <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg">
                Upload
              </button>
            </form>

            {/* Existing KYC (if backend returns links) */}
            {user.kyc?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Uploaded Documents</h3>
                <div className="flex flex-wrap gap-3">
                  {user.kyc.map((doc, i) => (
                    <a
                      key={i}
                      href={`http://localhost:5000${doc.path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm"
                    >
                      {doc.type.toUpperCase()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
