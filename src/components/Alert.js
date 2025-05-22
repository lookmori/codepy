'use client';
import React from 'react';
import classnames from 'classnames';

// 支持的变体类型
const variants = {
  info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700',
  success: 'bg-green-50 border-l-4 border-green-400 text-green-700',
  warning: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700',
  danger: 'bg-red-50 border-l-4 border-red-400 text-red-700',
};

/**
 * Alert 组件 - 用于显示提示信息
 * @param {Object} props - 组件属性
 * @param {string} [props.variant="info"] - 提示类型: 'info', 'success', 'warning', 'danger'
 * @param {string} [props.title] - 提示标题
 * @param {ReactNode} props.children - 提示内容
 */
const Alert = ({ variant = 'info', title, children }) => {
  // 检查变体是否有效
  if (!variants[variant]) {
    console.warn(`Invalid Alert variant: ${variant}. Using 'info' instead.`);
    variant = 'info';
  }

  return (
    <div className={classnames('p-4 my-4 rounded-md shadow-md', variants[variant])}>
      <div className="flex">
        <div className="flex-shrink-0">
          {variant === 'info' && <i className="fa fa-info-circle text-blue-500"></i>}
          {variant === 'success' && <i className="fa fa-check-circle text-green-500"></i>}
          {variant === 'warning' && <i className="fa fa-exclamation-triangle text-yellow-500"></i>}
          {variant === 'danger' && <i className="fa fa-exclamation-circle text-red-500"></i>}
        </div>
        <div className="ml-3">
          {title && (
            <p className="font-medium">
              {variant === 'info' && 'Info'}
              {variant === 'success' && 'Success'}
              {variant === 'warning' && 'Warning'}
              {variant === 'danger' && 'Danger'}
              {title && ': '}
              {title}
            </p>
          )}
          <p className="text-sm mt-1">{children}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
