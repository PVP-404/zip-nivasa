// ✅ frontend/src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get logged-in role
  const role = localStorage.getItem("role") || "tenant";

  const [open, setOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  // ✅ Update active menu on page change
  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => activeMenu === path;

  // ✅ ROLE-BASED MENUS
  const menus = {
    tenant: [
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 
            1.414L4 10.414V17a1 1 0 001 1h2a1 
            1 0 001-1v-2a1 1 0 011-1h2a1 
            1 0 011 1v2a1 1 0 001 1h2a1 
            1 0 001-1v-6.586l.293.293a1 
            1 0 001.414-1.414l-7-7z" />
          </svg>
        ),
        label: "Dashboard",
        path: "/dashboard/student",
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 
            2 0 012 2v12a1 1 0 110 2h-3a1 
            1 0 01-1-1v-2a1 1 0 00-1-1H9a1 
            1 0 00-1 1v2a1 1 0 01-1 
            1H4a1 1 0 110-2V4zm3 
            1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 
            4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        ),
        label: "Find PGs",
        path: "/services/pgs",
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 
            1.222a.997.997 0 00.01.042l1.358 
            5.43-.893.892C3.74 11.846 4.632 
            14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 
            1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 
            1 0 005 1H3z" />
          </svg>
        ),
        label: "Mess",
        path: "/services/mess",
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 
            1 0 110 2H4a1 1 0 01-1-1zm0 
            4a1 1 0 011-1h12a1 1 0 110 
            2H4a1 1 0 01-1-1zm0 
            4a1 1 0 011-1h12a1 1 0 110 
            2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        label: "Laundry",
        path: "/services/laundry",
      },
    ],

    pgowner: [
      {
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 
          00-1.414 0l-7 7a1 1 0 
          001.414 1.414L4 10.414V17a1 
          1 0 001 1h2a1 1 0 
          001-1v-2a1 1 0 011-1h2a1 
          1 0 011 1v2a1 1 0 
          001 1h2a1 1 0 
          001-1v-6.586l.293.293a1 
          1 0 001.414-1.414l-7-7z"/>
        </svg>,
        label: "Dashboard",
        path: "/dashboard/pgowner",
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 
            011 1v3h3a1 1 0 110 
            2h-3v3a1 1 0 
            11-2 0v-3H6a1 1 0 
            110-2h3V6a1 
            1 0 011-1z" clipRule="evenodd" />
          </svg>
        ),
        label: "Add PG",
        path: "/dashboard/add-listing",
      },
    ],

    messowner: [
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 
            00-1.414 0l-7 7a1 1 0 
            001.414 1.414L4 
            10.414V17a1 1 0 
            001 1h2a1 1 0 
            001-1v-2a1 1 
            0 011-1h2a1 1 
            0 011 1v2a1 
            1 0 001 1h2a1 
            1 0 001-1v-6.586l.293.293a1 
            1 0 001.414-1.414l-7-7z"/>
          </svg>
        ),
        label: "Dashboard",
        path: "/dashboard/messowner",
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 
            0 011 1v3h3a1 1 0 
            110 2h-3v3a1 1 
            0 11-2 0v-3H6a1 1 
            0 110-2h3V6a1 
            1 0 011-1z" />
          </svg>
        ),
        label: "Add Mess",
        path: "/dashboard/add-mess",
      },
    ],

    laundry: [
      {
        icon: (
          <svg className="w-5 h-5" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 
            00-1.414 0l-7 7a1 1 0 
            001.414 1.414L4 10.414V17a1 
            1 0 
            001 1h2a1 1 0 
            001-1v-2a1 1 0 
            011-1h2a1 1 0 
            011 1v2a1 1 0 
            001 1h2a1 1 0 
            001-1v-6.586l.293.293a1 
            1 0 
            001.414-1.414l-7-7z" />
          </svg>
        ),
        label: "Dashboard",
        path: "/dashboard/laundry",
      },
    ],
  };

  // ✅ Navigation handler
  const handleNavigation = (path) => {
    setActiveMenu(path);
    navigate(path);
  };

  return (
    <aside
      className={`bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl h-screen transition-all duration-300 ease-in-out 
        ${open ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-indigo-700/50">
        <div className="flex items-center justify-between">

          {open && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-white font-bold text-lg">Menu</span>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setOpen(!open)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 ml-auto"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="currentColor">
              <path 
                fillRule="evenodd" 
                d="M3 5a1 1 0 011-1h12a1 1 
                0 110 2H4a1 1 0 
                01-1-1zM3 10a1 1 0 
                011-1h12a1 1 0 
                110 2H4a1 1 0 
                01-1-1zM3 15a1 1 0 
                011-1h12a1 1 0 
                110 2H4a1 1 0 
                01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ✅ Navigation Menu */}
      <nav className="mt-4 px-3 space-y-1">
        {menus[role]?.map((menu, index) => {
          const active = isActive(menu.path);

          return (
            <button
              key={index}
              onClick={() => handleNavigation(menu.path)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                active
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-indigo-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-r-full"></div>
              )}

              {/* Icon */}
              <span className={`text-xl transition-transform duration-200 ${
                active ? "scale-110" : "group-hover:scale-110"
              }`}>
                {menu.icon}
              </span>

              {/* Label */}
              {open && (
                <span className={`font-medium transition-all duration-300`}>
                  {menu.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {/* {open && (
        <div className="absolute bottom-4 left-0 right-0 px-6 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
            <p className="text-xs text-indigo-200 text-center">
              Zip Nivasa v1.0
            </p>
          </div>
        </div>
      )} */}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
