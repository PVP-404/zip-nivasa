import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import socket, {
  registerSocket,
  sendTyping,
  stopTyping,
  sendReadReceipt,
} from "../../services/socket";
import AppLayout from "../../layouts/AppLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============== ICONS ==============
const Icons = {
  Send: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  Paperclip: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  Smile: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Phone: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Video: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  MoreVertical: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ArrowDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  X: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  CheckDouble: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M1 13l4 4L15 7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 13l4 4L21 7" />
    </svg>
  ),
  Mic: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  Image: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Reply: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
  Copy: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

// ============== AVATAR COMPONENT ==============
const Avatar = memo(({ name, size = "md", isOnline, image }) => {
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const onlineSizes = {
    xs: "w-1.5 h-1.5 ring-1",
    sm: "w-2 h-2 ring-[1.5px]",
    md: "w-2.5 h-2.5 ring-2",
    lg: "w-3 h-3 ring-2",
  };

  const colors = [
    "from-rose-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-blue-400 to-indigo-500",
    "from-cyan-400 to-teal-500",
    "from-emerald-400 to-green-500",
    "from-amber-400 to-orange-500",
  ];

  const colorIndex = (name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
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
          className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-sm`}
        >
          {initials}
        </div>
      )}
      {isOnline && (
        <span 
          className={`absolute bottom-0 right-0 ${onlineSizes[size]} bg-emerald-500 rounded-full ring-white`} 
        />
      )}
    </div>
  );
});

// ============== MESSAGE STATUS ==============
const MessageStatus = memo(({ status, time }) => {
  const statusConfig = {
    sending: { icon: null, color: "text-gray-300", animate: true },
    sent: { icon: <Icons.Check className="w-3.5 h-3.5" />, color: "text-gray-400" },
    delivered: { icon: <Icons.CheckDouble className="w-3.5 h-3.5" />, color: "text-gray-400" },
    read: { icon: <Icons.CheckDouble className="w-3.5 h-3.5" />, color: "text-blue-500" },
  };

  const config = statusConfig[status] || statusConfig.sending;

  return (
    <span className={`inline-flex items-center gap-1 ${config.color}`}>
      <span className="text-[10px] opacity-70">{time}</span>
      {config.animate ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        config.icon
      )}
    </span>
  );
});

// ============== DATE SEPARATOR ==============
const DateSeparator = memo(({ date }) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="bg-white text-gray-500 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
        {formatDate(date)}
      </div>
    </div>
  );
});

// ============== TYPING INDICATOR ==============
const TypingIndicator = memo(() => (
  <div className="flex items-center gap-3 px-4 py-2">
    <div className="flex items-center gap-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            style={{
              animation: "typing 1.4s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-2">typing...</span>
    </div>
    <style>{`
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
    `}</style>
  </div>
));

// ============== MESSAGE BUBBLE ==============
const MessageBubble = memo(({ message, isMine, showAvatar, senderName, isFirstInGroup, isLastInGroup }) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getStatus = () => {
    if (message._optimistic) return "sending";
    if (message.readAt) return "read";
    return "delivered";
  };

  // Bubble corner radius based on position in group
  const getBubbleRadius = () => {
    if (isMine) {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-br-md";
      if (isFirstInGroup) return "rounded-2xl rounded-br-md";
      if (isLastInGroup) return "rounded-2xl rounded-tr-md rounded-br-md";
      return "rounded-2xl rounded-r-md";
    } else {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-bl-md";
      if (isFirstInGroup) return "rounded-2xl rounded-bl-md";
      if (isLastInGroup) return "rounded-2xl rounded-tl-md rounded-bl-md";
      return "rounded-2xl rounded-l-md";
    }
  };

  return (
    <div 
      className={`group flex items-end gap-2 px-4 ${isMine ? "flex-row-reverse" : ""} ${isLastInGroup ? "mb-3" : "mb-0.5"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar - only show for last message in group */}
      {!isMine && (
        <div className="w-8 flex-shrink-0">
          {isLastInGroup && <Avatar name={senderName} size="sm" />}
        </div>
      )}

      {/* Message Content */}
      <div className={`relative max-w-[75%] sm:max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>
        {/* Message Actions */}
        <div 
          className={`absolute ${isMine ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"} top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-200 ${showActions ? "opacity-100" : "opacity-0"}`}
        >
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Icons.Reply className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Icons.Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Bubble */}
        <div
          className={`relative px-3.5 py-2 ${getBubbleRadius()} transition-all duration-200 ${
            isMine
              ? "bg-gradient-to-br from-indigo-100 via-indigo-100 to-purple-100 text-black shadow-sm shadow-indigo-200"
              : "bg-white text-gray-800 shadow-sm border border-gray-100"
          } ${message._optimistic ? "opacity-70" : ""}`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.message}
          </p>
          
          {/* Time & Status */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
            {isMine ? (
              <MessageStatus status={getStatus()} time={formatTime(message.createdAt)} />
            ) : (
              <span className="text-[10px] text-gray-400">{formatTime(message.createdAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for sent messages alignment */}
      {isMine && <div className="w-8 flex-shrink-0" />}
    </div>
  );
});

// ============== CHAT HEADER ==============
const ChatHeader = memo(({ receiver, isOnline, isTyping }) => (
  <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 flex-shrink-0 px-4 py-3 sticky top-0 z-10">
    <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          to="/messages"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        >
          <Icons.ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar 
            name={receiver?.name} 
            isOnline={isOnline} 
            size="md" 
            image={receiver?.avatar} 
          />

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate text-base">
              {receiver?.name || "Loading..."}
            </h2>
            <div className="flex items-center gap-1.5">
              {isTyping ? (
                <span className="text-xs text-indigo-600 font-medium animate-pulse">
                  typing...
                </span>
              ) : isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-xs text-emerald-600 font-medium">Active now</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Offline</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-0.5">
        {receiver?.phone && (
          <>
            <a 
              href={`tel:${receiver.phone}`} 
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              title="Voice call"
            >
              <Icons.Phone className="w-5 h-5 text-gray-600" />
            </a>
            <button 
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95 hidden sm:flex"
              title="Video call"
            >
              <Icons.Video className="w-5 h-5 text-gray-600" />
            </button>
          </>
        )}
        <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
          <Icons.MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  </div>
));

// ============== MESSAGE INPUT ==============
const MessageInput = memo(({ onSend, onTypingStart, disabled }) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && !file) return;

    onSend({
      message: file ? `${text ? text + "\n" : ""}[📎 ${file.name}]` : text,
      file,
    });

    setInput("");
    setFile(null);
    
    // Reset height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [input, file, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e) => {
      setInput(e.target.value);
      onTypingStart?.();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {}, 1200);
    },
    [onTypingStart]
  );

  const hasContent = input.trim() || file;

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/80 flex-shrink-0 px-4 py-3 sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto">
        {/* File Preview */}
        {file && (
          <div className="mb-3 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl px-4 py-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-indigo-100">
              {file.type?.startsWith("image/") ? (
                <Icons.Image className="w-6 h-6 text-indigo-500" />
              ) : (
                <Icons.Paperclip className="w-6 h-6 text-indigo-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-indigo-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button 
              onClick={() => setFile(null)} 
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <Icons.X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Input Container */}
        <div 
          className={`flex items-end gap-2 p-1.5 rounded-2xl transition-all duration-200 ${
            isFocused 
              ? "bg-white ring-2 ring-indigo-500 shadow-lg shadow-indigo-100" 
              : "bg-gray-100"
          }`}
        >
          {/* Attachment Button */}
          <label className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer flex-shrink-0">
            <Icons.Paperclip className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0])}
              accept="image/*,.pdf,.doc,.docx"
            />
          </label>

          {/* Text Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent px-2 py-2 text-[15px] placeholder-gray-400 focus:outline-none resize-none leading-relaxed max-h-[120px]"
            disabled={disabled}
          />

          {/* Emoji Button */}
          <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0 hidden sm:flex">
            <Icons.Smile className="w-5 h-5" />
          </button>

          {/* Send / Mic Button */}
          {hasContent ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
            >
              <Icons.Send className="w-5 h-5" />
            </button>
          ) : (
            <button className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0">
              <Icons.Mic className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Encryption notice */}
        <p className="text-[10px] text-gray-400 text-center mt-2 hidden sm:block">
          🔒 Messages are end-to-end encrypted
        </p>
      </div>
    </div>
  );
});

// ============== LOADING SKELETON ==============
const ChatSkeleton = () => (
  <div className="flex-1 p-4 space-y-4">
    {[...Array(8)].map((_, i) => (
      <div 
        key={i} 
        className={`flex items-end gap-2 ${i % 3 === 0 ? "justify-end" : "justify-start"} animate-pulse`}
        style={{ animationDelay: `${i * 0.1}s` }}
      >
        {i % 3 !== 0 && <div className="w-8 h-8 rounded-full bg-gray-200" />}
        <div
          className={`rounded-2xl ${
            i % 3 === 0 
              ? "bg-gradient-to-r from-indigo-200 to-purple-200 rounded-br-md" 
              : "bg-gray-200 rounded-bl-md"
          }`}
          style={{ 
            width: `${Math.random() * 25 + 20}%`, 
            height: `${Math.random() * 30 + 40}px` 
          }}
        />
      </div>
    ))}
  </div>
);

// ============== EMPTY CHAT ==============
const EmptyChat = memo(({ receiverName }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="relative mb-6">
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-lg">👋</span>
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Say hello to {receiverName || "your contact"}!
    </h3>
    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
      Send a message to start your conversation. Your messages are encrypted and private.
    </p>
  </div>
));

// ============== SCROLL BUTTON ==============
const ScrollButton = memo(({ onClick, newMessages }) => (
  <button
    onClick={onClick}
    className="absolute bottom-20 right-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 z-20 border border-gray-200 group"
  >
    <Icons.ArrowDown className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
    {newMessages > 0 && (
      <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
        {newMessages > 99 ? "99+" : newMessages}
      </span>
    )}
  </button>
));

// ============== CONNECTION STATUS ==============
const ConnectionStatus = memo(({ status }) => {
  if (status === "connected") return null;
  
  return (
    <div className={`px-4 py-2 text-center text-sm font-medium ${
      status === "reconnecting" 
        ? "bg-amber-50 text-amber-700" 
        : "bg-red-50 text-red-700"
    }`}>
      {status === "reconnecting" ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Reconnecting...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          Connection lost. Check your internet.
        </span>
      )}
    </div>
  );
});

// ============== MAIN CHAT PAGE ==============
export default function ChatPage({ receiverId }) {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [newMessages, setNewMessages] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const isOnline = useMemo(
    () => onlineUsers.map(String).includes(String(receiverId)),
    [onlineUsers, receiverId]
  );

  // Group messages by date and sender
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      const prevMsg = messages[index - 1];
      const nextMsg = messages[index + 1];

      // Add date separator if date changed
      if (msgDate !== currentDate) {
        groups.push({ type: "date", date: msg.createdAt, key: `date-${index}` });
        currentDate = msgDate;
      }

      // Determine if this is first/last in a group of same-sender messages
      const isSameSenderAsPrev = prevMsg && 
        String(prevMsg.sender) === String(msg.sender) &&
        new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 60000 &&
        new Date(prevMsg.createdAt).toDateString() === msgDate;
      
      const isSameSenderAsNext = nextMsg && 
        String(nextMsg.sender) === String(msg.sender) &&
        new Date(nextMsg.createdAt) - new Date(msg.createdAt) < 60000 &&
        new Date(nextMsg.createdAt).toDateString() === msgDate;

      groups.push({
        type: "message",
        message: msg,
        showAvatar: !isSameSenderAsNext,
        isFirstInGroup: !isSameSenderAsPrev,
        isLastInGroup: !isSameSenderAsNext,
        key: msg._id || `msg-${index}`,
      });
    });

    return groups;
  }, [messages]);

  const scrollToBottom = useCallback((smooth = true) => {
    scrollRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setNewMessages(0);
  }, []);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottomRef.current = distanceFromBottom < 100;
    setShowScrollBtn(distanceFromBottom > 300);
  }, []);

  const markRead = useCallback(async () => {
    if (!token || !receiverId) return;
    try {
      await axios.post(
        `${API}/api/chat/mark-read`,
        { partnerId: receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((m) =>
          String(m.sender) === String(receiverId) && String(m.receiver) === String(userId)
            ? { ...m, readAt: new Date().toISOString() }
            : m
        )
      );
      sendReadReceipt(userId, receiverId);
    } catch (e) {
      console.error("mark-read error:", e);
    }
  }, [token, receiverId, userId]);

  // Initial load
  useEffect(() => {
    if (!userId || !receiverId) return;

    setLoading(true);
    setMessages([]);
    registerSocket(userId);

    Promise.all([
      axios.get(`${API}/api/auth/user/${receiverId}`),
      axios.get(`${API}/api/chat/history/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([uRes, hRes]) => {
        if (uRes.data?.success) setReceiver(uRes.data.user);
        if (hRes.data?.success) {
          setMessages(hRes.data.messages || []);
          if ((hRes.data.messages || []).length > 0) markRead();
        }
      })
      .catch((e) => console.log("Chat load error:", e))
      .finally(() => {
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 100);
      });
  }, [receiverId, userId, token, markRead, scrollToBottom]);

  // Socket events
  useEffect(() => {
    if (!userId || !receiverId) return;

    const handleReceiveMessage = async (msg) => {
      const match =
        (String(msg.sender) === String(receiverId) && String(msg.receiver) === String(userId)) ||
        (String(msg.sender) === String(userId) && String(msg.receiver) === String(receiverId));

      if (!match) return;

      setMessages((prev) => {
        if (String(msg.sender) === String(userId)) {
          const idx = prev.findIndex((m) => m._optimistic && m.message === msg.message);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg;
            return copy;
          }
        }
        return [...prev, msg];
      });

      if (String(msg.sender) === String(receiverId)) {
        if (isNearBottomRef.current) {
          setTimeout(scrollToBottom, 100);
          await markRead();
        } else {
          setNewMessages((prev) => prev + 1);
        }
      } else {
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleMessageRead = ({ readerId, readAt }) => {
      if (String(readerId) !== String(receiverId)) return;
      setMessages((prev) =>
        prev.map((m) => (String(m.sender) === String(userId) ? { ...m, readAt } : m))
      );
    };

    const handleTyping = ({ sender }) => {
      if (String(sender) === String(receiverId)) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ sender }) => {
      if (String(sender) === String(receiverId)) {
        setIsTyping(false);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_read", handleMessageRead);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("online_users", (list) => setOnlineUsers(list || []));
    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("reconnecting", () => setConnectionStatus("reconnecting"));

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("online_users");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnecting");
    };
  }, [receiverId, userId, markRead, scrollToBottom]);

  const handleSend = useCallback(
    ({ message }) => {
      if (!message?.trim()) return;

      const optimistic = {
        _id: `temp-${Date.now()}`,
        _optimistic: true,
        sender: userId,
        receiver: receiverId,
        message: message.trim(),
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      setMessages((prev) => [...prev, optimistic]);
      setTimeout(() => scrollToBottom(true), 50);

      socket.emit("send_message", {
        sender: userId,
        receiver: receiverId,
        message: message.trim(),
      });

      stopTyping(userId, receiverId);
    },
    [userId, receiverId, scrollToBottom]
  );

  const handleTypingStart = useCallback(() => {
    sendTyping(userId, receiverId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => stopTyping(userId, receiverId), 1200);
  }, [userId, receiverId]);

  return (
    <AppLayout>
      {/* Chat Container with fixed height */}
      <div 
        className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        style={{ height: "calc(100vh - 120px)", minHeight: "400px" }}
      >
        {/* Connection Status */}
        <ConnectionStatus status={connectionStatus} />
        
        {/* Chat Header - Fixed at top */}
        <ChatHeader 
          receiver={receiver} 
          isOnline={isOnline} 
          isTyping={isTyping}
        />

        {/* Messages Area - Scrollable */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 relative scroll-smooth"
          style={{ overscrollBehavior: "contain" }}
        >
          {loading ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <EmptyChat receiverName={receiver?.name} />
          ) : (
            <div className="py-4">
              {groupedMessages.map((item) =>
                item.type === "date" ? (
                  <DateSeparator key={item.key} date={item.date} />
                ) : (
                  <MessageBubble
                    key={item.key}
                    message={item.message}
                    isMine={String(item.message.sender) === String(userId)}
                    showAvatar={item.showAvatar}
                    isFirstInGroup={item.isFirstInGroup}
                    isLastInGroup={item.isLastInGroup}
                    senderName={receiver?.name}
                  />
                )
              )}

              {isTyping && <TypingIndicator />}

              <div ref={scrollRef} className="h-px" />
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <ScrollButton 
              onClick={() => scrollToBottom()} 
              newMessages={newMessages}
            />
          )}
        </div>

        {/* Message Input - Fixed at bottom */}
        <MessageInput 
          onSend={handleSend} 
          onTypingStart={handleTypingStart} 
          disabled={loading} 
        />
      </div>
    </AppLayout>
  );
}