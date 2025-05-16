'use client';

import { useState } from 'react';

export default function Practice() {
  const [selectedLevel, setSelectedLevel] = useState('初级');
  const [selectedCategory, setSelectedCategory] = useState('前端');
  
  const levels = ['初级', '中级', '高级'];
  const categories = ['前端', '后端', '数据库', '算法', '机器学习'];
  
  // 模拟练习题数据
  const exercises = [
    { id: 1, title: 'HTML 基础结构练习', level: '初级', category: '前端', difficulty: '简单' },
    { id: 2, title: 'CSS 布局与响应式设计', level: '初级', category: '前端', difficulty: '中等' },
    { id: 3, title: 'JavaScript 变量与函数', level: '初级', category: '前端', difficulty: '简单' },
    { id: 4, title: 'React 组件状态管理', level: '中级', category: '前端', difficulty: '中等' },
    { id: 5, title: 'Node.js API 开发', level: '中级', category: '后端', difficulty: '中等' },
    { id: 6, title: 'SQL 查询优化', level: '中级', category: '数据库', difficulty: '困难' },
    { id: 7, title: '排序算法实现', level: '中级', category: '算法', difficulty: '中等' },
    { id: 8, title: '深度学习基础', level: '高级', category: '机器学习', difficulty: '困难' },
  ];
  
  // 根据筛选条件过滤练习题
  const filteredExercises = exercises.filter(exercise => 
    (selectedLevel === '全部' || exercise.level === selectedLevel) && 
    (selectedCategory === '全部' || exercise.category === selectedCategory)
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">在线练习</h1>
      
      {/* 筛选器 */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">难度等级</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedLevel('全部')}
                className={`px-4 py-2 rounded-md ${selectedLevel === '全部' ? 
                  'bg-blue-600 text-white' : 
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              >
                全部
              </button>
              {levels.map(level => (
                <button 
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-md ${selectedLevel === level ? 
                    'bg-blue-600 text-white' : 
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCategory('全部')}
                className={`px-4 py-2 rounded-md ${selectedCategory === '全部' ? 
                  'bg-blue-600 text-white' : 
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              >
                全部
              </button>
              {categories.map(category => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md ${selectedCategory === category ? 
                    'bg-blue-600 text-white' : 
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 练习题列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.length > 0 ? (
          filteredExercises.map(exercise => (
            <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${exercise.difficulty === '简单' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      exercise.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {exercise.category}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {exercise.level}
                  </span>
                </div>
                <button className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors dark:bg-blue-500 dark:hover:bg-blue-600">
                  开始练习
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
            没有找到符合条件的练习题
          </div>
        )}
      </div>
    </div>
  );
} 