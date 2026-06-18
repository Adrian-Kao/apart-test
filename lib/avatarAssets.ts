import type { AvatarType, LifeStatus } from "./types";

export function getRivePath(avatarType: AvatarType = "lion") {
  return `/assets/rive/${avatarType}.riv`;
}

export function getAvatarPngPath(status: LifeStatus, avatarType: AvatarType = "lion") {
  return `/assets/avatars/${avatarType}/${status}.png`;
}

export function getAvatarIdlePngPath(avatarType: AvatarType = "lion") {
  return `/assets/avatars/${avatarType}/idle.png`;
}

export async function assetExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}
