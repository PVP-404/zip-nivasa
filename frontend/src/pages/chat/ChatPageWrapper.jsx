import React from "react";
import { useParams } from "react-router-dom";
import ChatPage from "./ChatPage";

export default function ChatPageWrapper() {
  const { id } = useParams(); 
  return <ChatPage receiverId={id} />;
}

