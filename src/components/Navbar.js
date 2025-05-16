'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 创建自定义钩子用于主题管理
export function useTheme() {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // 检查当前主题
    if (typeof window !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDarkMode);
      
      // 初始应用主题
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);
  
  // 切换主题
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // 添加或移除dark类
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  return { darkMode, toggleTheme };
}

// 导航条组件
export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  // 检查用户登录状态
  const checkUserLoginStatus = () => {
    console.log('Checking user login status');
    const loggedInUser = localStorage.getItem('user');
    const authTimestamp = localStorage.getItem('auth_timestamp');
    
    console.log('User data from localStorage:', loggedInUser);
    console.log('Auth timestamp:', authTimestamp);
    
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        console.log('Parsed user data:', userData);
        setIsLoggedIn(true);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // 初始检查登录状态
    checkUserLoginStatus();
    console.log('Navbar组件初始化检查登录状态');
    
    // 添加存储事件监听器，当localStorage变化时更新
    const handleStorageChange = (event) => {
      console.log('Storage event detected:', event.key);
      if (event.key === 'user' || event.key === 'auth_timestamp') {
        console.log('User storage changed, updating login status');
        checkUserLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 添加路由变化监听
    const handleRouteChange = () => {
      console.log('Route change detected, checking login status');
      checkUserLoginStatus();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // 添加自定义事件监听器，支持其他组件通知登录状态变化
    const handleAuthChange = () => {
      console.log('Auth change event detected');
      checkUserLoginStatus();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    
    // 登录状态定期检查 (每10秒检查一次，但仅在开发环境中启用)
    let intervalCheck;
    if (process.env.NODE_ENV === 'development') {
      intervalCheck = setInterval(() => {
        console.log('定期检查登录状态');
        checkUserLoginStatus();
      }, 10000);
    }
    
    // 直接强制再次检查一次 (解决初始化未能正确获取数据的问题)
    setTimeout(() => {
      console.log('延迟再次检查登录状态');
      checkUserLoginStatus();
    }, 500);
    
    // 添加点击外部区域关闭用户菜单
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('#user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('auth-change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
      if (intervalCheck) clearInterval(intervalCheck);
    };
  }, [userMenuOpen]);

  // 登出功能
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    
    // 移除存储的用户信息
    localStorage.removeItem('user');
    localStorage.removeItem('auth_timestamp');
    
    // 手动触发storage事件，确保同一窗口内也能捕获到变化
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      oldValue: JSON.stringify(user),
      newValue: null
    }));
    
    // 触发auth_timestamp变化事件
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'auth_timestamp',
      oldValue: localStorage.getItem('auth_timestamp'),
      newValue: null
    }));
    
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new Event('auth-change'));
  };

  // 获取用户头像（如果没有则使用首字母）
  const getUserAvatar = () => {
    console.log('获取用户头像，当前用户数据:', user);
    if (user?.avatar) {
      return (
        <Image 
          src={user.avatar} 
          alt={user.name || user.username} 
          width={32} 
          height={32} 
          className="rounded-full"
        />
      );
    } else if (user?.name || user?.username) {
      const displayName = user.name || user.username;
      console.log('使用首字母作为头像:', displayName);
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {displayName.charAt(0).toUpperCase()}
        </div>
      );
    }
    return null;
  };

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">学习平台</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600">
                首页
              </Link>
              <Link href="/practice" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600">
                在线练习
              </Link>
              <Link href="/learn" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600">
                学习
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
              aria-label={darkMode ? '切换到浅色模式' : '切换到暗色模式'}
            >
              {darkMode ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {isLoggedIn ? (
              <div className="ml-3 relative">
                <div id="user-menu-container">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 max-w-xs bg-white dark:bg-gray-800 rounded-full focus:outline-none"
                    id="user-menu"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">打开用户菜单</span>
                    {getUserAvatar()}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || user?.username}</span>
                    <svg 
                      className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${userMenuOpen ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* 下拉菜单 */}
                {userMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10" 
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu"
                  >
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      role="menuitem"
                    >
                      个人信息
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  登录
                </Link>
                <Link 
                  href="/register" 
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  注册
                </Link>
              </>
            )}
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none mr-2"
              aria-label={darkMode ? '切换到浅色模式' : '切换到暗色模式'}
            >
              {darkMode ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 dark:hover:border-gray-600">
            首页
          </Link>
          <Link href="/practice" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 dark:hover:border-gray-600">
            在线练习
          </Link>
          <Link href="/learn" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 dark:hover:border-gray-600">
            学习
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {isLoggedIn ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {getUserAvatar()}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">{user?.name || user?.username}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    个人信息
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link 
                  href="/login" 
                  className="block text-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                >
                  登录
                </Link>
                <Link 
                  href="/register" 
                  className="block text-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md"
                >
                  注册
                </Link>
              </div>
            )}
        </div>
      </div>
    </nav>
  );
} 