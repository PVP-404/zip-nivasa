// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUtensils,
  FaHome,
  FaHistory,
  FaPhoneAlt,
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaRupeeSign,
  FaBed,
} from "react-icons/fa";

const Sidebar = ({ role = "pgowner", user = { name: "Guest User", id: "#0000" } }) => {
  const location = useLocation();

  // Role-based menus
  const menus = {
    tenant: [
      { to: "/tenant/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/services/mess", icon: <FaUtensils />, label: "Find Mess" },
      { to: "/services/pg", icon: <FaBuilding />, label: "Find PG / Flats" },
      { to: "/services/history", icon: <FaHistory />, label: "My History" },
    ],
    pgowner: [
      { to: "/pgowner/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/pgowner/listings", icon: <FaBed />, label: "Manage Rooms/Flats" },
      { to: "/pgowner/tenants", icon: <FaUsers />, label: "Tenants" },
      { to: "/pgowner/payments", icon: <FaRupeeSign />, label: "Payments" },
    ],
    messowner: [
      { to: "/messowner/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/messowner/menu", icon: <FaUtensils />, label: "Manage Menu" },
      { to: "/messowner/subscribers", icon: <FaUsers />, label: "Subscribers" },
      { to: "/messowner/payments", icon: <FaRupeeSign />, label: "Payments" },
    ],
  };

  const menuItems = menus[role] || [];

  // Get user initials
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 shadow-xl sticky top-0 flex flex-col">
      {/* Brand Logo */}
      <div className="mb-8 px-6 py-4 border-b border-gray-700">
        <Link to="/" className="text-2xl font-extrabold text-white tracking-wide">
          Zip <span className="text-blue-500">Nivasa</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow px-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <li key={index}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Support + User Profile */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <Link
          to="/contact"
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition duration-200"
        >
          <FaPhoneAlt />
          <span>Support</span>
        </Link>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
          <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold">
            {getInitials(user.name)}
          </div>
          <div className="text-sm">
            <h4 className="font-medium text-white">{user.name}</h4>
            <p className="text-gray-400 capitalize">{role} • {user.id}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
