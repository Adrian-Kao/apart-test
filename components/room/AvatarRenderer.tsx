"use client";

import { useEffect, useMemo, useState } from "react";
import { RIVE_ARTBOARD, RIVE_STATE_MACHINE, statusToRiveValue } from "@/lib/constants";
import { assetExists, getAvatarIdlePngPath, getAvatarPngPath, getRivePath } from "@/lib/avatarAssets";
import type { AvatarType, LifeStatus } from "@/lib/types";

interface AvatarRendererProps {
  status: LifeStatus;
  size?: number;
  displayName?: string;
  hasNewMessage?: boolean;
  avatarType?: AvatarType;
}

type AssetMode = "checking" | "rive" | "statusPng" | "idlePng" | "placeholder";

export function AvatarRenderer({
  status,
  size = 148,
  displayName,
  hasNewMessage = false,
  avatarType = "lion"
}: AvatarRendererProps) {
  const [mode, setMode] = useState<AssetMode>("checking");
  const rivePath = useMemo(() => getRivePath(avatarType), [avatarType]);
  const statusPngPath = useMemo(() => getAvatarPngPath(status, avatarType), [status, avatarType]);
  const idlePngPath = useMemo(() => getAvatarIdlePngPath(avatarType), [avatarType]);

  useEffect(() => {
    let active = true;

    async function resolveAsset() {
      setMode("checking");

      if (await assetExists(rivePath)) {
        if (active) setMode("rive");
        return;
      }

      if (await assetExists(statusPngPath)) {
        if (active) setMode("statusPng");
        return;
      }

      if (await assetExists(idlePngPath)) {
        if (active) setMode("idlePng");
        return;
      }

      if (active) setMode("placeholder");
    }

    resolveAsset();
    return () => {
      active = false;
    };
  }, [rivePath, statusPngPath, idlePngPath]);

  const pngSrc = mode === "statusPng" ? statusPngPath : mode === "idlePng" ? idlePngPath : null;

  return (
    <div className="lion-avatar-wrap" style={{ width: size }}>
      <div
        className={`lion-avatar-fallback status-${status} ${hasNewMessage ? "has-message" : ""}`}
        style={{ width: size, height: size }}
        title={
          mode === "rive"
            ? `${RIVE_ARTBOARD} / ${RIVE_STATE_MACHINE} / status=${statusToRiveValue[status]}`
            : undefined
        }
      >
        {mode === "rive" ? (
          <div className="rive-placeholder">Rive ready</div>
        ) : pngSrc ? (
          <img
            src={pngSrc}
            alt={`${avatarType} ${status}`}
            onError={() => setMode(mode === "statusPng" ? "idlePng" : "placeholder")}
          />
        ) : (
          <div className="css-lion">
            <span className="mane" />
            <span className="lion-face" />
            <span className="lion-eye left" />
            <span className="lion-eye right" />
            <span className="lion-nose" />
          </div>
        )}
        {status === "work" ? <span className="avatar-status-icon">💻</span> : null}
        {status === "sleep" ? <span className="avatar-status-icon sleep">Zz</span> : null}
        {status === "miss" ? <span className="avatar-heart">♥</span> : null}
      </div>
      {displayName ? <strong>{displayName}</strong> : null}
    </div>
  );
}
