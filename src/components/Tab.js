'use client';
import React from 'react';

/**
 * Tab 组件 - 用于创建标签页项
 * @param {Object} props - 组件属性
 * @param {string} props.label - 标签页标题
 * @param {string} [props.tabKey] - 标签页唯一标识
 * @param {boolean} [props.disabled=false] - 是否禁用
 * @param {ReactNode} props.children - 标签页内容
 */
const Tab = ({ label, tabKey, disabled = false, children }) => {
  return (
    <React.Fragment>
      {/* 此组件仅作为占位符，实际渲染由 Tabs 组件处理 */}
    </React.Fragment>
  );
};

export default Tab;
