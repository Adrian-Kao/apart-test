"use client";

import { useState } from "react";

interface JoinRoomModalProps {
  roomId: string;
  isFull: boolean;
  onJoin: (displayName: string) => Promise<void>;
}

export function JoinRoomModal({ roomId, isFull, onJoin }: JoinRoomModalProps) {
  const [displayName, setDisplayName] = useState("小獅子");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const submit = async () => {
    setError(null);
    setIsJoining(true);

    try {
      await onJoin(displayName || "小獅子");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "加入房間失敗。");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="join-modal">
        <div className="lion-mark small">♌</div>
        <h2>{isFull ? "房間已滿" : "加入我們的小窩"}</h2>
        <p>房間代碼：{roomId}</p>
        {isFull ? (
          <p>這個房間已經有兩位成員了。</p>
        ) : (
          <>
            <label>
              你的暱稱
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={16} />
            </label>
            <button type="button" onClick={submit} disabled={isJoining}>
              {isJoining ? "加入中..." : "加入房間"}
            </button>
          </>
        )}
        {error ? <p className="form-error">{error}</p> : null}
      </section>
    </div>
  );
}
