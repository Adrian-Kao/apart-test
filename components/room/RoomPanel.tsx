"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { updateMemberStatus } from "@/lib/roomRepository";
import type { LifeStatus, Room } from "@/lib/types";
import { MailboxButton } from "./MailboxButton";
import { RiveRoomCharacter, type RoomCharacterAnimation } from "./RiveRoomCharacter";
import { StatusShortcutBar } from "./StatusShortcutBar";

interface RoomPanelProps {
  room: Room;
  currentUserId: string;
  onOpenChat: () => void;
}

const floorBounds = {
  minX: 20,
  maxX: 80,
  minY: 66,
  maxY: 82
};

const targetPositions: Record<"work" | "sleep", { x: number; y: number }> = {
  work: { x: 49, y: 72 },
  sleep: { x: 23, y: 68 }
};

export function RoomPanel({ room, currentUserId, onOpenChat }: RoomPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [characterPosition, setCharacterPosition] = useState({ x: 52, y: 72 });
  const [characterAnimation, setCharacterAnimation] = useState<RoomCharacterAnimation>("idle");
  const [animationKey, setAnimationKey] = useState(0);
  const idleTimerRef = useRef<number | null>(null);
  const members = [room.members.userA, room.members.userB].filter(Boolean);
  const currentMember = members.find((member) => member?.userId === currentUserId) ?? null;

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const playThenIdle = (animation: RoomCharacterAnimation, duration = 1200) => {
    clearIdleTimer();
    setCharacterAnimation(animation);
    setAnimationKey((key) => key + 1);
    idleTimerRef.current = window.setTimeout(() => {
      setCharacterAnimation("idle");
      setAnimationKey((key) => key + 1);
      idleTimerRef.current = null;
    }, duration);
  };

  const walkTo = (position: { x: number; y: number }) => {
    clearIdleTimer();
    setCharacterPosition(position);
    setCharacterAnimation("walk");
    setAnimationKey((key) => key + 1);
  };

  const changeStatus = async (status: LifeStatus) => {
    if (status === "work") walkTo(targetPositions.work);
    if (status === "sleep") walkTo(targetPositions.sleep);
    if (status === "happy") playThenIdle("sixseven", 1700);
    if (status === "miss") playThenIdle("jump", 1200);
    if (status === "idle") playThenIdle("idle", 0);

    setIsUpdating(true);
    try {
      await updateMemberStatus(room.id, currentUserId, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const moveCharacter = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const rawX = ((event.clientX - rect.left) / rect.width) * 100;
    const rawY = ((event.clientY - rect.top) / rect.height) * 100;
    const x = Math.min(floorBounds.maxX, Math.max(floorBounds.minX, rawX));
    const y = Math.min(floorBounds.maxY, Math.max(floorBounds.minY, rawY));

    walkTo({ x, y });
  };

  const finishMove = () => {
    setCharacterAnimation((current) => (current === "walk" ? "idle" : current));
    setAnimationKey((key) => key + 1);
  };

  return (
    <section className="firebase-room-panel">
      <header className="firebase-room-header">
        <div>
          <p>房間代碼</p>
          <h1>{room.roomName}</h1>
          <span>{room.id}</span>
        </div>
        <MailboxButton hasUnreadMessage={Boolean(room.lastMessage)} unreadCount={room.lastMessage ? 1 : 0} onClick={onOpenChat} />
      </header>

      <div className="firebase-room-scene">
        <div className="room-wall-trim" />
        <div className="simple-window" />
        <div className="simple-curtain left" />
        <div className="simple-curtain right" />
        <div className="simple-shelf" />
        <div className="simple-plant shelf-plant">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="simple-frame">♥</div>
        <div className="simple-lamp">
          <span />
        </div>
        <div className="simple-bed">
          <span className="bed-pillow" />
          <span className="bed-heart" />
        </div>
        <div className="simple-rug" />
        <div className="simple-table">
          <span className="table-vase" />
          <span className="table-mug" />
        </div>
        <div className="simple-mailbox">
          <span />
        </div>
        <div className="floor-click-zone is-clickable" onClick={moveCharacter} aria-label="點房間地板讓獅子走過去" />
        <div className="room-click-hint">點房間地板讓獅子走過去</div>
        <RiveRoomCharacter
          x={characterPosition.x}
          y={characterPosition.y}
          animation={characterAnimation}
          animationKey={animationKey}
          label={currentMember?.displayName ?? "小獅子"}
          onMoveEnd={finishMove}
        />
      </div>

      {currentMember ? (
        <StatusShortcutBar currentStatus={currentMember.status} onChange={changeStatus} disabled={isUpdating} />
      ) : null}
    </section>
  );
}
