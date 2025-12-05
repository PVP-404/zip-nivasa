import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { fetchNotifications } from "../services/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, MoreVertical, CheckCircle, Trash2 } from "lucide-react";
import AppLayout from "../layouts/AppLayout";

const NotificationCard = React.memo(({ notification, index, onMarkRead, onDelete, showMenu, onToggleMenu }) => {
  const menuRef = useRef(null);

  const handleMarkRead = useCallback(() => {
    onMarkRead(notification._id);
    onToggleMenu(null);
  }, [notification._id, onMarkRead, onToggleMenu]);

  const handleDelete = useCallback(() => {
    onDelete(notification._id);
    onToggleMenu(null);
  }, [notification._id, onDelete, onToggleMenu]);

  const icon = notification.chatUserId ? <MessageCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.02 }}
      className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
        notification.isRead 
          ? "border-gray-100 bg-white/80 backdrop-blur-sm" 
          : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-indigo-100/50"
      }`}
    >
      <div 
        className="p-6 cursor-pointer"
        onClick={() => !notification.isRead && onMarkRead(notification._id)}
      >
        <div className="flex items-start gap-4">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-white font-bold text-lg relative z-10">
              {notification.senderName?.[0]?.toUpperCase() || "U"}
            </span>
            {icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-bold text-lg text-gray-900 truncate pr-4">
                {notification.senderName || "System"}
              </h3>
              {!notification.isRead && (
                <motion.div
                  className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-3 line-clamp-2">
              {notification.body}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {notification.formattedTime || notification.createdAt}
              </p>

              {notification.chatUserId && (
                <Link
                  to={`/chat/${notification.chatUserId}`}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all duration-200 group"
                >
                  Open Chat
                  <motion.div 
                    className="w-4 h-4" 
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </Link>
              )}
            </div>
          </div>

          <motion.button
            ref={menuRef}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu(showMenu === notification._id ? null : notification._id);
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showMenu === notification._id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-4 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50"
          >
            {!notification.isRead && (
              <motion.button
                onClick={handleMarkRead}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-all"
                whileTap={{ scale: 0.98, x: -2 }}
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Mark as read
              </motion.button>
            )}
            <motion.button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all"
              whileTap={{ scale: 0.98, x: -2 }}
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              Delete
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

NotificationCard.displayName = 'NotificationCard';

export default function Notifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showMenu, setShowMenu] = useState(null);

  const markNotificationAsRead = useCallback(async (id) => {
    setList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  }, []);

  const removeNotification = useCallback(async (id) => {
    setList(prev => prev.filter(n => n._id !== id));
  }, []);

  const processedNotifications = useMemo(() => 
    list.map(n => ({
      ...n,
      formattedTime: new Date(n.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    })), 
  [list]
  );

  const filteredList = useMemo(() => {
    return processedNotifications.filter(n => {
      if (filter === "unread") return !n.isRead;
      if (filter === "chats") return n.chatUserId;
      return true;
    });
  }, [processedNotifications, filter]);

  const unreadCount = useMemo(() => list.filter(n => !n.isRead).length, [list]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    fetchNotifications()
      .then((res) => {
        if (mounted) {
          setList(res || []);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch notifications:', error);
        if (mounted) setList([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const handleToggleMenu = useCallback((id) => {
    setShowMenu(prev => prev === id ? null : id);
  }, []);

  const renderFilterButton = (tab) => (
    <motion.button
      key={tab}
      onClick={() => setFilter(tab)}
      className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
        filter === tab
          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200"
          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
      }`}
      whileTap={{ scale: 0.98 }}
    >
      {tab === "all" && "All"}
      {tab === "unread" && "Unread"}
      {tab === "chats" && <><MessageCircle className="w-4 h-4" /> Chats</>}
    </motion.button>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {renderFilterButton("all")}
          {renderFilterButton("unread")}
          {renderFilterButton("chats")}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-3xl flex items-center justify-center">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "unread" ? "No unread notifications" : 
                 filter === "chats" ? "No chat notifications" : "No notifications yet"}
              </h3>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((n, index) => (
                <NotificationCard
                  key={n._id}
                  notification={n}
                  index={index}
                  showMenu={showMenu}
                  onMarkRead={markNotificationAsRead}
                  onDelete={removeNotification}
                  onToggleMenu={handleToggleMenu}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
