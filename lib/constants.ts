import type { LifeStatus, MoodType } from "./types";

export const DAILY_MESSAGE_LIMIT = 10;

export const AVATAR_TYPE = "lion" as const;

export const RIVE_ARTBOARD = "lion_avatar";

export const RIVE_STATE_MACHINE = "AvatarStateMachine";

export const lifeStatuses: LifeStatus[] = ["idle", "work", "sleep", "miss", "happy"];

export const statusToRiveValue: Record<LifeStatus, number> = {
  idle: 0,
  work: 1,
  sleep: 2,
  miss: 3,
  happy: 4
};

export const statusLabels: Record<LifeStatus, string> = {
  idle: "預設",
  work: "上班",
  sleep: "睡覺",
  miss: "想念",
  happy: "開心"
};

export function moodFromStatus(status: LifeStatus): MoodType {
  if (status === "happy") return "happy";
  if (status === "miss") return "miss";
  if (status === "sleep") return "tired";
  return "neutral";
}

export function isLifeStatus(value: string): value is LifeStatus {
  return lifeStatuses.includes(value as LifeStatus);
}
