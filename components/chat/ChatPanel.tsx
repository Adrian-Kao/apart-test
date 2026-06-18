"use client";

import { useEffect, useState } from "react";
import { listenMessages, sendMessageWithLimit } from "@/lib/chatRepository";
import { decryptMessagePayload, isEncryptedMessage } from "@/lib/roomCrypto";
import { listenTodayUsage } from "@/lib/usageRepository";
import type { DailyUsage, EmotionType, Message } from "@/lib/types";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatPanelProps {
  roomId: string;
  currentUserId: string;
  roomKey: string | null;
}

export function ChatPanel({ roomId, currentUserId, roomKey }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [usage, setUsage] = useState<DailyUsage | null>(null);

  useEffect(() => listenMessages(roomId, setMessages), [roomId]);
  useEffect(() => listenTodayUsage(roomId, currentUserId, setUsage), [roomId, currentUserId]);

  useEffect(() => {
    let active = true;

    async function decryptMessages() {
      const nextMessages = await Promise.all(
        messages.map(async (message) => {
          if (!isEncryptedMessage(message.text)) return message;
          if (!roomKey) {
            return {
              ...message,
              text: "這則訊息已加密，請使用完整邀請連結進入房間。",
              emotion: null
            };
          }

          try {
            const payload = await decryptMessagePayload(roomKey, message.text);
            return {
              ...message,
              text: payload.text,
              emotion: payload.emotion
            };
          } catch {
            return {
              ...message,
              text: "無法解密這則訊息，房間金鑰可能不正確。",
              emotion: null
            };
          }
        })
      );

      if (active) setVisibleMessages(nextMessages);
    }

    decryptMessages();
    return () => {
      active = false;
    };
  }, [messages, roomKey]);

  return (
    <section className="firebase-chat-panel">
      {!roomKey ? (
        <div className="encryption-warning">聊天已啟用端對端加密。請用含有 #k= 的完整邀請連結進入，才看得到訊息。</div>
      ) : (
        <div className="encryption-warning success">開始聊天吧!!</div>
      )}
      <MessageList messages={visibleMessages} currentUserId={currentUserId} />
      <ChatInput
        usage={usage}
        encryptionReady={Boolean(roomKey)}
        onSend={(text: string, emotion: EmotionType | null) =>
          sendMessageWithLimit(roomId, currentUserId, text, emotion, roomKey)
        }
      />
    </section>
  );
}
