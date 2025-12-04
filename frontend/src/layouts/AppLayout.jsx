// frontend/src/layouts/AppLayout.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const AppLayout = ({ children }) => {
  // ❗ Sidebar CLOSED by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col w-full h-full overflow-hidden font-sans">

      {/* HEADER - always on top */}
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* BODY: Sidebar + Content */}
      <div className="flex flex-row flex-1 w-full h-full overflow-hidden">

        {/* SIDEBAR BELOW HEADER */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full overflow-y-auto custom-scrollbar">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
