// frontend/src/pages/profile/Profile.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getProfile, updateProfile } from "../../services/profileService";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [base, setBase] = useState({});
  const [roleData, setRoleData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // YouTube-Layout Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const loadData = async () => {
    const res = await getProfile();
    setBase(res.user);
    setRoleData(res.roleData || {});
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: base.name,
        phone: base.phone,
        roleData,
      });
      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "tenant":
        return "bg-blue-100 text-blue-800";
      case "pgowner":
        return "bg-purple-100 text-purple-800";
      case "messowner":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "tenant":
        return "Tenant";
      case "pgowner":
        return "PG Owner";
      case "messowner":
        return "Mess Owner";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* 🔵 HEADER */}
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* 🔵 LAYOUT: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">

        {/* 🔵 SIDEBAR BELOW HEADER */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* 🔵 CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 w-full overflow-y-auto">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            
            {/* Profile Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 flex items-center gap-6">
              
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white">
                  {base.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>

              {/* User details */}
              <div className="text-white flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {base.name || "User"}
                </h2>

                <p className="text-blue-100 mb-3">{base.email}</p>

                <span
                  className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                    base.role
                  )}`}
                >
                  {getRoleLabel(base.role)}
                </span>
              </div>
            </div>

            {/* FORM CONTENT */}
            <form onSubmit={onSubmit} className="p-8">

              {/* Basic Info */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      disabled={!editMode}
                      value={base.name || ""}
                      onChange={(e) =>
                        setBase({ ...base, name: e.target.value })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl ${
                        editMode
                          ? "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      disabled
                      value={base.email || ""}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
                    />
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      disabled={!editMode}
                      value={base.phone || ""}
                      onChange={(e) =>
                        setBase({ ...base, phone: e.target.value })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl ${
                        editMode
                          ? "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Sections */}
              {base.role === "tenant" && (
                <div className="border-t-2 border-gray-100 pt-8">

                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor">
                      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900">
                      Tenant Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profession */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profession
                      </label>
                      <input
                        disabled
                        value={roleData.professionType || ""}
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        disabled={!editMode}
                        value={roleData.city || ""}
                        onChange={(e) =>
                          setRoleData({ ...roleData, city: e.target.value })
                        }
                        className={`w-full px-4 py-3 border rounded-xl ${
                          editMode
                            ? "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PG OWNER */}
              {base.role === "pgowner" && (
                <div className="border-t pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900">
                      PG Owner Details
                    </h3>
                  </div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PG Name
                  </label>
                  <input
                    disabled={!editMode}
                    value={roleData.pgName || ""}
                    onChange={(e) =>
                      setRoleData({ ...roleData, pgName: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl ${
                      editMode
                        ? "border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              )}

              {/* MESS OWNER */}
              {base.role === "messowner" && (
                <div className="border-t pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900">
                      Mess Owner Details
                    </h3>
                  </div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mess Name
                  </label>
                  <input
                    disabled={!editMode}
                    value={roleData.messName || ""}
                    onChange={(e) =>
                      setRoleData({ ...roleData, messName: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl ${
                      editMode
                        ? "border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-10 pt-6 border-t">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center gap-2 shadow-md hover:scale-105 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl flex items-center gap-2 shadow-md hover:scale-105 transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEditMode(false);
                        loadData();
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </main>

        {/* FOOTER */}
        
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
