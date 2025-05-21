'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCurrentTheme } from "@/utils/theme-helper";
import Typewriter from 'typewriter-effect';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  // 使用本地状态管理主题
  const [darkMode, setDarkMode] = useState(false);
  
  // 引用DOM元素
  const logoRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const cardsRef = useRef([]);
  const buttonsRef = useRef([]);
  const cubeRef = useRef(null);
  
  const router = useRouter();
  
  useEffect(() => {
    // 检查用户登录状态
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    
    // 初始化主题状态
    const themeState = getCurrentTheme();
    setDarkMode(themeState.isDark);
  }, []); // 仅首次渲染时执行
  
  // 监听主题变化
  useEffect(() => {
    // 主题变化处理函数
    const handleThemeChange = (event) => {
      // 更新本地状态
      setDarkMode(event?.detail?.isDark);
    };
    
    // 监听新的自定义主题变化事件
    window.addEventListener('theme-changed', handleThemeChange);
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []); // 只在组件挂载时添加事件监听

  // Function to add elements to refs
  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };
  
  const addToButtonsRef = (el) => {
    if (el && !buttonsRef.current.includes(el)) {
      buttonsRef.current.push(el);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden
      ${darkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white" 
        : "bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800"
      }`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl 
          ${darkMode ? "bg-blue-500/10" : "bg-blue-500/20"}`}></div>
        <div className={`absolute top-1/3 -right-20 w-80 h-80 rounded-full blur-3xl 
          ${darkMode ? "bg-purple-500/10" : "bg-purple-500/20"}`}></div>
        <div className={`absolute -bottom-40 left-1/3 w-80 h-80 rounded-full blur-3xl 
          ${darkMode ? "bg-emerald-500/10" : "bg-emerald-500/20"}`}></div>
        
        {/* Floating Python cube */}
        <div 
          ref={cubeRef} 
          className="absolute top-20 right-10 w-40 h-40"
          style={{ opacity: darkMode ? 0.7 : 0.9 }}
        >
          <Image
            src="/python-cube.svg"
            alt="Python cube"
            width={160}
            height={160}
            className="w-full h-full"
          />
        </div>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 relative z-10">
        <div className="flex items-center justify-center gap-6 mb-8" ref={logoRef}>
          <Image
            src="/python-logo.svg"
            alt="Python logo"
            width={80}
            height={80}
            className="python-logo"
            priority
          />
          <h1 className={`text-5xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>CodePy</h1>
        </div>
        
        <h1 
          ref={headingRef}
          className="text-4xl md:text-5xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 bg-gradient-text"
        >
          Python 编程学习平台
        </h1>
        
        <div 
          ref={descriptionRef}
          className={`text-lg mb-10 text-center max-w-2xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          <Typewriter
            options={{
              strings: [
                '欢迎来到 CodePy - 专为编程爱好者打造的 Python 学习平台。无论你是初学者还是进阶者，我们都为你提供了丰富的学习资源和交互式编程环境。开始你的 Python 之旅吧！'
              ],
              autoStart: true,
              delay: 30,
              deleteSpeed: 9999999, // 避免删除文本
              loop: false,
              cursor: '|',
              wrapperClassName: 'typewriter-wrapper',
              cursorClassName: 'typewriter-cursor',
            }}
          />
        </div>

        {isLoggedIn ? (
          <div className="text-center mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
              <Typewriter
                options={{
                  strings: [`欢迎回来，${user?.name || '用户'}`],
                  autoStart: true,
                  delay: 50,
                  deleteSpeed: 9999999,
                  loop: false,
                }}
              />
            </h2>
            <p className={`mb-8 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>继续你的 Python 学习之旅！</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-4xl">
              <div 
                ref={addToCardsRef}
                className={`p-6 rounded-xl border transition-all group backdrop-blur-sm
                  ${darkMode 
                    ? "bg-gray-800/50 border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20" 
                    : "bg-white/70 border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
                  }`}
              >
                <div className={`mb-4 p-3 rounded-full w-14 h-14 flex items-center justify-center transition-colors
                  ${darkMode 
                    ? "bg-blue-600/20 group-hover:bg-blue-600/30" 
                    : "bg-blue-100 group-hover:bg-blue-200"
                  }`}
                >
                  <Image
                    src="/code-icon.svg"
                    alt="编码图标"
                    width={28}
                    height={28}
                    className={`code-icon ${!darkMode ? "text-blue-700" : ""}`}
                  />
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors
                  ${darkMode 
                    ? "text-blue-300 group-hover:text-blue-200" 
                    : "text-blue-700 group-hover:text-blue-800"
                  }`}
                >基础编程</h3>
                <p className={`mb-4 transition-colors
                  ${darkMode 
                    ? "text-gray-400 group-hover:text-gray-300" 
                    : "text-gray-600 group-hover:text-gray-700"
                  }`}
                >掌握 Python 基础语法、数据类型、流程控制和函数编写等核心概念</p>
                <Link 
                  href="/basics"
                  ref={addToButtonsRef}
                  className={`font-medium inline-flex items-center group-hover:translate-x-1 transition-transform
                    ${darkMode 
                      ? "text-blue-400 hover:text-blue-300" 
                      : "text-blue-600 hover:text-blue-700"
                    }`}
                >
                  开始学习
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div 
                ref={addToCardsRef}
                className={`p-6 rounded-xl border transition-all group backdrop-blur-sm
                  ${darkMode 
                    ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20" 
                    : "bg-white/70 border-gray-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
                  }`}
              >
                <div className={`mb-4 p-3 rounded-full w-14 h-14 flex items-center justify-center transition-colors
                  ${darkMode 
                    ? "bg-emerald-600/20 group-hover:bg-emerald-600/30" 
                    : "bg-emerald-100 group-hover:bg-emerald-200"
                  }`}
                >
                  <Image
                    src="/terminal-icon.svg"
                    alt="终端图标"
                    width={28}
                    height={28}
                    className={!darkMode ? "text-emerald-700" : ""}
                  />
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors
                  ${darkMode 
                    ? "text-emerald-300 group-hover:text-emerald-200" 
                    : "text-emerald-700 group-hover:text-emerald-800"
                  }`}
                >项目实战</h3>
                <p className={`mb-4 transition-colors
                  ${darkMode 
                    ? "text-gray-400 group-hover:text-gray-300" 
                    : "text-gray-600 group-hover:text-gray-700"
                  }`}
                >通过实际项目学习，如网络爬虫、自动化脚本、Web 应用开发等</p>
                <Link 
                  href="/projects" 
                  ref={addToButtonsRef}
                  className={`font-medium inline-flex items-center group-hover:translate-x-1 transition-transform
                    ${darkMode 
                      ? "text-emerald-400 hover:text-emerald-300" 
                      : "text-emerald-600 hover:text-emerald-700"
                    }`}
                >
                  查看项目
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div 
                ref={addToCardsRef}
                className={`p-6 rounded-xl border transition-all group backdrop-blur-sm
                  ${darkMode 
                    ? "bg-gray-800/50 border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20" 
                    : "bg-white/70 border-gray-200 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10"
                  }`}
              >
                <div className={`mb-4 p-3 rounded-full w-14 h-14 flex items-center justify-center transition-colors
                  ${darkMode 
                    ? "bg-purple-600/20 group-hover:bg-purple-600/30" 
                    : "bg-purple-100 group-hover:bg-purple-200"
                  }`}
                >
                  <Image
                    src="/data-science-icon.svg"
                    alt="数据科学图标"
                    width={28}
                    height={28}
                    className={!darkMode ? "text-purple-700" : ""}
                  />
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors
                  ${darkMode 
                    ? "text-purple-300 group-hover:text-purple-200" 
                    : "text-purple-700 group-hover:text-purple-800"
                  }`}
                >数据科学</h3>
                <p className={`mb-4 transition-colors
                  ${darkMode 
                    ? "text-gray-400 group-hover:text-gray-300" 
                    : "text-gray-600 group-hover:text-gray-700"
                  }`}
                >学习数据分析、可视化、机器学习和人工智能的 Python 应用</p>
                <Link 
                  href="/data-science" 
                  ref={addToButtonsRef}
                  className={`font-medium inline-flex items-center group-hover:translate-x-1 transition-transform
                    ${darkMode 
                      ? "text-purple-400 hover:text-purple-300" 
                      : "text-purple-600 hover:text-purple-700"
                    }`}
                >
                  探索数据
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div 
              ref={addToCardsRef} 
              className={`rounded-xl p-8 border mb-8 backdrop-blur-sm
                ${darkMode 
                  ? "bg-gray-800/60 border-gray-700" 
                  : "bg-white/80 border-gray-200"
                }`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                <Typewriter
                  options={{
                    strings: ['开始你的 Python 学习之旅'],
                    autoStart: true,
                    delay: 50,
                    deleteSpeed: 9999999,
                    loop: false,
                  }}
                />
              </h2>
              <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                登录账号以保存你的学习进度，或创建新账号立即开始学习
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  href="/login" 
                  ref={addToButtonsRef}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  登录账号
                </Link>
                <Link 
                  href="/register" 
                  ref={addToButtonsRef}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center
                    ${darkMode 
                      ? "border border-gray-600 text-gray-300 hover:bg-gray-700/50" 
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  注册新账号
                </Link>
              </div>
            </div>
            
            <div 
              ref={addToCardsRef} 
              className={`rounded-xl p-6 border backdrop-blur-sm
                ${darkMode 
                  ? "bg-blue-900/20 border-blue-800/50" 
                  : "bg-blue-50/60 border-blue-200/70"
                }`}
            >
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>为什么学习 Python？</h3>
              <ul className={`space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? "text-blue-400" : "text-blue-500"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>简单易学的语法，适合编程初学者</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? "text-blue-400" : "text-blue-500"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>广泛的应用领域：Web开发、数据分析、AI等</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? "text-blue-400" : "text-blue-500"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>丰富的库和框架生态系统</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? "text-blue-400" : "text-blue-500"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>市场需求高，就业机会多</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <a
            ref={addToButtonsRef}
            className={`flex items-center justify-center gap-2 px-6 py-3 border border-blue-500 text-blue-600 bg-white rounded-lg font-medium transition-colors shadow hover:bg-blue-50 z-10`
            }
            href="https://www.python.org/downloads/" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            下载 Python
          </a>
          <a
            ref={addToButtonsRef}
            href="https://docs.python.org/zh-cn/3/" 
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium border transition-colors
              ${darkMode 
                ? "border-blue-600 text-blue-400 hover:bg-blue-900/20" 
                : "border-blue-500 text-blue-600 hover:bg-blue-50"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Python 文档
          </a>
        </div>
      </main>
      
      <footer className={`border-t relative z-10 ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-6 gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/python-logo.svg"
              alt="Python logo"
              width={24}
              height={24}
            />
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>CodePy © {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="text-center md:text-right">
              <span className={`text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {isLoggedIn && user?.name && (
                <Typewriter
                  options={{
                      strings: [`欢迎回来，${user.name}`],
                    autoStart: true,
                    delay: 80,
                    deleteSpeed: 9999999,
                    loop: false,
                  }}
                />
                )}
              </span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com/topics/python-tutorial" 
                target="_blank"
                rel="noopener noreferrer"
                className={`${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                GitHub
              </a>
              <a
                href="https://stackoverflow.com/questions/tagged/python" 
                target="_blank"
                rel="noopener noreferrer"
                className={`${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                Stack Overflow
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
