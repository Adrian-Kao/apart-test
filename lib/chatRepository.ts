"use client";

import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { DAILY_MESSAGE_LIMIT } from "./constants";
import { getTodayDateKey } from "./dateUtils";
import { getFirebaseDb } from "./firebase";
import { encryptMessagePayload } from "./roomCrypto";
import type { DailyUsage, EmotionType, Message } from "./types";

export function listenMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
  const db = getFirebaseDb();
  const messagesQuery = query(
    collection(db, "rooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    callback(
      snapshot.docs.map((messageDoc) => ({
        id: messageDoc.id,
        ...(messageDoc.data() as Omit<Message, "id">)
      }))
    );
  });
}

export async function sendMessageWithLimit(
  roomId: string,
  userId: string,
  text: string,
  emotion: EmotionType | null,
  roomKey: string | null
): Promise<void> {
  const trimmedText = text.trim();
  if (!trimmedText) return;
  if (!roomKey) throw new Error("缺少房間加密金鑰，請用完整邀請連結進入房間。");

  const encryptedText = await encryptMessagePayload(roomKey, {
    text: trimmedText,
    emotion
  });

  const db = getFirebaseDb();
  const dateKey = getTodayDateKey();
  const usageRef = doc(db, "rooms", roomId, "dailyUsage", `${dateKey}_${userId}`);
  const roomRef = doc(db, "rooms", roomId);
  const messageRef = doc(collection(db, "rooms", roomId, "messages"));

  await runTransaction(db, async (transaction) => {
    const usageSnap = await transaction.get(usageRef);
    const usage = usageSnap.exists() ? (usageSnap.data() as DailyUsage) : null;
    const messageCount = usage?.messageCount ?? 0;

    if (messageCount >= DAILY_MESSAGE_LIMIT) {
      throw new Error("今天的小信件用完囉，明天再寫給對方吧。");
    }

    const message = {
      senderId: userId,
      text: encryptedText,
      emotion: null,
      encrypted: true,
      createdAt: serverTimestamp()
    };

    transaction.set(messageRef, message);
    transaction.set(
      usageRef,
      {
        userId,
        dateKey,
        messageCount: increment(1),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    transaction.update(roomRef, {
      lastMessage: message,
      updatedAt: serverTimestamp()
    });
  });
}
