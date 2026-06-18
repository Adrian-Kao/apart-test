"use client";

import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Timestamp
} from "firebase/firestore";
import { AVATAR_TYPE, moodFromStatus } from "./constants";
import { ensureAnonymousUser, getFirebaseDb } from "./firebase";
import type { LifeStatus, Room, RoomMember } from "./types";

function createDefaultRoomDesign() {
  return {
    wallpaperId: null,
    floorId: null,
    bedId: null,
    rugId: null,
    tableId: null,
    mailboxId: null,
    plantId: null,
    wallDecorId: null,
    lampId: null
  };
}

function makeRoomMember(userId: string, displayName: string): Omit<RoomMember, "joinedAt"> & { joinedAt: unknown } {
  return {
    userId,
    displayName,
    avatarType: AVATAR_TYPE,
    status: "idle",
    mood: "neutral",
    joinedAt: serverTimestamp()
  };
}

function mapRoom(id: string, data: DocumentData): Room {
  return {
    id,
    roomName: data.roomName ?? "我們的小窩",
    members: {
      userA: data.members?.userA ?? null,
      userB: data.members?.userB ?? null
    },
    themeId: data.themeId ?? "blush",
    roomDesign: data.roomDesign ?? createDefaultRoomDesign(),
    lastMessage: data.lastMessage ?? null,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp
  };
}

export async function createRoom(displayName: string): Promise<string> {
  const user = await ensureAnonymousUser();
  const db = getFirebaseDb();
  const roomRef = doc(collection(db, "rooms"));

  await setDoc(roomRef, {
    roomName: "我們的小窩",
    members: {
      userA: makeRoomMember(user.uid, displayName),
      userB: null
    },
    themeId: "blush",
    roomDesign: createDefaultRoomDesign(),
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return roomRef.id;
}

export async function joinRoom(roomId: string, displayName: string): Promise<void> {
  const user = await ensureAnonymousUser();
  const db = getFirebaseDb();
  const roomRef = doc(db, "rooms", roomId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(roomRef);
    if (!snap.exists()) throw new Error("找不到這個房間。");

    const room = mapRoom(snap.id, snap.data());
    if (getCurrentUserSlot(room, user.uid)) return;

    const nextMember = makeRoomMember(user.uid, displayName);
    if (!room.members.userA) {
      transaction.update(roomRef, {
        "members.userA": nextMember,
        updatedAt: serverTimestamp()
      });
      return;
    }

    if (!room.members.userB) {
      transaction.update(roomRef, {
        "members.userB": nextMember,
        updatedAt: serverTimestamp()
      });
      return;
    }

    throw new Error("房間已滿。");
  });
}

export function listenRoom(roomId: string, callback: (room: Room | null) => void): () => void {
  const db = getFirebaseDb();
  return onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
    callback(snapshot.exists() ? mapRoom(snapshot.id, snapshot.data()) : null);
  });
}

export async function updateMemberStatus(roomId: string, userId: string, status: LifeStatus): Promise<void> {
  const db = getFirebaseDb();
  const roomRef = doc(db, "rooms", roomId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(roomRef);
    if (!snap.exists()) throw new Error("找不到這個房間。");

    const room = mapRoom(snap.id, snap.data());
    const slot = getCurrentUserSlot(room, userId);
    if (!slot) throw new Error("你尚未加入這個房間。");

    transaction.update(roomRef, {
      [`members.${slot}.status`]: status,
      [`members.${slot}.mood`]: moodFromStatus(status),
      updatedAt: serverTimestamp()
    });
  });
}

export function getCurrentUserSlot(room: Room, userId: string): "userA" | "userB" | null {
  if (room.members.userA?.userId === userId) return "userA";
  if (room.members.userB?.userId === userId) return "userB";
  return null;
}
