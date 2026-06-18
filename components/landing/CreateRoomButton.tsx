"use client";

import { useState } from "react";
import { hasFirebaseConfig } from "@/lib/firebase";
import { createRoom } from "@/lib/roomRepository";
import { generateRoomKey } from "@/lib/roomCrypto";

interface CreatedRoomInvite {
  roomId: string;
  inviteUrl: string;
}

interface CreateRoomButtonProps {
  displayName: string;
  onCreated: (invite: CreatedRoomInvite) => void;
}

export function CreateRoomButton({ displayName, onCreated }: CreateRoomButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreateRoom = async () => {
    setError(null);
    setIsCreating(true);

    try {
      const roomKey = await generateRoomKey();
      const roomId = await createRoom(displayName.trim() || "小獅子");
      const inviteUrl = `${window.location.origin}/room/${roomId}#k=${roomKey}`;
      onCreated({ roomId, inviteUrl });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "建立房間失敗。");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="landing-primary-action"
        onClick={onCreateRoom}
        disabled={isCreating || !hasFirebaseConfig()}
      >
        {isCreating ? "建立中..." : "創建房間"}
      </button>
      {!hasFirebaseConfig() ? <p className="landing-hint">Firebase 尚未設定，請先填寫 .env.local。</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </>
  );
}
