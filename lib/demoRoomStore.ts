"use client";

import {
  type LifeStatus,
  type RoomState,
  normalizeMoodFromStatus
} from "./avatarAnimation";

const STORAGE_KEY = "apart.demoRoom";
const CHANNEL_NAME = "apart.demoRoom.sync";

export const defaultRoomState: RoomState = {
  roomId: "demo-room",
  members: {
    userA: {
      userId: "userA",
      displayName: "你",
      avatarType: "fox",
      status: "idle",
      mood: "neutral"
    },
    userB: {
      userId: "userB",
      displayName: "對方",
      avatarType: "bear",
      status: "idle",
      mood: "neutral"
    }
  },
  unreadByUser: {
    userA: 1,
    userB: 0
  }
};

function readRoomState(): RoomState {
  if (typeof window === "undefined") return defaultRoomState;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultRoomState;

  try {
    return { ...defaultRoomState, ...JSON.parse(stored) } as RoomState;
  } catch {
    return defaultRoomState;
  }
}

function writeRoomState(nextState: RoomState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function subscribeRoom(roomId: string, onChange: (state: RoomState) => void) {
  if (typeof window === "undefined") return () => {};

  const emitCurrent = () => onChange({ ...readRoomState(), roomId });
  emitCurrent();

  const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
  channel?.addEventListener("message", emitCurrent);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) emitCurrent();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    channel?.close();
    window.removeEventListener("storage", onStorage);
  };
}

export function updateMemberStatus(roomId: string, userId: string, status: LifeStatus) {
  if (typeof window === "undefined") return;

  const current = readRoomState();
  const memberKey = current.members.userA.userId === userId ? "userA" : "userB";
  const nextState: RoomState = {
    ...current,
    roomId,
    members: {
      ...current.members,
      [memberKey]: {
        ...current.members[memberKey],
        status,
        mood: normalizeMoodFromStatus(status)
      }
    }
  };

  writeRoomState(nextState);

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "room:update", roomId });
    channel.close();
  }
}
