import type { Timestamp } from "firebase/firestore";

export type LifeStatus = "idle" | "work" | "sleep" | "miss" | "happy";

export type AvatarType = "lion";

export type MoodType =
  | "neutral"
  | "happy"
  | "miss"
  | "sad"
  | "angry"
  | "wronged"
  | "tired"
  | "sorry";

export type EmotionType =
  | "happy"
  | "miss"
  | "angry"
  | "sad"
  | "wronged"
  | "hug"
  | "cheer"
  | "sleep"
  | "sorry";

export interface RoomMember {
  userId: string;
  displayName: string;
  avatarType: AvatarType;
  status: LifeStatus;
  mood: MoodType;
  joinedAt: Timestamp;
}

export interface RoomDesign {
  wallpaperId: string | null;
  floorId: string | null;
  bedId: string | null;
  rugId: string | null;
  tableId: string | null;
  mailboxId: string | null;
  plantId: string | null;
  wallDecorId: string | null;
  lampId: string | null;
}

export interface Room {
  id: string;
  roomName: string;
  members: {
    userA: RoomMember | null;
    userB: RoomMember | null;
  };
  themeId: string;
  roomDesign: RoomDesign;
  lastMessage: {
    text: string;
    senderId: string;
    emotion: EmotionType | null;
    createdAt: Timestamp;
  } | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  emotion: EmotionType | null;
  createdAt: Timestamp;
}

export interface DailyUsage {
  userId: string;
  dateKey: string;
  messageCount: number;
  updatedAt: Timestamp;
}
