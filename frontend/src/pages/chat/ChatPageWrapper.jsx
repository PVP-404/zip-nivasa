import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatPage from "./ChatPage";

export default function ChatPageWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return <ChatPage receiverId={id} onBack={() => navigate("/messages")} />;
}