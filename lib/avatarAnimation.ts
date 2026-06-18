export type LifeStatus = "idle" | "eat" | "sleep" | "work" | "miss" | "happy";

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

export type MoodType =
  | "neutral"
  | "happy"
  | "miss"
  | "sad"
  | "angry"
  | "wronged"
  | "sorry"
  | "tired";

export type AvatarType = "fox" | "bear" | "cat" | "dog" | "rabbit" | string;

export interface RoomMember {
  userId: string;
  displayName: string;
  avatarType: AvatarType;
  status: LifeStatus;
  mood: MoodType;
}

export interface RoomState {
  roomId: string;
  members: {
    userA: RoomMember;
    userB: RoomMember;
  };
  unreadByUser: Record<string, number>;
}

export const lifeStatuses: LifeStatus[] = ["idle", "eat", "sleep", "work", "miss", "happy"];

export function normalizeMoodFromStatus(status: LifeStatus): MoodType {
  if (status === "miss") return "miss";
  if (status === "happy") return "happy";
  if (status === "sleep") return "tired";
  return "neutral";
}
