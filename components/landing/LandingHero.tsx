"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CreateRoomButton } from "./CreateRoomButton";

interface CreatedRoomInvite {
  roomId: string;
  inviteUrl: string;
}

export function LandingHero() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<CreatedRoomInvite | null>(null);

  const cleanedRoomCode = useMemo(() => {
    const raw = roomCode.trim();
    const withoutHash = raw.split("#")[0];
    const match = withoutHash.match(/room\/([^/?#]+)/);
    return match?.[1] ?? withoutHash;
  }, [roomCode]);

  const roomHash = useMemo(() => {
    const raw = roomCode.trim();
    return raw.includes("#") ? `#${raw.split("#").slice(1).join("#")}` : "";
  }, [roomCode]);

  const openRoom = () => {
    if (cleanedRoomCode) router.push(`/room/${cleanedRoomCode}${roomHash}`);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const copyCreatedInvite = async () => {
    if (!createdInvite) return;
    await copyText(createdInvite.inviteUrl);
  };

  const enterCreatedRoom = () => {
    if (!createdInvite) return;
    window.location.href = createdInvite.inviteUrl;
  };

  return (
    <main className="landing-shell">
      <div className="landing-orb landing-orb-one" />
      <div className="landing-orb landing-orb-two" />

      <section className="landing-minimal-panel">
        <div className="landing-badge image">
          <img src="/icon.png" alt="Apart" />
        </div>
        <p className="landing-eyebrow">Apart Web MVP</p>
        <h1>Apart but A Part</h1>
        <p className="landing-copy">
          為體驗的網站版，功能可能不完整，但還是希望大家都可以體驗看看這樣的聊天方式!!
        </p>

        <div className="landing-form-stack">
          <label className="landing-pill-input">
            <span>你的暱稱</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={16}
              placeholder=" "
              aria-label="你的暱稱"
            />
          </label>

          <label className="landing-pill-input">
            <span>房間代碼或邀請連結</span>
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder=" "
              aria-label="房間代碼或邀請連結"
            />
          </label>

          <div className="landing-action-row">
            <CreateRoomButton displayName={displayName} onCreated={setCreatedInvite} />
            <button type="button" className="landing-secondary-action" onClick={openRoom} disabled={!cleanedRoomCode}>
              加入房間
            </button>
          </div>
        </div>

        <div className="landing-feature-grid" aria-label="功能">
          <div>
            <strong>即時陪伴</strong>
            <span>共享狀態和訊息，讓小窩保持同步。</span>
          </div>
          <div>
            <strong>可愛互動</strong>
            <span>角色會依照狀態播放不同動畫。</span>
          </div>
          <div>
            <strong>加密聊天</strong>
            <span>訊息用房間金鑰加密，後台看不到明文。</span>
          </div>
        </div>
      </section>

      {createdInvite ? (
        <div className="invite-modal-backdrop" role="dialog" aria-modal="true" aria-label="房間邀請">
          <section className="invite-modal">
            <button
              type="button"
              className="invite-modal-close"
              onClick={() => setCreatedInvite(null)}
              aria-label="關閉"
            >
              ×
            </button>
            <div className="invite-modal-icon">♥</div>
            <div className="invite-modal-heading">
              <span>已加密</span>
              <h2>創建好房間!</h2>
              <p>這個邀請包含聊天解密金鑰，請整段傳給對方。</p>
            </div>

            <div className="invite-room-card">
              <div>
                <span>房號</span>
                <strong>{createdInvite.roomId}</strong>
              </div>
              <button type="button" onClick={copyCreatedInvite} aria-label="複製房間邀請">
                ⧉
              </button>
            </div>

            <button type="button" className="invite-enter-button" onClick={enterCreatedRoom}>
              進入房間
            </button>
            {copied ? <strong className="invite-copied">已複製邀請</strong> : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
