import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchNotifications, markAllNotificationsRead } from "../services/notificationService";
import { Bell, ChevronRight, ChevronDown } from "lucide-react";

const NotificationItem = React.memo(({ notification, index }) => (
  <Link
    to={`/chat/${notification.chatUserId}`}
    className="block border-b border-gray-100 py-3 px-3 hover:bg-gray-50 rounded-lg transition-all duration-200 last:border-b-0 group"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-bold text-sm">
          {notification.senderName?.[0]?.toUpperCase() || "U"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600">
          {notification.senderName || "System"}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
          {notification.body}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
      )}
    </div>
  </Link>
));

NotificationItem.displayName = 'NotificationItem';

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length, 
    [notifications]
  );
  useEffect(() => {
    let mounted = true;
    let interval;

    const loadNotifications = async () => {
      try {
        const list = await fetchNotifications();
        if (mounted) {
          setNotifications(list || []);
          setNotifCount(list.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    loadNotifications();
    interval = setInterval(() => {
      if (mounted) loadNotifications();
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (showNotif) {
      setShowNotif(false);
      return;
    }

    setShowNotif(true);
    if (unreadCount > 0) {
      setLoading(true);
      try {
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setNotifCount(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [showNotif, unreadCount]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleProfile = useCallback(() => {
    setShowDropdown(false);
    navigate("/tenant/profile");
  }, [navigate]);

  const recentNotifications = useMemo(() => 
    notifications.slice(0, 5), 
    [notifications]
  );

  return (
    <header className="w-full bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500 shadow-2xl 
  px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">

      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group">
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20 group-hover:shadow-md transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
          </div>
          <div className="hidden xs:block">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight cursor-pointer hover:scale-105 transition-transform duration-200 group-hover:text-white/90">
              Zip Nivasa
            </h1>
            <span className="block text-[10px] sm:text-xs font-normal text-indigo-200 tracking-wider mt-0.5">
              Find. Connect. Live Better.
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        
        <div className="relative">
          <button
            onClick={toggleNotifications}
            disabled={loading}
            className="relative p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-105 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4c-.4-.8-.6-1.7-.6-2.6V9a6 6 0 10-12 0v4c0 .9-.2 1.8-.6 2.6L4 17h5m6 0a3 3 0 11-6 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs min-w-[20px] h-[20px] rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 bg-white shadow-xl rounded-xl w-80 p-4 z-50 border border-gray-200 max-h-96 overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1 hover:underline transition-all"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {recentNotifications.map((n, i) => (
                    <NotificationItem key={n._id || i} notification={n} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 sm:px-5 py-2.5 hover:bg-white/15 transition-all duration-300 cursor-pointer shadow-lg group"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-700"></div>
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-white capitalize flex items-center gap-2">
                {username}
                <ChevronDown className={`w-3 h-3 text-indigo-200 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
              </p>
              <p className="text-xs font-medium text-indigo-200 capitalize">{role}</p>
            </div>
          </div>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn z-50">
              
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <p className="text-sm font-bold text-gray-800 capitalize">{username}</p>
                <p className="text-xs text-gray-600 capitalize">{role}</p>
              </div>

              <div className="p-2">
                <button
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-3 hover:pl-5"
                >
                  <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-3 hover:pl-5 font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default React.memo(Header);
