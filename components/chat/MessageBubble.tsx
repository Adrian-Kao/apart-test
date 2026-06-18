"use client";

import type { Message } from "@/lib/types";
import { ChatRiveAvatar } from "./ChatRiveAvatar";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  avatarAnimation?: "idle" | "jump" | "wave";
}

export function MessageBubble({ message, isOwn, avatarAnimation = "idle" }: MessageBubbleProps) {
  return (
    <div className={`firebase-message-row ${isOwn ? "own" : "partner"}`}>
      <ChatRiveAvatar
        side={isOwn ? "own" : "partner"}
        animation={avatarAnimation}
        animationKey={avatarAnimation === "idle" ? undefined : message.id}
      />
      <div className="firebase-message-bubble">
        <p>{message.text}</p>
        {message.emotion ? <span>{message.emotion}</span> : null}
      </div>
    </div>
  );
}
