'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 创建自定义事件
const createCustomEvent = (name) => {
  try {
    return new Event(name);
  } catch (e) {
    // 兼容性处理
    const event = document.createEvent('Event');
    event.initEvent(name, true, true);
    return event;
  }
};

const routeChangeStart = createCustomEvent('routeChangeStart');
const routeChangeComplete = createCustomEvent('routeChangeComplete');

// 全局状态，标记当前是否正在路由变化中
let isChanging = false;
let previousPath = null;

export function RouterEventProvider({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // 初始加载不触发
    if (previousPath === null) {
      previousPath = pathname;
      return;
    }
    
    // 路径没变化不触发
    if (previousPath === pathname) return;
    
    // 更新上一个路径
    previousPath = pathname;
    
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
  }, [pathname]);
  
  return children;
}

// 为测试目的，提供一个手动触发事件的函数
export function triggerRouteChange() {
  window.dispatchEvent(routeChangeStart);
  setTimeout(() => {
    window.dispatchEvent(routeChangeComplete);
  }, 2000);
} 