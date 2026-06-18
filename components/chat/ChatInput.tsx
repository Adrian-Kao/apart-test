"use client";

import { useState } from "react";
import { DAILY_MESSAGE_LIMIT } from "@/lib/constants";
import type { DailyUsage, EmotionType } from "@/lib/types";
import { EmotionPicker } from "./EmotionPicker";

interface ChatInputProps {
  usage: DailyUsage | null;
  encryptionReady: boolean;
  onSend: (text: string, emotion: EmotionType | null) => Promise<void>;
}

export function ChatInput({ usage, encryptionReady, onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<EmotionType | null>("happy");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const count = usage?.messageCount ?? 0;
  const isLimitReached = count >= DAILY_MESSAGE_LIMIT;
  const isDisabled = isLimitReached || isSending || !encryptionReady;

  const submit = async () => {
    setError(null);
    setIsSending(true);

    try {
      await onSend(text, emotion);
      setText("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "訊息送出失敗。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="firebase-chat-input">
      <EmotionPicker selected={emotion} onChange={setEmotion} />
      <div className="usage-line">
        今日小信件：{count} / {DAILY_MESSAGE_LIMIT}
      </div>
      {isLimitReached ? <p>今天的小信件用完囉，明天再寫給對方吧。</p> : null}
      {!encryptionReady ? <p>缺少加密金鑰，請重新用完整邀請連結進入。</p> : null}
      <div className="chat-send-row">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="輸入訊息..."
          disabled={isDisabled}
        />
        <button type="button" onClick={submit} disabled={isDisabled || !text.trim()}>
          送出
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
