'use client';

import React, { useState, useMemo } from 'react';
import Button from '../../components/Button';

const fakeExams = [
  { id: 1, name: 'Python初级考试', category: '编程语言', score: 95 },
  { id: 2, name: '英语四级模拟卷', category: '语言', score: 88 },
  { id: 3, name: '数学建模基础', category: '数学', score: 76 },
  { id: 4, name: '计算机组成原理', category: '计算机科学', score: 91 },
  { id: 5, name: '数据结构与算法', category: '计算机科学', score: 85 },
  { id: 6, name: '操作系统概论', category: '计算机科学', score: 79 },
  { id: 7, name: '线性代数', category: '数学', score: 92 },
  { id: 8, name: '大学物理', category: '物理', score: 80 },
  { id: 9, name: '概率论与数理统计', category: '数学', score: 87 },
  { id: 10, name: 'C++程序设计', category: '编程语言', score: 94 },
  { id: 11, name: 'Java编程入门', category: '编程语言', score: 89 },
  { id: 12, name: '离散数学', category: '数学', score: 78 },
  { id: 13, name: '软件工程导论', category: '计算机科学', score: 83 },
  { id: 14, name: '毛泽东思想概论', category: '政治', score: 98 },
  { id: 15, name: '大学语文', category: '语言', score: 75 },
  { id: 16, name: '高等数学', category: '数学', score: 90 },
  { id: 17, name: '算法设计与分析', category: '计算机科学', score: 93 },
  { id: 18, name: '编译原理', category: '计算机科学', score: 81 },
  { id: 19, name: '数据库系统概论', category: '计算机科学', score: 86 },
  { id: 20, name: '面向对象程序设计', category: '编程语言', score: 96 },
];

export default function ExamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 每页显示5个项目

  // 根据搜索词过滤试卷
  const filteredExams = useMemo(() => {
    return fakeExams.filter(exam =>
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // 计算当前页的试卷
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  // 计算总页数
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

  // 改变页码
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4 dark:bg-gray-800 text-gray-900 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">考级测试试卷列表</h1>

      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索试卷名或类别..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 试卷列表 */}
      <div className="bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">试卷名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">类别</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">分数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {currentExams.map((exam) => (
              <tr key={exam.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{exam.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{exam.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{exam.score}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    href={`/exam/${exam.id}`}
                    variant="primary"
                    size="sm"
                  >
                    去做试卷
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 rounded-md"
          variant={currentPage === 1 ? 'secondary' : 'primary'}
          size="sm"
        >
          上一页
        </Button>
        
        {[...Array(totalPages).keys()].map(number => (
          <Button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className="px-4 py-2 mx-1 rounded-md"
            variant={currentPage === number + 1 ? 'primary' : 'secondary'}
            size="sm"
          >
            {number + 1}
          </Button>
        ))}
        
        <Button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 rounded-md"
          variant={currentPage === totalPages ? 'secondary' : 'primary'}
          size="sm"
        >
          下一页
        </Button>
      </div>
    </div>
  );
}