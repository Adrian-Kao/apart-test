import type { LifeStatus, MoodType } from "./avatarAnimation";

export const statusToRiveValue: Record<LifeStatus, number> = {
  idle: 0,
  eat: 1,
  sleep: 2,
  work: 3,
  miss: 4,
  happy: 5
};

export const moodToRiveValue: Record<MoodType, number> = {
  neutral: 0,
  happy: 1,
  miss: 2,
  sad: 3,
  angry: 4,
  wronged: 5,
  sorry: 6,
  tired: 7
};

export const statusLabels: Record<LifeStatus, string> = {
  idle: "待著",
  eat: "吃飯",
  sleep: "睡覺",
  work: "上班",
  miss: "想念",
  happy: "開心"
};

export const statusIcons: Record<LifeStatus, string> = {
  idle: "🧸",
  eat: "🍽",
  sleep: "Zz",
  work: "💻",
  miss: "♥",
  happy: "✦"
};

export function getFallbackAnimationClass(status: LifeStatus, mood?: MoodType) {
  if (mood === "angry") return "animate-avatar-angry-shake";
  if (status === "happy") return "animate-avatar-happy-bounce";
  return "animate-avatar-idle";
}
