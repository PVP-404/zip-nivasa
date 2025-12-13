import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { fetchNotifications, markAllNotificationsRead } from "../services/notificationService";
import { deregisterTokenWithBackend } from "../services/fcm";
import { 
  Bell, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  User, 
  LogOut, 
  X,
  Loader2,
  WifiOff,
  Settings
} from "lucide-react";

// ============ Custom Hooks ============

const useClickOutside = (handler, active = true) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") handler();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handler, active]);

  return ref;
};

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

const useAuth = () => {
  const token = localStorage.getItem("token");
  
  return useMemo(() => ({
    isAuthenticated: !!token,
    token,
    username: token ? localStorage.getItem("username") : null,
    role: token ? localStorage.getItem("role") : null,
    userId: token ? localStorage.getItem("userId") : null,
  }), [token]);
};

// ============ Sub Components ============

const Avatar = React.memo(({ name, size = "md", showStatus = false, className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const initial = name?.[0]?.toUpperCase() || "U";

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 
          flex items-center justify-center shadow-lg`}
      >
        <span className="text-white font-bold">{initial}</span>
      </div>
      {showStatus && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

const NotificationItem = React.memo(({ notification, onClick }) => {
  const timeAgo = useMemo(() => {
    if (!notification.createdAt) return "";
    const seconds = Math.floor((Date.now() - new Date(notification.createdAt)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(notification.createdAt).toLocaleDateString();
  }, [notification.createdAt]);

  return (
    <Link
      to={notification.chatUserId ? `/chat/${notification.chatUserId}` : "#"}
      onClick={onClick}
      className={`block py-3 px-3 rounded-lg transition-all duration-200 group
        ${notification.isRead 
          ? "hover:bg-gray-50" 
          : "bg-emerald-50/50 hover:bg-emerald-50"
        }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={notification.senderName} size="sm" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600">
              {notification.senderName || "System"}
            </p>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
            {notification.body}
          </p>
          {timeAgo && (
            <p className="text-[10px] text-gray-400 mt-1">{timeAgo}</p>
          )}
        </div>
      </div>
    </Link>
  );
});

NotificationItem.displayName = "NotificationItem";

const NotificationSkeleton = () => (
  <div className="flex items-start gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

const EmptyNotifications = () => (
  <div className="text-center py-10 px-4">
    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Bell className="w-8 h-8 text-emerald-300" />
    </div>
    <p className="text-gray-900 font-medium">No notifications yet</p>
    <p className="text-gray-500 text-sm mt-1">We'll notify you when something arrives</p>
  </div>
);

const DropdownMenu = React.memo(({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  position = "right" 
}) => {
  const ref = useClickOutside(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute top-full ${position === "right" ? "right-0" : "left-0"} mt-2 
        bg-white rounded-2xl shadow-2xl border border-gray-100 
        overflow-hidden z-50 animate-slideDown ${className}`}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
});

DropdownMenu.displayName = "DropdownMenu";

// ============ Main Header Component ============

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const auth = useAuth();

  // State
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const notifRef = useRef(null);
  const dropdownRef = useRef(null);
  const retryCountRef = useRef(0);

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const recentNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  // Close dropdowns on route change
  useEffect(() => {
    setShowDropdown(false);
    setShowNotif(false);
  }, [location.pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowNotif(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Fetch notifications with retry logic
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (!auth.isAuthenticated) return;

    try {
      if (showLoader) setInitialLoading(true);
      setError(null);

      const list = await fetchNotifications();
      setNotifications(list || []);
      retryCountRef.current = 0;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");

      // Exponential backoff retry (max 3 retries)
      if (retryCountRef.current < 3) {
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        retryCountRef.current++;
        setTimeout(() => loadNotifications(false), delay);
      }
    } finally {
      setInitialLoading(false);
    }
  }, [auth.isAuthenticated]);

  // Load notifications on mount and set up polling
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    let mounted = true;
    let interval;

    const load = async () => {
      if (mounted) await loadNotifications();
    };

    load();

    // Poll every 30 seconds
    interval = setInterval(() => {
      if (mounted && document.visibilityState === "visible") {
        loadNotifications(false);
      }
    }, 30000);

    // Refresh on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && mounted) {
        loadNotifications(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [auth.isAuthenticated, loadNotifications]);

  // Toggle notifications dropdown
  const toggleNotifications = useCallback(async () => {
    if (showNotif) {
      setShowNotif(false);
      return;
    }

    setShowNotif(true);
    setShowDropdown(false);

    if (unreadCount > 0) {
      setLoading(true);
      try {
        await markAllNotificationsRead();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [showNotif, unreadCount]);

  // Toggle user dropdown
  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev);
    setShowNotif(false);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await deregisterTokenWithBackend();
    } catch (err) {
      console.error("FCM deregistration error:", err);
    } finally {

      // Clear all auth data
      ["token", "role", "username", "userId", "fcmToken"].forEach((key) => {
        localStorage.removeItem(key);
      });


      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }, [navigate, isLoggingOut]);

  // Handle profile navigation
  const handleProfile = useCallback(() => {
    setShowDropdown(false);
    const profilePath = auth.role === "landlord" ? "/landlord/profile" : "/tenant/profile";
    navigate(profilePath);
  }, [navigate, auth.role]);

  // Handle settings navigation
  const handleSettings = useCallback(() => {
    setShowDropdown(false);
    navigate("/settings");
  }, [navigate]);

  return (
    <>
      <header
        className="w-full bg-gradient-to-r from-emerald-50/95 via-white/95 to-emerald-50/95 
          backdrop-blur-md shadow-lg border-b border-emerald-100/50
          px-4 sm:px-6 py-2.5 
          flex items-center justify-between 
          sticky top-0 z-50"
        role="banner"
      >
        {/* Left Section - Logo & Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center p-2.5 rounded-xl 
                bg-emerald-100/80 border border-emerald-200/50 
                hover:bg-emerald-200/80 hover:scale-105
                transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-emerald-700" />
            </button>
          )}

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 p-1.5 hover:bg-emerald-100/50 rounded-xl transition-all duration-200 group"
            aria-label="Go to homepage"
          >
            <div className="relative bg-emerald-100/80 p-2 rounded-xl border border-emerald-200/50 group-hover:shadow-md transition-all">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">Z</span>
              </div>
              
              {/* Online/Offline indicator */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                  ${isOnline ? "bg-emerald-400" : "bg-gray-400"}`}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>

            <div className="hidden xs:block">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                Zip Nivasa
              </h1>
              <span className="block text-[10px] sm:text-xs font-medium text-emerald-600 tracking-wide">
                Find. Connect. Live Better.
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Offline</span>
            </div>
          )}

          {auth.isAuthenticated ? (
            <>
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={toggleNotifications}
                  disabled={loading}
                  className="relative p-2.5 rounded-xl 
                    hover:bg-emerald-100/80 
                    transition-all duration-200 hover:scale-105 
                    focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                    border border-emerald-200/30
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                  aria-expanded={showNotif}
                  aria-haspopup="true"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 animate-spin" />
                  ) : (
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  )}
                  
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
                      bg-red-500 text-white text-xs font-bold rounded-full
                      flex items-center justify-center
                      shadow-lg border-2 border-white
                      animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotif && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 
                      bg-white rounded-2xl shadow-2xl 
                      border border-gray-100 
                      overflow-hidden z-50 
                      animate-slideDown"
                    role="menu"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-white">
                      <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
                      <button
                        onClick={() => {
                          setShowNotif(false);
                          navigate("/notifications");
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm 
                          flex items-center gap-1 hover:underline transition-all"
                      >
                        View all
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto overscroll-contain">
                      {initialLoading ? (
                        <div className="p-2 space-y-1">
                          {[...Array(3)].map((_, i) => (
                            <NotificationSkeleton key={i} />
                          ))}
                        </div>
                      ) : error ? (
                        <div className="text-center py-8 px-4">
                          <p className="text-red-500 text-sm">{error}</p>
                          <button
                            onClick={() => loadNotifications()}
                            className="mt-2 text-emerald-600 text-sm font-medium hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      ) : recentNotifications.length === 0 ? (
                        <EmptyNotifications />
                      ) : (
                        <div className="p-2 space-y-1">
                          {recentNotifications.map((n) => (
                            <NotificationItem
                              key={n._id || n.id}
                              notification={n}
                              onClick={() => setShowNotif(false)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {recentNotifications.length > 0 && (
                      <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                        <button
                          onClick={() => {
                            setShowNotif(false);
                            navigate("/notifications");
                          }}
                          className="w-full py-2.5 text-center text-sm font-medium
                            text-emerald-600 hover:text-emerald-700
                            hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          See all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:px-4 sm:py-2.5
                    bg-emerald-100/80 backdrop-blur-md 
                    border border-emerald-200/50 rounded-2xl 
                    hover:bg-emerald-200/60 
                    transition-all duration-200 
                    shadow-md hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  aria-label="User menu"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  <Avatar name={auth.username} size="sm" showStatus />

                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-emerald-700 capitalize flex items-center gap-1.5">
                      {auth.username}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-emerald-500 transition-transform duration-200 
                          ${showDropdown ? "rotate-180" : ""}`}
                      />
                    </p>
                    <p className="text-xs font-medium text-emerald-500 capitalize">
                      {auth.role}
                    </p>
                  </div>
                </button>

                {/* User Dropdown */}
                {showDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-60
                      bg-white rounded-2xl shadow-2xl 
                      border border-gray-100 
                      overflow-hidden z-50 
                      animate-slideDown"
                    role="menu"
                  >
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Avatar name={auth.username} size="md" showStatus />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 capitalize truncate">
                            {auth.username}
                          </p>
                          <p className="text-sm text-emerald-600 capitalize">
                            {auth.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                          text-gray-700 hover:bg-emerald-50 
                          transition-all duration-200 group"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Profile</span>
                      </button>

                      <button
                        onClick={handleSettings}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                          text-gray-700 hover:bg-emerald-50 
                          transition-all duration-200 group"
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mx-2" />

                    {/* Logout */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                          text-red-600 hover:bg-red-50 
                          transition-all duration-200 group
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        role="menuitem"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-sm font-medium">
                          {isLoggingOut ? "Signing out..." : "Sign Out"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Auth Buttons for unauthenticated users
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-4 sm:px-6 py-2.5
                  text-gray-700 font-semibold text-sm
                  bg-white/90 backdrop-blur-sm
                  border border-gray-200 rounded-xl
                  shadow-sm hover:shadow-md
                  hover:border-emerald-200 hover:bg-white
                  transition-all duration-200"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-4 sm:px-6 py-2.5
                  text-white font-semibold text-sm
                  bg-gradient-to-r from-emerald-500 to-teal-600
                  rounded-xl shadow-lg shadow-emerald-500/25
                  hover:shadow-xl hover:shadow-emerald-500/30 
                  hover:-translate-y-0.5
                  transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Global Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom scrollbar for notifications */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Responsive breakpoint for xs */
        @media (min-width: 475px) {
          .xs\\:block {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default React.memo(Header);