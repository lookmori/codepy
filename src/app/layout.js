'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { initializeTheme, toggleTheme } from "@/utils/theme-helper";
// Import theme fix (it self-executes)
import "@/utils/theme-fix";
import { ToastProvider } from "@/components/Toast";
import { StagewiseToolbar } from '@stagewise/toolbar-next';

const stagewiseConfig = {
  plugins: []
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  // 使用状态跟踪主题模式和水合(hydrated)状态
  const [darkMode, setDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // 客户端初始化
  useEffect(() => {
    // 标记为已水合
    setIsHydrated(true);
    
    // 初始化主题
    const isDark = initializeTheme();
    setDarkMode(isDark);
    
    // 监听主题变化事件
    const handleThemeChange = (e) => {
      setDarkMode(e.detail.isDark);
      console.log('RootLayout: 主题已变更为', e.detail.isDark ? 'dark' : 'light');
    };
    
    window.addEventListener('theme-changed', handleThemeChange);
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);
  
  // 当主题变化时更新文档属性
  useEffect(() => {
    if (!isHydrated) return;
    
    // 直接在控制台打印当前主题状态，便于调试
    console.log('当前主题状态:', {
      'darkMode': darkMode,
      'dark类': document.documentElement.classList.contains('dark'),
      'light类': document.documentElement.classList.contains('light')
    });
    
    // 设置数据属性用于CSS选择器
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode, isHydrated]);
  
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <title>CodePy | Python 编程学习平台</title>
        <meta name="description" content="探索 Python 编程世界：从基础编程到数据科学，一站式学习平台，助您掌握 Python 技能" />
        <link rel="icon" href="/python-logo.svg" />
        
        {/* 立即设置主题的内联脚本，防止页面加载闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 从localStorage或系统偏好获取主题
                  const savedTheme = localStorage.getItem('darkMode');
                  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldUseDarkMode = savedTheme === 'true' || (savedTheme === null && systemPrefersDark);
                  
                  // 立即应用主题到HTML元素，在React加载前
                  if (shouldUseDarkMode) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                  
                  // 设置数据属性
                  document.documentElement.setAttribute('data-theme', shouldUseDarkMode ? 'dark' : 'light');
                  
                  // 将使用的主题记录到全局变量，以便React可以获取它
                  window.__theme = shouldUseDarkMode ? 'dark' : 'light';
                } catch (e) {
                  console.error('即时主题设置出错:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen 
        ${darkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-white text-gray-900'} theme-transition-bg theme-transition-text`}>
        <ToastProvider>
          <Navbar />
          {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
