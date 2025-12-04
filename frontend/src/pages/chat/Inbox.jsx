// frontend/src/pages/chat/Inbox.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function Inbox() {
  const [rows, setRows] = useState([]);
  const token = localStorage.getItem("token");

  const loadInbox = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/chat/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data?.success) {
        setRows(res.data.conversations || res.data.inbox || []);
      }
    } catch (e) {
      console.log("inbox error:", e);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>

          <div className="bg-white border rounded-lg divide-y">
            {rows.length === 0 && (
              <div className="p-6 text-gray-500">No conversations yet.</div>
            )}

            {rows.map((r) => {
              const lastText =
                r?.lastMessage?.message ||
                r?.lastMessage ||
                "(no message)";
              const lastAt =
                r?.lastMessage?.createdAt || r?.lastAt || new Date().toISOString();

              return (
                <Link
                  key={r.user._id}
                  to={`/chat/${r.user._id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {r.user.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({r.user.role})
                      </span>
                    </div>
                    <div
                      className={`text-sm line-clamp-1 ${
                        r.unreadCount
                          ? "text-gray-900 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {lastText}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTime(lastAt)}
                    </div>
                  </div>

                  {r.unreadCount > 0 && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                      {r.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
