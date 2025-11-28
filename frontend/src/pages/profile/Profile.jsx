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
      case "tenant": return "bg-blue-100 text-blue-800";
      case "pgowner": return "bg-purple-100 text-purple-800";
      case "messowner": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "tenant": return "Tenant";
      case "pgowner": return "PG Owner";
      case "messowner": return "Mess Owner";
      default: return role;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>

      {/* Main Content Area with left margin for fixed sidebar */}
      <div className="flex-1 ml-64">
        <Header />

        <main className="max-w-5xl mx-auto p-8 pb-24">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            {/* Profile Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 relative">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white">
                    {base.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {editMode && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-white">
                  <h2 className="text-2xl font-bold mb-2">{base.name || "User"}</h2>
                  <p className="text-blue-100 mb-3">{base.email}</p>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(base.role)}`}>
                    {getRoleLabel(base.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={onSubmit} className="p-8">
              {/* Basic Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      disabled={!editMode}
                      value={base.name || ""}
                      onChange={(e) => setBase({ ...base, name: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        editMode 
                          ? "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      } outline-none`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input 
                        value={base.email || ""} 
                        disabled 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 outline-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div className="group md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      disabled={!editMode}
                      value={base.phone || ""}
                      onChange={(e) => setBase({ ...base, phone: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        editMode 
                          ? "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      } outline-none`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Details */}
              {base.role === "tenant" && (
                <div className="border-t-2 border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900">Tenant Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Profession</label>
                      <input
                        disabled
                        value={roleData.professionType || ""}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        disabled={!editMode}
                        value={roleData.city || ""}
                        onChange={(e) => setRoleData({ ...roleData, city: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          editMode 
                            ? "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white" 
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        } outline-none`}
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>
                </div>
              )}

              {base.role === "pgowner" && (
                <div className="border-t-2 border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900">PG Owner Details</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PG Name</label>
                    <input
                      disabled={!editMode}
                      value={roleData.pgName || ""}
                      onChange={(e) => setRoleData({ ...roleData, pgName: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        editMode 
                          ? "border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      } outline-none`}
                      placeholder="Enter your PG name"
                    />
                  </div>
                </div>
              )}

              {base.role === "messowner" && (
                <div className="border-t-2 border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900">Mess Owner Details</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mess Name</label>
                    <input
                      disabled={!editMode}
                      value={roleData.messName || ""}
                      onChange={(e) => setRoleData({ ...roleData, messName: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        editMode 
                          ? "border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      } outline-none`}
                      placeholder="Enter your mess name"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        loadData();
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Profile;