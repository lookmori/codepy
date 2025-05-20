'use client';

import React from 'react';
import Link from 'next/link';
import Loading from './Loading';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  href,
  target,
  fullWidth = false,
  ...props
}) {
  // 按钮变体样式
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600',
    link: 'bg-transparent hover:underline text-blue-600 dark:text-blue-400',
    outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900',
    'outline-gray': 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  };

  // 按钮尺寸样式
  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm leading-4 px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-8 py-4',
  };

  // 禁用状态样式
  const disabledClass = disabled || loading
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : '';

  // 全宽按钮样式
  const widthClass = fullWidth ? 'w-full' : '';

  // 组合所有类名
  const buttonClass = `
    inline-flex items-center justify-center
    font-medium rounded-md 
    transition-colors duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabledClass}
    ${widthClass}
    ${className}
  `;

  // 加载状态的内容
  const loadingContent = loading && (
    <span className="mr-2">
      <Loading size="small" text="" />
    </span>
  );

  // 图标内容
  const iconContent = icon && !loading && (
    <span className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
      {icon}
    </span>
  );

  // 渲染链接按钮
  if (href) {
    return (
      <Link
        href={href}
        className={buttonClass}
        target={target}
        {...props}
      >
        {iconPosition === 'left' && iconContent}
        {loadingContent}
        {children}
        {iconPosition === 'right' && iconContent}
      </Link>
    );
  }

  // 渲染标准按钮
  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {iconPosition === 'left' && iconContent}
      {loadingContent}
      {children}
      {iconPosition === 'right' && iconContent}
    </button>
  );
}

// 为方便使用各种变体按钮，导出特定变体
export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}

export function SuccessButton(props) {
  return <Button variant="success" {...props} />;
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

export function OutlineButton(props) {
  return <Button variant="outline" {...props} />;
}

export function LinkButton(props) {
  return <Button variant="link" {...props} />;
} 