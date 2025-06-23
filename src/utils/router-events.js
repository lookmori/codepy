'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// 创建自定义事件
const routeChangeStart = new Event('routeChangeStart');
const routeChangeComplete = new Event('routeChangeComplete');

// 全局状态，标记当前是否正在路由变化中
let isChanging = false;

export function RouterEventProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 如果已经在变化中，忽略
    if (isChanging) return;
    
    // 标记开始路由变化
    isChanging = true;
    window.dispatchEvent(routeChangeStart);
    
    // 在下一个微任务中触发完成事件
    const timer = setTimeout(() => {
      isChanging = false;
      window.dispatchEvent(routeChangeComplete);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);
  
  return children;
}

// 为测试目的，提供一个手动触发事件的函数
export function triggerRouteChange() {
  window.dispatchEvent(routeChangeStart);
  setTimeout(() => {
    window.dispatchEvent(routeChangeComplete);
  }, 2000);
} 