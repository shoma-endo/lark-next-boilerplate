import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lark Next.js Boilerplate",
  description: "Next.js 15 boilerplate with Lark integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
