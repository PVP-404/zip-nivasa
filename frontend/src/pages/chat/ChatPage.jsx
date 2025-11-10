// frontend/src/pages/chat/ChatPage.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import socket, { registerSocket, sendTyping, stopTyping } from "../../services/socket";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d={d} fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

export default function ChatPage({ receiverId }) {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);

  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null); // prevent timer re-creation on every render
  const isOnline = useMemo(
    () => onlineUsers.map(String).includes(String(receiverId)),
    [onlineUsers, receiverId]
  );

  useEffect(() => {
    registerSocket(userId);

    Promise.all([
      axios.get(`http://localhost:5000/api/auth/user/${receiverId}`),
      axios.get(`http://localhost:5000/api/chat/history/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([uRes, hRes]) => {
        if (uRes.data?.success) setReceiver(uRes.data.user);
        if (hRes.data?.success) setMessages(hRes.data.messages);
      })
      .catch((e) => console.log("Chat load error:", e));

    // When a message is received from server:
    socket.on("receive_message", (msg) => {
      // If it's our current conversation
      const match =
        (String(msg.sender) === String(receiverId) &&
          String(msg.receiver) === String(userId)) ||
        (String(msg.sender) === String(userId) &&
          String(msg.receiver) === String(receiverId));

      if (!match) return;

      setMessages((prev) => {
        // If we sent an optimistic message, replace it with the server-confirmed one
        if (String(msg.sender) === String(userId)) {
          const idx = prev.findIndex(
            (m) => m._optimistic && m.message === msg.message
          );
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg; // replace optimistic with server version
            return copy;
          }
        }
        // Otherwise just append
        return [...prev, msg];
      });
    });

    socket.on("typing", ({ sender }) => {
      if (String(sender) === String(receiverId)) setIsTyping(true);
    });

    socket.on("stop_typing", ({ sender }) => {
      if (String(sender) === String(receiverId)) setIsTyping(false);
    });

    socket.on("online_users", (list) => setOnlineUsers(list || []));

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("online_users");
    };
  }, [receiverId, userId, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message: optimistic UI + socket emit ONLY (no REST fallback)
  const send = async (text) => {
    if (!text?.trim() || !userId || !receiverId) return;
    setSending(true);

    const trimmed = text.trim();

    // Optimistic bubble (will be replaced when server echoes back with _id)
    const optimistic = {
      _id: `temp-${Date.now()}`,
      _optimistic: true,
      sender: userId,
      receiver: receiverId,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    // Socket emit (server will save to DB and echo back; we replace optimistic)
    socket.emit("send_message", {
      sender: userId,
      receiver: receiverId,
      message: trimmed,
    });

    setSending(false);
  };

  const handleSend = () => {
    const txt = input;
    setInput("");
    stopTyping(userId, receiverId);
    send(file ? `${txt ? txt + "\n" : ""}[📎 ${file.name}]` : txt);
    if (file) setFile(null);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onChange = (e) => {
    setInput(e.target.value);
    sendTyping(userId, receiverId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(
      () => stopTyping(userId, receiverId),
      1200
    );
  };

  const phone = receiver?.phone || "";
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Chat Header - Fixed (flex-shrink-0) */}
        <div className="bg-white border-b px-4 py-3 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  {(receiver?.name || "U")[0].toUpperCase()}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {receiver?.name || "User"}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {isOnline ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  ) : (
                    "Offline"
                  )}
                  {phone && <span>• {phone}</span>}
                </div>
              </div>
            </div>

            {phone && (
              <div className="flex gap-2">
                <a
                  href={`tel:${phone}`}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <Icon
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                    className="w-4 h-4"
                  />
                  Call
                </a>
                <a
                  href={`https://wa.me/${phone}?text=Hi`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Messages - Scrollable (flex-1 overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    className="w-8 h-8 text-gray-400"
                  />
                </div>
                <p className="text-gray-500 text-sm">Start the conversation!</p>
              </div>
            )}

            {messages.map((m) => {
              const mine = String(m.sender) === String(userId);
              return (
                <div
                  key={m._id || m.createdAt}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        mine
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                    </div>
                    <div
                      className={`text-xs mt-1 px-1 ${
                        mine ? "text-right text-gray-500" : "text-left text-gray-400"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="flex gap-1">
                  {[0, 0.1, 0.2].map((d, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
                <span>Typing...</span>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </main>

        {/* Composer - Fixed (flex-shrink-0) */}
        <div className="bg-white border-t shadow-lg flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {file && (
              <div className="mb-2 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                <Icon
                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                  className="w-5 h-5 text-indigo-600"
                />
                <span className="text-sm text-indigo-700 flex-1 truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <Icon
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <label className="px-3 py-2.5 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-colors">
                <Icon
                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                  className="w-5 h-5 text-gray-500"
                />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>

              <textarea
                value={input}
                onChange={onChange}
                onKeyDown={onKey}
                placeholder="Type a message... (Enter to send)"
                className="flex-1 min-h-[44px] max-h-32 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                rows="1"
              />

              <button
                onClick={handleSend}
                disabled={sending || (!input.trim() && !file)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>Send</span>
                <Icon
                  d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                  className="w-4 h-4"
                />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              End-to-end encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
