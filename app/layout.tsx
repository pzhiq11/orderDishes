import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "点菜管理系统",
  description: "团队协同点菜系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

