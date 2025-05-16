'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // 检查是否已登录
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

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

        {isLoggedIn ? (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">欢迎回来，{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">继续您的学习之旅吧！</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/practice" 
                className="px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                开始练习
              </Link>
              <Link 
                href="/learn" 
                className="px-6 py-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-600 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                学习课程
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ol className="list-decimal ml-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                通过编辑 <code className="font-mono bg-gray-100 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-200">src/app/page.js</code> 开始开发。
              </li>
              <li>保存后可以立即看到更改效果。</li>
            </ol>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                href="/login" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center"
              >
                登录账号
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200 flex items-center justify-center"
              >
                注册新账号
              </Link>
            </div>
          </>
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
