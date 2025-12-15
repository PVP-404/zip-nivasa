import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============== ICONS ==============
const Icons = {
  Search: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  MessageCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
};

// ============== AVATAR COMPONENT ==============
const Avatar = memo(({ name, size = "md", isOnline, image }) => {
  const sizes = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-14 h-14 text-lg",
  };

  const onlineSizes = {
    sm: "w-2.5 h-2.5 right-0 bottom-0",
    md: "w-3 h-3 right-0 bottom-0",
    lg: "w-3.5 h-3.5 right-0.5 bottom-0.5",
  };

  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-600",
  ];

  const colorIndex = (name || "").charCodeAt(0) % colors.length;
  const initials = (name || "U").charAt(0).toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {image ? (
        <img
          src={image}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white`}
        >
          {initials}
        </div>
      )}
      {isOnline && (
        <span
          className={`absolute ${onlineSizes[size]} bg-green-500 rounded-full ring-2 ring-white`}
        />
      )}
    </div>
  );
});

// ============== CONVERSATION ITEM ==============
const ConversationItem = memo(({ conversation, formatTime }) => {
  const { user, lastMessage, unreadCount } = conversation;

  return (
    <Link
      to={`/chat/${user._id}`}
      className="flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 active:bg-gray-100"
    >
      <Avatar name={user.name} size="md" image={user.avatar} isOnline={user.isOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {user.name}
            </h3>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full capitalize">
              {user.role}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-gray-400 flex-shrink-0">
            {lastMessage?.createdAt ? formatTime(lastMessage.createdAt) : ""}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`text-sm truncate ${
              unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
            }`}
          >
            {lastMessage?.message || "Start a conversation"}
          </p>

          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white bg-indigo-600 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

// ============== LOADING SKELETON ==============
const ConversationSkeleton = memo(() => (
  <div className="flex items-center gap-3 p-3 sm:p-4 animate-pulse">
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
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
    <p className="text-gray-500 text-sm max-w-xs mb-6">
      Start a conversation with your contacts to see messages here
    </p>
    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
      <Icons.Plus className="w-4 h-4" />
      New Conversation
    </button>
  </div>
));

// ============== MAIN COMPONENT ==============
export default function ChatList() {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchConvos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setConvos(data.conversations || []);
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConvos();
    const interval = setInterval(fetchConvos, 30000);
    return () => clearInterval(interval);
  }, [fetchConvos]);

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
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  const filteredConvos = useMemo(() => {
    let filtered = convos;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.user.name.toLowerCase().includes(query) ||
          c.lastMessage?.message?.toLowerCase().includes(query)
      );
    }

    if (activeFilter === "Unread") {
      filtered = filtered.filter((c) => c.unreadCount > 0);
    }

    return filtered;
  }, [convos, searchQuery, activeFilter]);

  const totalUnread = useMemo(
    () => convos.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    [convos]
  );

  const onlineUsers = useMemo(
    () => convos.filter((c) => c.user.isOnline),
    [convos]
  );

  const filters = ["All", "Unread", "Groups"];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {convos.length} conversation{convos.length !== 1 ? "s" : ""}
              {totalUnread > 0 && ` • ${totalUnread} unread`}
            </p>
          </div>
          <button 
            onClick={() => navigate("/new-chat")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Icons.Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab}
              {tab === "Unread" && totalUnread > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full ${
                    activeFilter === tab
                      ? "bg-white/20"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {totalUnread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Online Users Section */}
        {!loading && onlineUsers.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              Active Now
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {onlineUsers.slice(0, 10).map((c) => (
                <Link
                  key={c.user._id}
                  to={`/chat/${c.user._id}`}
                  className="flex flex-col items-center gap-1.5 min-w-[64px] group"
                >
                  <div className="relative">
                    <Avatar name={c.user.name} size="md" isOnline />
                    <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-indigo-200 transition-all" />
                  </div>
                  <span className="text-xs text-gray-600 truncate max-w-[64px] text-center">
                    {c.user.name.split(" ")[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            [...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)
          ) : filteredConvos.length === 0 ? (
            searchQuery ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icons.Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-gray-400 text-sm mt-1">
                  No conversations match "{searchQuery}"
                </p>
              </div>
            ) : activeFilter === "Unread" ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <Icons.Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-600 font-medium">All caught up!</p>
                <p className="text-gray-400 text-sm mt-1">No unread messages</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredConvos.map((convo) => (
                <ConversationItem
                  key={convo.user._id}
                  conversation={convo}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && convos.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              {filteredConvos.length} of {convos.length} conversations
            </p>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => navigate("/new-chat")}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20"
      >
        <Icons.Plus className="w-6 h-6" />
      </button>
    </AppLayout>
  );
}