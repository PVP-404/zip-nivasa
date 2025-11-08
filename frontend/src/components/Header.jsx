// frontend/src/components/Header.jsx
import React from "react";

const Header = () => {

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Zip Nivasa</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
