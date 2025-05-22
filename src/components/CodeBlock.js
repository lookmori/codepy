'use client';
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ClipboardJS from 'clipboard';

/**
 * CodeBlock 组件 - 用于显示带语法高亮的代码块
 * @param {Object} props - 组件属性
 * @param {string} props.language - 代码语言
 * @param {string} props.children - 代码内容
 */
const CodeBlock = ({ language, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    // 初始化复制功能
    const clipboard = new ClipboardJS('.copy-button', {
      text: (trigger) => {
        return trigger.previousElementSibling.textContent;
      }
    });
    
    // 复制成功回调
    clipboard.on('success', () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
    
    // 清理函数
    return () => {
      clipboard.destroy();
    };
  }, []);

  return (
    <div className="relative rounded-md overflow-hidden shadow-md my-4">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-gray-300 text-sm font-medium">{language}</span>
        <button 
          className="copy-button text-gray-400 hover:text-white transition-colors duration-200"
          title="Copy to clipboard"
        >
          {isCopied ? (
            <i className="fa fa-check"></i>
          ) : (
            <i className="fa fa-clipboard"></i>
          )}
        </button>
      </div>
      <SyntaxHighlighter 
        language={language} 
        style={atomDark}
        className="rounded-b-md overflow-x-auto"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
