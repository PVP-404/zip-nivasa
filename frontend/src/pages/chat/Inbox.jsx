import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============== ICONS ==============
const Icons = {
  MessageCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Search: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
};

// ============== AVATAR ==============
const Avatar = memo(({ name, size = "md", isOnline }) => {
  const sizes = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
  };

  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
  ];

  const colorIndex = (name || "").charCodeAt(0) % colors.length;
  const initials = (name || "U").charAt(0).toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-sm`}
      >
        {initials}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
      )}
    </div>
  );
});

// ============== CONVERSATION SKELETON ==============
const ConversationSkeleton = memo(() => (
  <div className="flex items-center gap-3 p-4 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-gray-200" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
  </div>
));

// ============== EMPTY STATE ==============
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
      <Icons.MessageCircle className="w-10 h-10 text-indigo-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
    <p className="text-gray-500 text-sm max-w-xs">
      Start chatting to see your messages here
    </p>
  </div>
));

// ============== MAIN COMPONENT ==============
export default function Inbox() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");

  const loadInbox = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setRows(res.data.conversations || res.data.inbox || []);
      }
    } catch (e) {
      console.log("inbox error:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInbox();
    const interval = setInterval(loadInbox, 30000);
    return () => clearInterval(interval);
  }, [loadInbox]);

  const formatTime = useCallback((dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.user.name.toLowerCase().includes(query) ||
        r.lastMessage?.message?.toLowerCase().includes(query)
    );
  }, [rows, searchQuery]);

  const totalUnread = useMemo(
    () => rows.reduce((acc, r) => acc + (r.unreadCount || 0), 0),
    [rows]
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {rows.length} conversation{rows.length !== 1 ? "s" : ""}
              {totalUnread > 0 && ` • ${totalUnread} unread`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            [...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)
          ) : filteredRows.length === 0 ? (
            searchQuery ? (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations found for "{searchQuery}"</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRows.map((r) => {
                const lastText = r?.lastMessage?.message || r?.lastMessage || "(no message)";
                const lastAt = r?.lastMessage?.createdAt || r?.lastAt || new Date().toISOString();

                return (
                  <Link
                    key={r.user._id}
                    to={`/chat/${r.user._id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <Avatar name={r.user.name} isOnline={r.user.isOnline} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 truncate">
                            {r.user.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize hidden sm:inline">
                            {r.user.role}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(lastAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                          className={`text-sm truncate ${
                            r.unreadCount ? "text-gray-900 font-medium" : "text-gray-500"
                          }`}
                        >
                          {lastText}
                        </p>

                        {r.unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-indigo-600 rounded-full">
                            {r.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}