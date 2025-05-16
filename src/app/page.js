'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // 检查是否已登录
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  // 模拟登录
  const handleLogin = () => {
    const mockUser = {
      name: '张三',
      email: 'zhangsan@example.com'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoggedIn(true);
    // 刷新页面以更新导航栏状态
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24">
        <Image
          className="mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">欢迎来到学习平台</h1>
        <p className="text-lg mb-8 text-center max-w-2xl text-gray-600 dark:text-gray-300">
          这是一个使用Next.js和Tailwind CSS构建的在线学习平台示例。您可以在这里进行在线练习、学习和提升您的技能。
        </p>

        <ol className="list-decimal ml-6 mb-10 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            通过编辑 <code className="font-mono bg-gray-100 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-200">src/app/page.js</code> 开始开发。
          </li>
          <li>保存后可以立即看到更改效果。</li>
        </ol>

        {!isLoggedIn && (
          <div className="mt-4">
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              模拟登录 (张三)
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            立即部署
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-900 dark:text-gray-200"
          >
            阅读文档
          </a>
        </div>
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-6 gap-4">
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            学习
          </a>
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            示例
          </a>
          <a
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            访问 nextjs.org →
          </a>
        </div>
      </footer>
    </div>
  );
}
