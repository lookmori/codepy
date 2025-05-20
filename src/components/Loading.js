'use client';

import React from 'react';

export default function Loading({ size = 'medium', text = '加载中...' }) {
  // 根据size参数确定加载图标的大小
  const sizeClass = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  }[size] || 'h-8 w-8';

  return (
    <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
      <div className="relative">
        {/* 加载动画效果 */}
        <div className={`animate-spin rounded-full border-b-2 border-gray-900 dark:border-white ${sizeClass}`}></div>
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 absolute top-0 left-0 opacity-30 ${sizeClass}`}></div>
      </div>
      {text && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}

// 也导出一个全屏加载组件
export function FullPageLoading({ text }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 z-50">
      <Loading size="large" text={text} />
    </div>
  );
}

// 页面骨架屏组件，用于内容加载中的预览
export function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
      </div>
    </div>
  );
}

// 表格骨架屏
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  );
} 