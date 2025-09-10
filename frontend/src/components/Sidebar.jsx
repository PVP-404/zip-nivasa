// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";

const Sidebar = ({ role = "student" }) => {
  // Define role-based menu with a richer set of icons and labels
  const menus = {
    student: [
      { to: "/student/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/services/mess", icon: <FaUtensils />, label: "My Mess" },
      { to: "/services/pg", icon: <FaBuilding />, label: "Find PG/Hostel" },
      { to: "/services/history", icon: <FaHistory />, label: "History" },
    ],
    migrant: [
      { to: "/migrant/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/services/pg", icon: <FaBuilding />, label: "Find Housing" },
      { to: "/services/jobs", icon: <FaBriefcase />, label: "Job Board" },
      { to: "/services/history", icon: <FaHistory />, label: "History" },
    ],
    messowner: [
      { to: "/messowner/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { to: "/manage/menu", icon: <FaUtensils />, label: "Manage Menu" },
      { to: "/manage/subscribers", icon: <FaUsers />, label: "Subscribers" },
      { to: "/services/payments", icon: <FaRupeeSign />, label: "Payments" },
    ],
  };

  const menuItems = menus[role] || menus.student;

  return (
    <aside className="w-64 h-screen bg-gray-900 text-gray-100 shadow-2xl p-6 sticky top-0 flex flex-col">
      {/* Logo/Brand Name */}
      <div className="mb-8">
        <Link to="/" className="text-2xl font-extrabold text-white">
          Zip <span className="text-blue-500">Nivasa</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.to}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Support and User Profile Section */}
      <div className="mt-auto pt-6 border-t border-gray-700">
        <Link
          to="/contact"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition duration-200"
        >
          <FaPhoneAlt />
          <span>Support</span>
        </Link>
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-gray-800">
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-lg font-bold">
            SN
          </div>
          <div className="text-sm">
            <h4 className="font-medium text-white">Student Name</h4>
            <p className="text-gray-400">Student ID #12345</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;