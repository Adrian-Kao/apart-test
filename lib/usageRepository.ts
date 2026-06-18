"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getTodayDateKey } from "./dateUtils";
import { getFirebaseDb } from "./firebase";
import type { DailyUsage } from "./types";

export { getTodayDateKey };

export function listenTodayUsage(
  roomId: string,
  userId: string,
  callback: (usage: DailyUsage | null) => void
): () => void {
  const db = getFirebaseDb();
  const dateKey = getTodayDateKey();
  const usageRef = doc(db, "rooms", roomId, "dailyUsage", `${dateKey}_${userId}`);

  return onSnapshot(usageRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as DailyUsage) : null);
  });
}

export async function ensureTodayUsage(roomId: string, userId: string) {
  const db = getFirebaseDb();
  const dateKey = getTodayDateKey();
  await setDoc(
    doc(db, "rooms", roomId, "dailyUsage", `${dateKey}_${userId}`),
    {
      userId,
      dateKey,
      messageCount: 0,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
