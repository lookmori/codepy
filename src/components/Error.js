'use client';

import React from 'react';

// 基础错误展示组件
export default function Error({ 
  title = '发生错误', 
  message = '请稍后再试', 
  error,
  retry,
  className = ''
}) {
  return (
    <div className={`rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md border border-red-100 dark:border-red-900 ${className}`} role="alert">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>{message}</p>
            {error && process.env.NODE_ENV !== 'production' && (
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-auto text-xs">
                <pre>{error.toString()}</pre>
              </div>
            )}
          </div>
          {retry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 全页面错误组件
export function FullPageError({ title, message, error, retry }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <Error
        title={title}
        message={message}
        error={error}
        retry={retry}
        className="max-w-lg w-full"
      />
    </div>
  );
}

// 未授权错误组件
export function Unauthorized({ message = '您没有权限访问此页面' }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="text-center">
        <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">访问受限</h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          返回上一页
        </button>
      </div>
    </div>
  );
} 