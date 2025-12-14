import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ICON_PATHS = {
  dashboard:
    "M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z",
  pg: "M4 10l8-6 8 6v8a2 2 0 01-2 2h-4v-5H10v5H6a2 2 0 01-2-2v-8z",
  mess:
    "M4 6h16v2H4V6zm2 4h12l-1 8H7l-1-8zM9 3h6v2H9V3z",
  laundry:
    "M5 3h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zm1 3h12V5H6v1zm2.5 4a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z",
  wishlist:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 016.5 4A5 5 0 0112 6a5 5 0 015.5-2A4.5 4.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  profile:
    "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H5z",
  messages:
    "M4 4h16v10H5.17L4 15.17V4zm2 3v2h12V7H6z",
  add: "M12 5v6m-6 0h6m0 0h6m-6 0v6",
  nearme:
    "M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
};

const Icon = ({ name, className = "w-5 h-5" }) => {
  const d = ICON_PATHS[name] || ICON_PATHS.dashboard;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
};

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") || "tenant";
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => activeMenu === path;

  const menus = {
    tenant: [
      { icon: "dashboard", label: "Dashboard", path: "/dashboard/student" },
      { icon: "pg", label: "Explore PGs", path: "/pgs/all" },
      { icon: "nearme", label: "PG Near Me", path: "/pgs/near-me" },
      { icon: "mess", label: "Mess Services", path: "/messes" },
      // { icon: "laundry", label: "Laundry", path: "/services/laundry" },
      // { icon: "wishlist", label: "Wishlist", path: "/student/wishlist" },
      { icon: "profile", label: "Profile", path: "/profile" },
      { icon: "messages", label: "Messages", path: "/messages" },
    ],
    pgowner: [
      { icon: "dashboard", label: "Dashboard", path: "/dashboard/pgowner" },
      { icon: "pg", label: "My PG Listings", path: "/dashboard/pgs" },
      { icon: "add", label: "Add PG", path: "/dashboard/add-listing" },
      { icon: "messages", label: "Messages", path: "/messages" },
    ],
    messowner: [
      {
        icon: "dashboard",
        label: "Dashboard",
        path: "/dashboard/messowner",
      },
      { icon: "mess", label: "My Messes", path: "/dashboard/messes" },
      { icon: "add", label: "Add Mess", path: "/dashboard/add-mess" },
      { icon: "messages", label: "Messages", path: "/messages" },
    ],
    laundry: [
      { icon: "dashboard", label: "Dashboard", path: "/dashboard/laundry" },
      { icon: "laundry", label: "Orders", path: "/dashboard/laundry-orders" },
      { icon: "messages", label: "Messages", path: "/messages" },
    ],
  };

  const handleNavigation = (path) => {
    setActiveMenu(path);
    navigate(path);
  };

  const DesktopSidebar = () => (
    <aside
      className={`hidden lg:flex flex-col bg-white/95 backdrop-blur-sm border-r border-emerald-100 shadow-sm transition-all duration-300 ${
        isOpen ? "w-60" : "w-20"
      }`}
    >
      <nav className="flex-1 py-3 space-y-2 overflow-y-auto">
        {menus[role]?.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`group flex flex-col items-center justify-center w-full transition-all ${
                isOpen
                  ? "flex-row justify-start px-3 py-2 rounded-lg"
                  : "px-2 py-3"
              } ${
                active
                  ? "bg-emerald-50 text-emerald-700 font-semibold border-r-2 border-emerald-500"
                  : "text-slate-700 hover:bg-emerald-25 hover:text-emerald-600"
              }`}
            >
              <Icon
                name={item.icon}
                className={`w-6 h-6 mb-1 transition-colors ${
                  active ? "text-emerald-600" : "text-slate-500 group-hover:text-emerald-500"
                } ${isOpen ? "mr-3 mb-0" : "mx-auto"}`}
              />
              {isOpen ? (
                <span className="truncate text-sm font-medium">{item.label}</span>
              ) : (
                <span className="text-[10px] text-slate-600 leading-tight font-medium">
                  {item.label.length > 8
                    ? item.label.slice(0, 8) + "…"
                    : item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  const MobileSidebar = () =>
    isOpen ? (
      <div className="fixed inset-0 z-40 flex lg:hidden">
        <div className="flex-1 bg-black/20 backdrop-blur-sm" />
        <aside className="w-60 bg-white/95 h-full shadow-2xl backdrop-blur-sm border-l border-emerald-100">
          <div className="flex items-center gap-2 px-3 py-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-mint-50">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-mint-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                Zip Nivasa
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Find. Connect. Live.
              </span>
            </div>
          </div>

          <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
            {menus[role]?.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all font-medium ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500"
                      : "text-slate-700 hover:bg-emerald-25 hover:text-emerald-600"
                  }`}
                >
                  <span className="mr-3">
                    <Icon
                      name={item.icon}
                      className={`w-5 h-5 transition-colors ${
                        active ? "text-emerald-600" : "text-slate-500"
                      }`}
                    />
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      </div>
    ) : null;

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
