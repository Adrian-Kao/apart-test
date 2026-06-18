import type { Metadata } from "next";
import "./globals.css";
import "@/styles/animations.css";

export const metadata: Metadata = {
  title: "Apart Room MVP",
  description: "Shared room animation MVP with Rive-ready fallbacks"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
