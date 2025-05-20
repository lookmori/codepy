'use client';

import { useEffect } from 'react';
import { FullPageError } from '@/components/Error';

// 全局错误处理组件
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // 可以在这里记录错误到分析或日志服务
    console.error('全局错误:', error);
  }, [error]);

  return (
    <html lang="zh">
      <body>
        <FullPageError
          title="抱歉，出现了错误"
          message="应用程序遇到了意外问题，我们的团队已经收到通知。"
          error={error}
          retry={() => reset()}
        />
      </body>
    </html>
  );
} 