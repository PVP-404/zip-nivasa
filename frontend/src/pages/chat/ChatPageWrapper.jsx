import React from "react";
import { useParams } from "react-router-dom";
import ChatPage from "./ChatPage";

export default function ChatPageWrapper() {
  const { id } = useParams(); // receiver userId
  return <ChatPage receiverId={id} />;
}

