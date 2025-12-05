import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function ChatList() {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchConvos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) setConvos(data.conversations || []);
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, []);

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            </div>
          ) : convos.length === 0 ? (
            <div className="text-gray-600">No conversations yet.</div>
          ) : (
            <ul className="space-y-3">
              {convos.map(({ user, lastMessage, unreadCount }) => (
                <li key={user._id}>
                  <Link
                    to={`/chat/${user._id}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {user.name}
                        </span>
                        <span className="text-xs text-gray-500 border border-gray-200 rounded px-1.5 py-0.5">
                          {user.role}
                        </span>
                      </div>
                      <div
                        className={`text-sm mt-1 line-clamp-1 ${
                          unreadCount
                            ? "text-gray-900 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {lastMessage?.message || "No messages"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400">
                        {lastMessage?.createdAt
                          ? formatTime(lastMessage.createdAt)
                          : ""}
                      </span>
                      {!!unreadCount && (
                        <span className="inline-flex items-center justify-center text-xs bg-red-600 text-white min-w-[1.5rem] h-6 rounded-full px-1">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
