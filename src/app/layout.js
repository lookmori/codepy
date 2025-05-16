'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar, { useTheme } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  // 使用自定义主题钩子来确保整个应用响应主题变化
  const { darkMode } = useTheme();
  
  return (
    <html lang="zh" suppressHydrationWarning className={darkMode ? 'dark' : ''}>
      <head>
        <title>学习平台</title>
        <meta name="description" content="在线学习与练习平台" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
