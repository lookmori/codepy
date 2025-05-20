'use client';

import { useEffect } from 'react';
import { FullPageError } from '@/components/Error';

// 页面级错误边界
export default function Error({ error, reset }) {
  useEffect(() => {
    // 可以在这里记录错误
    console.error('页面错误:', error);
  }, [error]);

  return (
    <FullPageError
      title="页面加载出错"
      message="抱歉，加载此页面时出现问题。请尝试重新加载或回到首页。"
      error={error}
      retry={() => reset()}
    />
  );
} 