import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col w-full h-full overflow-hidden font-sans">

      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex flex-row flex-1 w-full h-full overflow-hidden">

        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 w-full overflow-y-auto custom-scrollbar">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
