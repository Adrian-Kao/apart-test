"use client";

import type { EmotionType } from "./types";

const ENCRYPTED_PREFIX = "enc:v1:";

export interface MessagePayload {
  text: string;
  emotion: EmotionType | null;
}

function getBrowserCrypto() {
  const browserCrypto = globalThis.crypto;
  if (!browserCrypto?.subtle) {
    throw new Error("目前瀏覽器環境不支援加密 API。請用 http://127.0.0.1:3000、http://localhost:3000 或 HTTPS 開啟。");
  }
  return browserCrypto;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importRoomKey(roomKey: string) {
  return getBrowserCrypto().subtle.importKey("raw", base64UrlToBytes(roomKey), "AES-GCM", false, [
    "encrypt",
    "decrypt"
  ]);
}

export async function generateRoomKey() {
  const browserCrypto = getBrowserCrypto();
  const key = await browserCrypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const rawKey = await browserCrypto.subtle.exportKey("raw", key);
  return bytesToBase64Url(new Uint8Array(rawKey));
}

export function isEncryptedMessage(text: string) {
  return text.startsWith(ENCRYPTED_PREFIX);
}

export async function encryptMessagePayload(roomKey: string, payload: MessagePayload) {
  const browserCrypto = getBrowserCrypto();
  const key = await importRoomKey(roomKey);
  const iv = browserCrypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await browserCrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  return `${ENCRYPTED_PREFIX}${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`;
}

export async function decryptMessagePayload(roomKey: string, encryptedText: string): Promise<MessagePayload> {
  if (!isEncryptedMessage(encryptedText)) {
    return { text: encryptedText, emotion: null };
  }

  const value = encryptedText.slice(ENCRYPTED_PREFIX.length);
  const [ivValue, ciphertextValue] = value.split(".");
  if (!ivValue || !ciphertextValue) throw new Error("訊息密文格式不正確。");

  const browserCrypto = getBrowserCrypto();
  const key = await importRoomKey(roomKey);
  const plaintext = await browserCrypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(ivValue) },
    key,
    base64UrlToBytes(ciphertextValue)
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as MessagePayload;
}
