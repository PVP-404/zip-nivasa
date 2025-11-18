// ✅ frontend/src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") || "tenant";

  const [open, setOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => activeMenu === path;

  // ✅ REUSABLE ICON COMPONENT
  const Icon = ({ d }) => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );

  // ✅ Navigation Menus (ONLY ICON PATHS UPDATED)
  const menus = {
    tenant: [
      { icon: <Icon d="M3 3h18v18H3V3zm2 2v14h14V5H5z" />, label: "Dashboard", path: "/dashboard/student" },
      { icon: <Icon d="M12 2l9 4v6c0 5-4 9-9 9s-9-4-9-9V6l9-4z" />, label: "Explore PGs", path: "/pgs/all" },
      // { icon: <Icon d="M8 7V3h8v4m-9 4h10v10H7V11z" />, label: "My Bookings", path: "/student/bookings" },
      // { icon: <Icon d="M3 8h18M5 12h14M5 16h14" />, label: "Payments", path: "/student/payments" },
      // { icon: <Icon d="M12 2l7 6v12H5V8l7-6z" />, label: "Complaints", path: "/student/complaints" },
      { icon: <Icon d="M4 6h16M4 12h16M4 18h16" />, label: "Mess", path: "/messes" },
      { icon: <Icon d="M4 4h16v16H4z" />, label: "Laundry", path: "/services/laundry" },
      { icon: <Icon d="M4 6l8 8 8-8" />, label: "Wishlist", path: "/student/wishlist" },
      { icon: <Icon d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z" />, label: "Profile", path: "/tenant/profile" },
      { icon: <Icon d="M4 4h16v16H4z" />, label: "Messages", path: "/messages" },
    ],

    pgowner: [
      { icon: <Icon d="M12 3l7 6v12H5V9l7-6z" />, label: "Dashboard", path: "/dashboard/pgowner" },
      { icon: <Icon d="M12 5v6m0 0h6m-6 0H6" />, label: "Add PG", path: "/dashboard/add-listing" },
      { icon: <Icon d="M4 4h16v16H4z" />, label: "Messages", path: "/messages" },
    ],

    messowner: [
      { icon: <Icon d="M12 3l7 6v12H5V9l7-6z" />, label: "Dashboard", path: "/dashboard/messowner" },
      { icon: <Icon d="M12 5v6m0 0h6m-6 0H6" />, label: "Add Mess", path: "/dashboard/add-mess" },
      { icon: <Icon d="M4 4h16v16H4z" />, label: "Messages", path: "/messages" },
    ],

    laundry: [
      { icon: <Icon d="M12 3l7 6v12H5V9l7-6z" />, label: "Dashboard", path: "/dashboard/laundry" },
    ],
  };

  const handleNavigation = (path) => {
    setActiveMenu(path);
    navigate(path);
  };

  return (
    <aside
      className={`bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl h-screen transition-all duration-300 
      ${open ? "w-64" : "w-20"}`}
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

          <button
            onClick={() => setOpen(!open)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 ml-auto"
          >
            <Icon d="M3 6h18M3 12h18M3 18h18" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3 space-y-1">
        {menus[role]?.map((menu, index) => {
          const active = isActive(menu.path);
          return (
            <button
              key={index}
              onClick={() => handleNavigation(menu.path)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                active
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-indigo-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-r-full"></div>
              )}
              <span className="text-xl">{menu.icon}</span>
              {open && <span className="font-medium">{menu.label}</span>}
            </button>
          );
        })}
      </nav>

      
    </aside>
  );
};

export default Sidebar;
