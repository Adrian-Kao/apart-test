"use client";

interface MailboxButtonProps {
  hasUnreadMessage: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export function MailboxButton({ hasUnreadMessage, unreadCount = 0, onClick }: MailboxButtonProps) {
  return (
    <button
      type="button"
      className={`firebase-mailbox ${hasUnreadMessage ? "has-mail" : ""}`}
      onClick={onClick}
    >
      <span>✉</span>
      {hasUnreadMessage ? <b>{unreadCount}</b> : null}
    </button>
  );
}
