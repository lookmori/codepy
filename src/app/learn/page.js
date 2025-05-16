'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Learn() {
  const [activeTab, setActiveTab] = useState('courses');
  
  // 模拟课程数据
  const courses = [
    {
      id: 1,
      title: 'Web前端开发基础',
      description: '学习HTML、CSS和JavaScript的基础知识，构建响应式网页。',
      lessons: 12,
      duration: '8小时',
      level: '初级',
      image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Web前端开发'
    },
    {
      id: 2,
      title: 'React实战开发',
      description: '学习React框架，掌握组件化开发和状态管理。',
      lessons: 15,
      duration: '10小时',
      level: '中级',
      image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=React开发'
    },
    {
      id: 3,
      title: 'Node.js后端开发',
      description: '使用Node.js构建高性能后端服务和API。',
      lessons: 14,
      duration: '12小时',
      level: '中级',
      image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Node.js开发'
    },
    {
      id: 4,
      title: '数据库设计与优化',
      description: '学习关系型和NoSQL数据库的设计原则和优化技巧。',
      lessons: 10,
      duration: '8小时',
      level: '中级',
      image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=数据库设计'
    }
  ];
  
  // 模拟文章数据
  const articles = [
    {
      id: 1,
      title: 'JavaScript中的异步编程',
      summary: '探讨JavaScript中的Promise、async/await以及异步编程模式。',
      date: '2023-05-12',
      author: '李明',
      readTime: '8分钟'
    },
    {
      id: 2,
      title: 'React性能优化指南',
      summary: '学习如何优化React应用性能，提高用户体验。',
      date: '2023-06-05',
      author: '王芳',
      readTime: '12分钟'
    },
    {
      id: 3,
      title: 'CSS布局技巧：Flexbox vs Grid',
      summary: '比较Flexbox和Grid布局系统，学习何时使用它们。',
      date: '2023-06-18',
      author: '张伟',
      readTime: '10分钟'
    },
    {
      id: 4,
      title: 'Web安全最佳实践',
      summary: '保护您的Web应用免受常见安全威胁的指南。',
      date: '2023-07-02',
      author: '刘强',
      readTime: '15分钟'
    }
  ];
  
  // 模拟视频数据
  const videos = [
    {
      id: 1,
      title: 'JavaScript基础知识',
      duration: '45:30',
      views: '12,345',
      date: '2023-04-10',
      thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=JavaScript基础'
    },
    {
      id: 2,
      title: 'CSS动画详解',
      duration: '32:15',
      views: '8,721',
      date: '2023-05-22',
      thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=CSS动画'
    },
    {
      id: 3,
      title: 'React Hooks完全指南',
      duration: '58:20',
      views: '15,632',
      date: '2023-06-14',
      thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=React Hooks'
    },
    {
      id: 4,
      title: 'Node.js与Express框架入门',
      duration: '50:45',
      views: '9,876',
      date: '2023-07-05',
      thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Node.js Express'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">学习中心</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">提升您的技能，探索我们丰富的学习资源</p>
      
      {/* 选项卡 */}
      <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-3 px-6 font-medium ${
            activeTab === 'courses'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          课程
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`py-3 px-6 font-medium ${
            activeTab === 'articles'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          文章
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`py-3 px-6 font-medium ${
            activeTab === 'videos'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          视频
        </button>
      </div>
      
      {/* 课程内容 */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{course.description}</p>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{course.lessons} 课时</span>
                  <span>{course.duration}</span>
                  <span>{course.level}</span>
                </div>
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors dark:bg-blue-500 dark:hover:bg-blue-600">
                  开始学习
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 文章内容 */}
      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map(article => (
            <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{article.summary}</p>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{article.date}</span>
                <span>作者: {article.author}</span>
                <span>阅读时间: {article.readTime}</span>
              </div>
              <button className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors dark:bg-blue-500 dark:hover:bg-blue-600">
                阅读全文
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* 视频内容 */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{video.duration}</span>
                  <span>{video.views} 次观看</span>
                  <span>{video.date}</span>
                </div>
                <button className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors dark:bg-blue-500 dark:hover:bg-blue-600">
                  观看视频
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 