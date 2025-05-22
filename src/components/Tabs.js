'use client';
import React, { useState, useRef, useEffect } from 'react';
import Tab from './Tab';

/**
 * Tabs 组件 - 用于创建标签页容器
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件 (必须是 Tab 组件)
 * @param {string} [props.defaultActiveKey] - 默认激活的标签页 key
 */
const Tabs = ({ children, defaultActiveKey }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || null);
  const tabsRef = useRef([]);
  
  // 过滤出所有的 Tab 组件
  const tabComponents = React.Children.toArray(children).filter(
    child => child.type === Tab
  );
  
  // 如果没有设置默认激活的标签页，默认激活第一个
  useEffect(() => {
    if (!activeKey && tabComponents.length > 0) {
      setActiveKey(tabComponents[0].props.key || tabComponents[0].props.label);
    }
  }, [activeKey, tabComponents.length, tabComponents]);
  
  // 处理标签页点击
  const handleTabClick = (key) => {
    setActiveKey(key);
  };

  return (
    <div className="my-6">
      <div className="flex border-b">
        {tabComponents.map((tab, index) => {
          const { label, key: tabKey = label, disabled } = tab.props;
          const isActive = activeKey === tabKey;
          
          return (
            <button
              key={tabKey}
              ref={el => tabsRef.current[index] = el}
              onClick={() => !disabled && handleTabClick(tabKey)}
              className={`px-4 py-2 border-b-2 transition-colors duration-200 font-medium text-sm focus:outline-none ${
                isActive 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={disabled}
            >
              {label}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4">
        {tabComponents.map((tab) => {
          const { key: tabKey = tab.props.label, children: tabContent } = tab.props;
          const isActive = activeKey === tabKey;
          
          return (
            <div 
              key={tabKey} 
              className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 absolute h-0 w-0 overflow-hidden'}`}
            >
              {isActive && tabContent}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
