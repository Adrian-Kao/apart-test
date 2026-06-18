"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { JoinRoomModal } from "@/components/setup/JoinRoomModal";
import { ensureAnonymousUser, hasFirebaseConfig } from "@/lib/firebase";
import { getCurrentUserSlot, joinRoom, listenRoom } from "@/lib/roomRepository";
import type { Room } from "@/lib/types";
import { RoomPanel } from "./RoomPanel";

interface RoomPageClientProps {
  roomId: string;
}

type Tab = "room" | "chat" | "decorate";

function readRoomKeyFromHash(roomId: string) {
  if (typeof window === "undefined") return null;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const keyFromHash = hashParams.get("k");
  if (keyFromHash) {
    window.localStorage.setItem(`apart.roomKey.${roomId}`, keyFromHash);
    return keyFromHash;
  }
  return window.localStorage.getItem(`apart.roomKey.${roomId}`);
}

export function RoomPageClient({ roomId }: RoomPageClientProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("room");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setRoomKey(readRoomKeyFromHash(roomId));
  }, [roomId]);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setError("Firebase 尚未設定。請先建立 .env.local。");
      setIsLoading(false);
      return;
    }

    let unsubscribeRoom: (() => void) | null = null;
    ensureAnonymousUser()
      .then((user) => {
        setUserId(user.uid);
        unsubscribeRoom = listenRoom(roomId, (nextRoom) => {
          setRoom(nextRoom);
          setIsLoading(false);
        });
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Firebase 初始化失敗。");
        setIsLoading(false);
      });

    return () => {
      unsubscribeRoom?.();
    };
  }, [roomId]);

  const currentSlot = useMemo(() => {
    if (!room || !userId) return null;
    return getCurrentUserSlot(room, userId);
  }, [room, userId]);

  const isFull = Boolean(room?.members.userA && room.members.userB && !currentSlot);

  if (isLoading) {
    return <main className="firebase-page-shell">載入小窩中...</main>;
  }

  if (error) {
    return (
      <main className="firebase-page-shell">
        <section className="landing-card">
          <h1>暫時不能開啟房間</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!room || !userId) {
    return <main className="firebase-page-shell">找不到這個房間。</main>;
  }

  return (
    <main className="firebase-page-shell">
      {!currentSlot ? (
        <JoinRoomModal roomId={roomId} isFull={isFull} onJoin={(displayName) => joinRoom(roomId, displayName)} />
      ) : null}

      {tab === "room" ? <RoomPanel room={room} currentUserId={userId} onOpenChat={() => setTab("chat")} /> : null}
      {tab === "chat" ? <ChatPanel roomId={roomId} currentUserId={userId} roomKey={roomKey} /> : null}
      {tab === "decorate" ? (
        <section className="decorate-placeholder">
          <h1>布置</h1>
          <p>第一階段先保留房間設計資料欄位，完整家具布置留到下一階段。</p>
        </section>
      ) : null}

      <nav className="firebase-tabs">
        <button type="button" className={tab === "room" ? "active" : ""} onClick={() => setTab("room")}>
          房間
        </button>
        <button type="button" className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>
          聊天
        </button>
        <button type="button" className={tab === "decorate" ? "active" : ""} onClick={() => setTab("decorate")}>
          布置
        </button>
      </nav>
    </main>
  );
}
