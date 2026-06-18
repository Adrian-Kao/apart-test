"use client";

import type { EmotionType } from "@/lib/types";

const emotions: Array<{ value: EmotionType; label: string; icon: string }> = [
  { value: "happy", label: "開心", icon: "😊" },
  { value: "miss", label: "想念", icon: "💗" },
  { value: "sad", label: "難過", icon: "😢" },
  { value: "hug", label: "抱抱", icon: "🤗" },
  { value: "cheer", label: "加油", icon: "✨" },
  { value: "sorry", label: "抱歉", icon: "🥺" }
];

interface EmotionPickerProps {
  selected: EmotionType | null;
  onChange: (emotion: EmotionType | null) => void;
}

export function EmotionPicker({ selected, onChange }: EmotionPickerProps) {
  return (
    <div className="emotion-picker">
      {emotions.map((emotion) => (
        <button
          key={emotion.value}
          type="button"
          className={selected === emotion.value ? "active" : ""}
          onClick={() => onChange(selected === emotion.value ? null : emotion.value)}
        >
          <span>{emotion.icon}</span>
          {emotion.label}
        </button>
      ))}
    </div>
  );
}
