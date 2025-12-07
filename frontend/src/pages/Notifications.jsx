import React, { useEffect, useState, useCallback } from "react";
import {
  fetchNotifications,
  deleteNotification,
  clearAllNotifications
} from "../services/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  MoreVertical,
  CheckCircle,
  Trash2,
  Clock
} from "lucide-react";
import AppLayout from "../layouts/AppLayout";

const NotificationCard = React.memo(
  ({ notification, index, showMenu, onToggleMenu, onDelete }) => {
    const icon = notification.chatUserId ? (
      <MessageCircle className="w-4 h-4 text-indigo-500" />
    ) : (
      <Bell className="w-4 h-4 text-gray-500" />
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: index * 0.05 }}
        className={`group relative rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${
          notification.isRead
            ? "bg-white/80 border-gray-200 hover:bg-gray-50"
            : "bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border-indigo-200/50"
        }`}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md ${
                notification.isRead
                  ? "bg-gray-400/40"
                  : "bg-gradient-to-br from-indigo-500 to-purple-600"
              }`}
            >
              {notification.senderName?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-base truncate pr-2">
                  {notification.senderName || "System"}
                </h3>

                {!notification.isRead && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 animate-pulse"></div>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                {notification.body}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {new Date(notification.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>

              {notification.chatUserId && (
                <Link
                  to={`/chat/${notification.chatUserId}`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors group/link"
                >
                  Open Chat
                  <MessageCircle className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu(showMenu === notification._id ? null : notification._id);
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showMenu === notification._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-4 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200 rounded-xl z-50"
            >
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(notification._id)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 border-b border-gray-100"
              >
                <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                Mark as Read
              </motion.button>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(notification._id)}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
              >
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                Delete
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

NotificationCard.displayName = "NotificationCard";

export default function Notifications() {
  const [list, setList] = useState([]);
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    fetchNotifications().then((res) => setList(res || []));
  }, []);

  const onDelete = useCallback(async (id) => {
    await deleteNotification(id);
    setList((prev) => prev.filter((n) => n._id !== id));
    setShowMenu(null);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {list.length} total •{" "}
                <span className="font-semibold text-indigo-600">{unreadCount}</span> unread
              </p>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {list.length > 0 ? (
              <div className="space-y-4">
                {list.map((n, index) => (
                  <NotificationCard
                    key={n._id}
                    notification={n}
                    index={index}
                    showMenu={showMenu}
                    onToggleMenu={setShowMenu}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You're all caught up! Check back later for updates.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {list.length > 0 && (
          <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:right-8 sm:w-80 z-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                await clearAllNotifications();
                setList([]);
              }}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm py-3 px-6"
            >
              Clear All ({list.length})
            </motion.button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
