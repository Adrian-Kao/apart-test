"use client";

import type { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return <div className="empty-chat">還沒有訊息，先傳一句溫柔的小話吧。</div>;
  }

  const latestMessage = messages[messages.length - 1];

  return (
    <div className="firebase-message-list">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;
        const isLatest = message.id === latestMessage.id;
        const avatarAnimation = isLatest ? (isOwn ? "jump" : "wave") : "idle";

        return <MessageBubble key={message.id} message={message} isOwn={isOwn} avatarAnimation={avatarAnimation} />;
      })}
    </div>
  );
}
