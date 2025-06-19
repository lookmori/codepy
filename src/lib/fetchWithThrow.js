export async function fetchWithThrow(url, options) {
  // 添加全局窗口变量来防止重复重定向
  if (typeof window !== 'undefined') {
    // 如果已经在处理登录过期，则直接抛出错误
    if (window.__handlingAuthExpiry) {
      throw new Error('登录已过期，请重新登录');
    }
  }

  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('服务器响应格式错误');
  }
  
  if (!res.ok) {
    // 特殊处理401未授权错误（登录过期）
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        // 设置正在处理登录过期的标记
        window.__handlingAuthExpiry = true;
        
        // 清除用户会话数据
        localStorage.removeItem('user');
        localStorage.removeItem('auth_timestamp');
        
        // 清除所有相关的cookies
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        // 触发自定义事件通知其他组件
        window.dispatchEvent(new Event('auth-change'));
        
        // 创建并显示Toast通知
        const toastEvent = new CustomEvent('show-toast', {
          detail: {
            type: 'error',
            title: '会话已过期',
            message: '您的登录已过期，请重新登录',
            duration: 5000
          }
        });
        window.dispatchEvent(toastEvent);
        
        // 重定向到登录页面
        console.log('登录过期，准备重定向到登录页面...');
        
        // 使用setTimeout确保事件处理和状态更新完成
        setTimeout(() => {
          console.log('登录过期，正在重定向到登录页面...');
          window.location.href = '/login';
          
          // 2秒后重置标记，以防重定向失败
          setTimeout(() => {
            window.__handlingAuthExpiry = false;
          }, 2000);
        }, 1000);
      }
      
      // 抛出特定的错误消息
      throw new Error(data?.error || '登录已过期，请重新登录');
    }
    
    // 处理其他错误
    throw new Error(data?.error || '请求失败');
  }
  return data;
} 