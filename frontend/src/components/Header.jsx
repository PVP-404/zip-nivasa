// ✅ frontend/src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Header = () => {
  const navigate = useNavigate(); 
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Get Real Logged-in User
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    

    <header className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 shadow-2xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">

      {/* ✅ Logo + Title */}
      <div className="flex items-center gap-3">
        
        <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight cursor-pointer hover:scale-105 transition-transform duration-200">
          Zip Nivasa
          <span className="block text-xs font-normal text-indigo-200 tracking-wider mt-0.5">
            Find. Connect. Live Better.
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-4">

        {/* ✅ USER CARD */}
        <div
          className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 hover:bg-white/15 transition-all duration-300 cursor-pointer shadow-lg"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex items-center gap-3">
            {/* ✅ Avatar */}
            <div className="relative">
              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-700"></div>
            </div>

            {/* ✅ Username + Role */}
            <div className="text-left">
              <p className="text-sm font-bold text-white capitalize flex items-center gap-2">
                {username}
                <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                     fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0
                    111.414 1.414l-4 4a1 1 0
                    01-1.414 0l-4-4a1 1 0
                    010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </p>
              <p className="text-xs font-medium text-indigo-200 capitalize">
                {role}
              </p>
            </div>
          </div>

          {/* ✅ DROPDOWN MENU */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
              {/* Dropdown Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <p className="text-sm font-bold text-gray-800 capitalize">{username}</p>
                <p className="text-xs text-gray-600 capitalize">{role}</p>
              </div>

              {/* Dropdown Buttons */}
              <div className="p-2">
                

                <button onClick={() => navigate("/tenant/profile")} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition flex items-center gap-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66
                    0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3
                    1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99
                    4-3.08 6-3.08 1.99 0 5.97 1.09
                    6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  Profile Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-3 font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0
                      00-1 1v12a1 1 0 102 0V4a1 1 0
                      00-1-1zm10.293 9.293a1 1 0
                      001.414 1.414l3-3a1 1 0
                      000-1.414l-3-3a1 1 0
                      10-1.414 1.414L14.586 9H7a1 1 0
                      100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign Out
                </button>

              </div>
            </div>
          )}
        </div>

        {/* ✅ Quick Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all duration-300 ease-in-out shadow-lg flex items-center gap-2 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0
              00-1 1v12a1 1 0
              102 0V4a1 1 0
              00-1-1zm10.293 9.293a1 1 0
              001.414 1.414l3-3a1 1 0
              000-1.414l-3-3a1 1 0
              10-1.414 1.414L14.586 9H7a1 1 0
              100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          Logout
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

    </header>
  );
};

export default Header;
