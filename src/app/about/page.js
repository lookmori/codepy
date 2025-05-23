'use client';

import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">关于我们</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">本网站介绍</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          本网站是一个基于 Next.js 和 Prisma ORM 构建的 Python 编程学习平台。我们提供在线编程练习环境，帮助您提升 Python 技能。
        </p>
        <p className="text-red-600 dark:text-red-400 font-semibold mt-4">
          请注意：本网站的题目和答案判定是依赖 AI 工具断定，可能会出现判定不正确的情况。如果您遇到这种情况，请不要担心，正常提交代码即可。我们会持续优化 AI 判定逻辑。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">关于我</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          我是一名少儿编程教师，擅长 Python、Scratch 图形化编程和机器人教育。我对前端开发也有浓厚的兴趣，这个网站就是使用 AI 工具辅助开发的成果。
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          欢迎有网站开发需求的朋友与我联系，共同探讨合作！
        </p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">联系方式：</h3>
          <p className="text-gray-600 dark:text-gray-300">邮箱：<a href="mailto:lookmori@163.com" className="text-blue-600 dark:text-blue-400 hover:underline">lookmori@163.com</a></p>
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-300 mb-2">微信：</p>
            <Image
              src="/wechat.png"
              alt="WeChat QR Code"
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}