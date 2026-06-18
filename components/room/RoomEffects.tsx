"use client";

import type { LifeStatus, MoodType } from "@/lib/avatarAnimation";

interface RoomEffectsProps {
  status?: LifeStatus;
  mood?: MoodType;
  hasNewMessage?: boolean;
}

export function RoomEffects({ status, hasNewMessage }: RoomEffectsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {status === "miss" ? (
        <>
          <span className="animate-heart-bubble-float absolute left-8 top-5 text-2xl text-rose-500">♥</span>
          <span className="animate-heart-bubble-float absolute right-8 top-12 text-lg text-pink-400 [animation-delay:0.7s]">
            ♥
          </span>
        </>
      ) : null}

      {status === "sleep" ? (
        <>
          <span className="animate-avatar-sleep-zzz absolute right-7 top-8 text-lg font-bold text-room-ink">Zz</span>
          <span className="animate-avatar-sleep-zzz absolute right-14 top-1 text-sm font-bold text-room-ink [animation-delay:0.8s]">
            z
          </span>
        </>
      ) : null}

      {status === "work" ? (
        <span className="animate-soft-pulse absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md bg-white/85 px-2 py-1 text-lg shadow">
          💻
        </span>
      ) : null}

      {hasNewMessage ? (
        <span className="animate-soft-pulse absolute -right-2 top-0 rounded-full bg-amber-300 px-2 py-1 text-xs font-bold text-room-ink">
          new
        </span>
      ) : null}
    </div>
  );
}
