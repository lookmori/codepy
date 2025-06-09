'use client';

import { useEffect, useState, useRef } from 'react';
import { getCurrentTheme } from "@/utils/theme-helper";

const CustomerService = () => {
  const [darkMode, setDarkMode] = useState(false);
  const scriptLoadedRef = useRef(false);
  const clientInstanceRef = useRef(null);
  const tokenRef = useRef(null);
  
  // 获取Coze Token的函数
  const getCozeToken = async () => {
    try {
      const response = await fetch('/api/coze/token');
      if (!response.ok) {
        throw new Error(`获取Token失败: ${response.status}`);
      }
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('获取Coze Token出错:', error);
      // 如果API调用失败，回退到环境变量中的token
      return process.env.KEFU_COZE_TOKEN || '';
    }
  };
  
  useEffect(() => {
    // 避免在服务器端执行
    if (typeof window === 'undefined') return;
    
    // 初始化主题状态
    const themeState = getCurrentTheme();
    setDarkMode(themeState.isDark);
    
    // 监听主题变化
    const handleThemeChange = (event) => {
      setDarkMode(event?.detail?.isDark);
    };
    
    window.addEventListener('theme-changed', handleThemeChange);
    
    // 为Coze SDK添加全局日志记录器
    window.CozeLogger = {
      debug: (...args) => console.debug('[Coze Debug]', ...args),
      info: (...args) => console.info('[Coze Info]', ...args),
      warn: (...args) => console.warn('[Coze Warning]', ...args),
      error: (...args) => console.error('[Coze Error]', ...args)
    };
    
    // 确保页面上只有一个客服实例
    // 移除所有已存在的客服容器，除了我们当前的容器
    const removeExistingInstances = () => {
      const allContainers = document.querySelectorAll('[id^="coze-chat-container"]');
      const currentContainer = document.getElementById('coze-chat-container');
      
      allContainers.forEach(container => {
        if (container !== currentContainer && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
      
      // 移除所有可能存在的悬浮按钮
      const floatButtons = document.querySelectorAll('.coze-asst-btn');
      floatButtons.forEach(btn => {
        if (btn.parentNode) {
          btn.parentNode.removeChild(btn);
        }
      });
      
      // 移除所有可能存在的聊天窗口
      const chatWindows = document.querySelectorAll('.coze-chat-window');
      chatWindows.forEach(window => {
        if (window.parentNode) {
          window.parentNode.removeChild(window);
        }
      });
    };
    
    // 在初始化前清理已存在的实例
    removeExistingInstances();
    
    // 如果存在全局实例，先销毁
    if (window.cozeClientInstance && typeof window.cozeClientInstance.destroy === 'function') {
      window.cozeClientInstance.destroy();
      window.cozeClientInstance = null;
    }
    
    // 如果脚本已加载，则不再重复加载
    if (window.CozeWebSDK && scriptLoadedRef.current) {
      initChatClient();
      return;
    }
    
    // 检查脚本是否已存在
    const existingScript = document.querySelector('script[src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.1.0-beta.0/libs/cn/index.js"]');
    
    if (existingScript) {
      scriptLoadedRef.current = true;
      if (window.CozeWebSDK) {
        initChatClient();
      } else {
        existingScript.addEventListener('load', initChatClient);
      }
    } else {
      // 加载Coze SDK脚本
      const script = document.createElement('script');
      script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.1.0-beta.0/libs/cn/index.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        scriptLoadedRef.current = true;
        initChatClient();
      };
      
      script.onerror = (error) => {
        console.error('加载Coze客服SDK失败:', error);
      };
      
      document.body.appendChild(script);
    }
    
    // 初始化聊天客户端
    async function initChatClient() {
      if (!window.CozeWebSDK) {
        console.error('Coze SDK未正确加载');
        return;
      }
      
      try {
        // 从环境变量获取配置
        const botId = process.env.KEFU_COZE_BOT_ID || '7513756477526491177';
        
        // 获取token
        if (!tokenRef.current) {
          tokenRef.current = await getCozeToken();
        }
        
        // 如果没有获取到token，使用默认值
        const token = tokenRef.current || 'pat_pZjeAOYAWVqT7ybsfHvDi6Uil3qquEvIWAbjHyDVUUuljs6NOiWheIooePc5TqG7';
        
        // 如果已有实例，先销毁
        if (clientInstanceRef.current) {
          if (typeof clientInstanceRef.current.destroy === 'function') {
            clientInstanceRef.current.destroy();
          }
          clientInstanceRef.current = null;
        }
        
        // 创建新实例
        clientInstanceRef.current = new window.CozeWebSDK.WebChatClient({
          config: {
            bot_id: botId,
          },
          auth: { 
            type: 'token',
            token: token, 
            onRefreshToken: async () => {
              // 调用API获取新的token
              try {
                const newToken = await getCozeToken();
                tokenRef.current = newToken;
                return newToken;
              } catch (error) {
                console.error('刷新token失败:', error);
                return '';
              }
            }, 
          },
          userInfo: { 
            id: typeof localStorage !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.id || 'guest' : 'guest',
            url: 'https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.png', 
            nickname: typeof localStorage !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.name || '访客' : '访客',
          },
          ui: { 
            base: { 
              icon: 'https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.png', 
              layout: 'pc', 
              lang: 'zh-CN',
              zIndex: 1000,
              theme: darkMode ? 'dark' : 'light',
            },
            chatBot: {
              title: '编程客服小助手',
              uploadable: true,
              width: 390,
              el: document.getElementById('coze-chat-container'),
            }, 
            asstBtn: { 
              isNeed: true,
              position: 'right', // 确保按钮位置一致
            }, 
            footer: { 
              isShow: true, 
              expressionText: '由{{name}}提供。内容均由 AI 生成，仅供参考', 
              linkvars: { 
                name: { 
                  text: 'CodePy', // 修改为您的网站名称
                  link: window.location.origin // 使用当前网站URL
                }
              } 
            } 
          },
          // 添加日志配置
          logger: window.CozeLogger,
          // 添加错误处理
          errorHandler: (error) => {
            console.error('Coze客服错误:', error);
          }
        });
        
        // 保存到全局变量，方便后续管理
        window.cozeClientInstance = clientInstanceRef.current;
        
        // 添加事件监听（如果SDK支持）
        if (clientInstanceRef.current.on) {
          clientInstanceRef.current.on('message', (message) => {
            console.log('收到消息:', message);
            // 可以在这里添加消息分析、用户行为跟踪等
          });
          
          clientInstanceRef.current.on('error', (error) => {
            console.error('Coze客服错误事件:', error);
          });
          
          // 监听窗口打开事件
          clientInstanceRef.current.on('open', () => {
            console.log('客服窗口已打开');
            // 确保不会有多个窗口
            removeExistingInstances();
          });
        }
      } catch (error) {
        console.error('初始化Coze客服失败:', error);
      }
    }
    
    // 组件卸载时清理
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
      
      // 清理实例
      if (clientInstanceRef.current && typeof clientInstanceRef.current.destroy === 'function') {
        clientInstanceRef.current.destroy();
      }
      clientInstanceRef.current = null;
      
      // 清理全局实例
      if (window.cozeClientInstance && typeof window.cozeClientInstance.destroy === 'function') {
        window.cozeClientInstance.destroy();
      }
      window.cozeClientInstance = null;
    };
  }, [darkMode]); // 仅在darkMode变化时重新执行

  // 使用固定定位，将客服组件放置在页面右侧上方位置
  return (
    <div 
      id="coze-chat-container" 
      style={{ 
        position: 'fixed', 
        right: '20px', 
        top: '180px',
        transform: 'none',
        zIndex: 1000,
        height: 400,
        width: 390
      }}
      aria-label="编程客服小助手"
    />
  );
};

export default CustomerService; 