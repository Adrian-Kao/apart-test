import type { AvatarType, LifeStatus } from "./avatarAnimation";

export function getRivePath(avatarType: AvatarType) {
  return `/assets/rive/${avatarType}.riv`;
}

export function getAvatarPngPath(avatarType: AvatarType, status: LifeStatus) {
  return `/assets/avatars/${avatarType}/${status}.png`;
}

export async function assetExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}
