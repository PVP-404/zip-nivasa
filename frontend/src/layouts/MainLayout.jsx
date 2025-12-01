import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* BODY: Sidebar + Page */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* PAGE CONTENT */}
        <main
          className={`flex-1 transition-all duration-300 px-4 py-6
          ${isSidebarOpen ? "ml-64" : "ml-20"}
          `}
        >
          {children}
        </main>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default MainLayout;
