'use client';

import { useState, useEffect } from 'react';

export default function TopProgressBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    let interval;
    
    // 路由开始变化时的处理
    const handleRouteChangeStart = () => {
      console.log('路由开始变化，显示进度条');
      // 重置状态
      setLoading(true);
      setOpacity(1);
      setProgress(0);
      
      // 模拟进度，从0增长到90%
      interval = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress >= 90) return 90; // 不要到达100%
          return prevProgress + (Math.random() * 8 + 2); // 2-10之间的随机增量
        });
      }, 200);
    };
    
    // 路由完成变化时的处理
    const handleRouteChangeComplete = () => {
      console.log('路由变化完成，隐藏进度条');
      // 清除定时器
      if (interval) clearInterval(interval);
      
      // 直接设置为100%
      setProgress(100);
      
      // 延迟后淡出
      setTimeout(() => {
        setOpacity(0);
        
        // 完全淡出后重置
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 500);
      }, 300);
    };
    
    // 监听路由事件
    window.addEventListener('routeChangeStart', handleRouteChangeStart);
    window.addEventListener('routeChangeComplete', handleRouteChangeComplete);
    
    // 清理函数
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('routeChangeStart', handleRouteChangeStart);
      window.removeEventListener('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);
  
  // 如果没有加载且进度为0，则不渲染
  if (!loading && progress === 0) return null;
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-transparent"
      style={{
        opacity,
        transition: 'opacity 500ms ease-in-out',
      }}
    >
      <div 
        className="h-full bg-blue-600 progress-bar progress-bar-glow"
        style={{
          width: `${progress}%`,
          transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 10px rgba(59,130,246,0.7)'
        }}
      />
    </div>
  );
} 