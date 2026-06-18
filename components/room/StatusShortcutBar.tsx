"use client";

import { lifeStatuses, statusLabels } from "@/lib/constants";
import type { LifeStatus } from "@/lib/types";

interface StatusShortcutBarProps {
  currentStatus: LifeStatus;
  onChange: (status: LifeStatus) => void;
  disabled?: boolean;
}

const statusIcons: Record<LifeStatus, string> = {
  idle: "○",
  work: "□",
  sleep: "☾",
  miss: "♥",
  happy: "☺"
};

export function StatusShortcutBar({ currentStatus, onChange, disabled = false }: StatusShortcutBarProps) {
  return (
    <div className="firebase-status-bar">
      {lifeStatuses.map((status) => (
        <button
          key={status}
          type="button"
          className={currentStatus === status ? "active" : ""}
          onClick={() => onChange(status)}
          disabled={disabled}
        >
          <span>{statusIcons[status]}</span>
          {statusLabels[status]}
        </button>
      ))}
    </div>
  );
}
