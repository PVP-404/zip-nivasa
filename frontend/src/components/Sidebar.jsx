import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHistory,
  FaPhoneAlt,
  FaAngleRight // For "Manage Service" arrow
} from "react-icons/fa";

const Sidebar = ({ role = "tenant", user = { name: "Student User", id: "#0000" }, subscriptions = [] }) => {
  const location = useLocation();

  // No specific menus object needed as we're directly listing History and Subscriptions
  // If role isn't tenant, it will just show support (or nothing if you prefer)

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 shadow-xl sticky top-0 flex flex-col">
      {/* Brand Logo */}
      <div className="mb-8 px-6 py-4 border-b border-gray-700">
        <Link to="/" className="text-2xl font-extrabold text-white tracking-wide">
          Zip <span className="text-blue-500">Nivasa</span>
        </Link>
      </div>

      {/* Navigation Links and Subscriptions */}
      <nav className="flex-grow px-4">
        {/* History Link */}
        {role === "tenant" && (
          <div className="mb-6"> {/* Added margin bottom for spacing */}
            <Link
              to="/services/history"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                location.pathname.startsWith("/services/history")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="text-lg"><FaHistory /></span>
              <span>My History</span>
            </Link>
          </div>
        )}

        {/* Subscriptions Section */}
        {role === "tenant" && subscriptions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 px-2">Your Subscriptions</h3>
            <ul className="space-y-2">
              {subscriptions.map((sub, index) => (
                <li key={index}>
                  <Link
                    to={sub.manageLink}
                    className="block p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-white text-sm">{sub.providerName}</h5>
                      <FaAngleRight className="text-gray-400 text-sm" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{sub.serviceType} • {sub.info}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
         {role === "tenant" && subscriptions.length === 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700 px-4 text-gray-400 text-sm italic">
            No active subscriptions.
          </div>
        )}
      </nav>

      {/* Support Button (at the very bottom) */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <Link
          to="/contact"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition duration-200 justify-center"
        >
          <FaPhoneAlt />
          <span>Support</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;