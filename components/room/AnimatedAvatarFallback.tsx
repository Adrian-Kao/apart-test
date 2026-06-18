"use client";

import type { AvatarType, LifeStatus, MoodType } from "@/lib/avatarAnimation";
import { getFallbackAnimationClass, statusIcons, statusLabels } from "@/lib/animationMaps";

interface AnimatedAvatarFallbackProps {
  avatarType: AvatarType;
  status: LifeStatus;
  mood?: MoodType;
  size: number;
  pngSrc?: string;
  displayName?: string;
  onImageError?: () => void;
}

const avatarEmoji: Record<string, string> = {
  fox: "🦊",
  bear: "🐻",
  cat: "🐱",
  dog: "🐶",
  rabbit: "🐰"
};

export function AnimatedAvatarFallback({
  avatarType,
  status,
  mood,
  size,
  pngSrc,
  displayName,
  onImageError
}: AnimatedAvatarFallbackProps) {
  const animationClass = getFallbackAnimationClass(status, mood);
  const emoji = avatarEmoji[avatarType] ?? "🙂";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative grid place-items-center rounded-full border border-white/70 bg-white/80 shadow-lg ${animationClass}`}
        style={{ width: size, height: size }}
        aria-label={`${displayName ?? avatarType} ${statusLabels[status]}`}
      >
        {pngSrc ? (
          <img
            src={pngSrc}
            alt={`${avatarType} ${status}`}
            className="h-full w-full rounded-full object-contain p-2"
            onError={onImageError}
          />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-b from-white to-amber-100 text-center">
            <span className="text-[48px] leading-none" style={{ fontSize: Math.max(40, size * 0.42) }}>
              {emoji}
            </span>
          </div>
        )}

        <span className="absolute -right-1 top-2 grid min-h-8 min-w-8 place-items-center rounded-full bg-room-mint px-2 text-sm font-bold text-white shadow">
          {statusIcons[status]}
        </span>
      </div>

      {displayName ? (
        <div className="rounded-full bg-white/78 px-3 py-1 text-sm font-semibold text-room-ink shadow-sm">
          {displayName}
        </div>
      ) : null}
    </div>
  );
}
