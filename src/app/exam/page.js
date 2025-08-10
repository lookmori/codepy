'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useToast } from '@/components/Toast';


const COZE_CLIENT_ID = process.env.NEXT_PUBLIC_GEN_EXAM_COZE_CLIENT_ID || '90242169603687806132942397704438.app.coze';
const COZE_REDIRECT_URI = process.env.NEXT_PUBLIC_GEN_EXAM_REDIRECT_URI || 'https://www.code.lookmori.cn/exam';
const COZE_AUTH_URL = `https://www.coze.cn/api/permission/oauth2/authorize?response_type=code&client_id=${COZE_CLIENT_ID}&redirect_uri=${encodeURIComponent(COZE_REDIRECT_URI)}&state=exam`;
const COZE_WORKFLOW_ID = process.env.NEXT_PUBLIC_GEN_EXAM_WORKFLOW_ID || '7487949711161442367'; // 使用考试专用的工作流ID



export default function ExamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 每页显示5个项目
  const [showModal, setShowModal] = useState(false);
  const [examContent, setExamContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [pendingExam, setPendingExam] = useState(null);
  const [examResult, setExamResult] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shouldAutoExecute, setShouldAutoExecute] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingExamId, setDeletingExamId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // 添加请求标记ref，防止重复请求
  const tokenRequestSentRef = useRef(false);

  const { addToast } = useToast();

  // 总页数从服务端获取
  const [totalPages, setTotalPages] = useState(1);

  // 改变页码
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 检查用户是否为管理员
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setIsAdmin(user?.isAdmin || false);
    } catch (error) {
      setIsAdmin(false);
    }
  }, []);

  // 加载试卷数据
  const loadExams = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search })
      });

      const response = await fetch(`/api/exams?${params}`);
      const data = await response.json();

      if (data.success) {
        setExams(data.exams);
        setTotalPages(data.pagination.totalPages);
      } else {
        addToast({
          title: '加载失败',
          message: '无法加载试卷列表',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('加载试卷失败:', error);
      addToast({
        title: '加载失败',
        message: '网络错误，请稍后重试',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载试卷数据
  useEffect(() => {
    loadExams(currentPage, searchTerm);
  }, [currentPage, itemsPerPage]);

  // 搜索防抖处理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        loadExams(1, searchTerm);
      } else {
        setCurrentPage(1); // 重置到第一页，会触发上面的 useEffect
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // 检查URL code参数，自动换取access_token
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    // 如果已经发送过请求，或者没有code参数，或者已经有token，则不再发送请求
    if (tokenRequestSentRef.current || !code || accessToken) {
      return;
    }

    // 标记已发送请求
    tokenRequestSentRef.current = true;

    fetch('/api/coze-oauth-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setAccessToken(data.access_token);
          localStorage.setItem('coze_access_token', data.access_token);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.pathname);
          // 检查 localStorage 是否有 pendingExam
          const pending = localStorage.getItem('pendingExam');
          if (pending) {
            setExamContent(pending);
            setShowModal(true);
            setShouldAutoExecute(true); // 只设置标志，不直接执行
          }
        } else {
          addToast({
            title: '认证失败',
            message: '获取access_token失败: ' + (data.error || '未知错误'),
            type: 'danger',
          });
        }
      })
      .catch(error => {
        console.error('Token请求失败:', error);
        addToast({
          title: '请求错误',
          message: '获取token时发生错误',
          type: 'danger',
        });
      })
      .finally(() => {
        // 请求完成后，如果没有获取到token，重置标记以允许重试
        if (!localStorage.getItem('coze_access_token')) {
          tokenRequestSentRef.current = false;
        }
      });
  }, [addToast, accessToken]);

  // 在组件卸载时重置请求标记
  useEffect(() => {
    return () => {
      tokenRequestSentRef.current = false;
    };
  }, []);

  // 初始化时检查localStorage中是否已有token
  useEffect(() => {
    const token = localStorage.getItem('coze_access_token');
    if (token) setAccessToken(token);
  }, []);

  // 监听 shouldAutoExecute+accessToken+examContent，满足条件时自动执行
  useEffect(() => {
    if (shouldAutoExecute && accessToken && examContent) {
      generateExam();
      setShouldAutoExecute(false);
      localStorage.removeItem('pendingExam');
    }
  }, [shouldAutoExecute, accessToken, examContent]);

  // 生成试卷
  const generateExam = async () => {
    if (!accessToken) {
      // 存储内容和标志到 localStorage
      localStorage.setItem('pendingExam', examContent);
      setPendingExam(examContent);
      window.location.href = COZE_AUTH_URL;
      return;
    }
    if (!examContent.trim()) {
      addToast({
        title: '输入错误',
        message: '请输入试卷生成要求',
        type: 'warning',
      });
      return;
    }
    setGenerating(true);
    try {
      console.log(accessToken, 'accessToken')

      const res = await fetch('https://api.coze.cn/v1/workflow/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: COZE_WORKFLOW_ID,
          parameters: {
            input: examContent.trim(),
          },
        }),
      });
      const data = await res.json();
      console.log('Coze工作流原始响应:', data);
      if (!res.ok) {
        if (res.status === 401) {
          setAccessToken(null);
          localStorage.removeItem('coze_access_token');
          localStorage.setItem('pendingExam', examContent);
          setPendingExam(examContent);
          window.location.href = COZE_AUTH_URL;
          setGenerating(false);
          return;
        }
        setErrorMsg(data.error || data.msg || '工作流执行失败');
        setShowModal(false);
        setExamContent('');
        setPendingExam(null);
        setGenerating(false);
        return;
      }

      // 处理返回的数据
      if (data.data) {
        try {
          // 解析返回的JSON字符串
          console.log('Coze工作流 data.data 字符串:', data.data);
          const parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          console.log('Coze工作流 data.data 解析后:', parsedData);

          // 创建试卷数据结构
          const examData = {
            name: `Python编程考试 ${new Date().toLocaleDateString()}`,
            description: '本试卷包含编程题、判断题和选择题三部分',
            category: '编程语言',
            difficulty: '中等',
            duration: 60, // 默认60分钟
            totalScore: 100,
            passingScore: 60,
            questions: []
          };

          // 处理编程题
          if (parsedData.bian && Array.isArray(parsedData.bian)) {
            parsedData.bian.forEach((item, index) => {
              examData.questions.push({
                title: `编程题 ${index + 1}`,
                content: item.problem,
                type: 'PROGRAMMING',
                score: 20,
                options: [],
                requirements: item.require || [],
                inputExample: item.input || '',
                outputExample: item.out || '',
                answer: '',
                explanation: '',
                orderIndex: examData.questions.length,
              });
            });
          }

          // 处理判断题
          if (parsedData.pan && Array.isArray(parsedData.pan)) {
            parsedData.pan.forEach((item, index) => {
              examData.questions.push({
                title: `判断题 ${index + 1}`,
                content: item.problem,
                type: 'TRUE_FALSE',
                score: 2,
                options: ['正确', '错误'],
                answer: item.ans ? '正确' : '错误',
                explanation: '',
                orderIndex: examData.questions.length,
              });
            });
          }

          // 处理选择题
          if (parsedData.xuan && Array.isArray(parsedData.xuan)) {
            parsedData.xuan.forEach((item, index) => {
              const options = item.options.map(opt => {
                // 提取选项内容，去掉"A: "这样的前缀
                const match = opt.match(/[A-D]:\s*"?([^"]*)"?/);
                return match ? match[1] : opt;
              });

              examData.questions.push({
                title: `选择题 ${index + 1}`,
                content: item.problem,
                type: 'SINGLE_CHOICE',
                score: 3,
                options: options,
                answer: item.ans,
                explanation: '',
                orderIndex: examData.questions.length,
              });
            });
          }

          // 设置试卷结果
          setExamResult([examData]);
          setShowResultModal(true);
        } catch (e) {
          console.error('解析工作流数据失败:', e);
          addToast({
            title: '解析错误',
            message: '工作流 data 字段解析失败: ' + e.message,
            type: 'danger',
          });
          setShowModal(false);
          setExamContent('');
          setPendingExam(null);
          setGenerating(false);
          return;
        }
      } else {
        addToast({
          title: '结果异常',
          message: '未获取到试卷数据，请检查工作流返回格式。',
          type: 'warning',
        });
        setShowModal(false);
        setExamContent('');
        setPendingExam(null);
        setGenerating(false);
        return;
      }
    } catch (err) {
      addToast({
        title: '请求失败',
        message: '请求出错: ' + err.message,
        type: 'danger',
      });
    }
    setGenerating(false);
    setShowModal(false);
    setExamContent('');
    setPendingExam(null);
    localStorage.removeItem('pendingExam');
  };

  // 删除单个试题
  const handleDeleteQuestion = (index) => {
    setExamResult(prev => prev.filter((_, i) => i !== index));
  };

  // 导入数据库
  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/import-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: examResult }),
      });
      if (!res.ok) throw new Error('导入失败');
      addToast({
        title: '导入成功',
        message: '试卷数据已成功导入！',
        type: 'success',
      });
      setShowResultModal(false);
      setExamResult([]);
      // 导入成功后刷新试卷列表
      loadExams(currentPage, searchTerm);
    } catch (e) {
      addToast({
        title: '导入失败',
        message: e.message,
        type: 'danger',
      });
    }
    setImporting(false);
  };

  // 确认删除试卷
  const confirmDeleteExam = (exam) => {
    setExamToDelete(exam);
    setShowDeleteConfirm(true);
  };

  // 删除试卷
  const handleDeleteExam = async () => {
    if (!examToDelete) return;

    setDeletingExamId(examToDelete.id);
    try {
      const response = await fetch(`/api/exams/${examToDelete.id}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addToast({
          title: '删除成功',
          message: data.message,
          type: 'success',
        });
        // 刷新试卷列表
        loadExams(currentPage, searchTerm);
      } else {
        addToast({
          title: '删除失败',
          message: data.error || '删除试卷时发生错误',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('删除试卷失败:', error);
      addToast({
        title: '删除失败',
        message: '网络错误，请稍后重试',
        type: 'danger',
      });
    } finally {
      setDeletingExamId(null);
      setShowDeleteConfirm(false);
      setExamToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-4 dark:bg-gray-800 text-gray-900 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">考级测试试卷列表</h1>

      {/* 搜索框和生成试卷按钮 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <input
          type="text"
          placeholder="搜索试卷名或类别..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isAdmin && (
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            className="whitespace-nowrap"
          >
            生成试卷
          </Button>
        )}
      </div>

      {/* 试卷列表 */}
      <div className="bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">加载中...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? '没有找到匹配的试卷' : '暂无试卷数据'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">试卷名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">类别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">难度</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">题目数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">总分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">时长</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{exam.name}</div>
                    {exam.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {exam.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {exam.category || '未分类'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${exam.difficulty === '简单' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        exam.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          exam.difficulty === '困难' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                      {exam.difficulty || '未知'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {exam.questionCount || 0}题
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {exam.totalScore}分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {exam.duration}分钟
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        href={`/exam/${exam.id}`}
                        variant="primary"
                        size="sm"
                      >
                        开始考试
                      </Button>
                      {isAdmin && (
                        <Button
                          onClick={() => confirmDeleteExam(exam)}
                          variant="danger"
                          size="sm"
                          disabled={deletingExamId === exam.id}
                        >
                          {deletingExamId === exam.id ? '删除中...' : '删除'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页控件 */}
      {!loading && exams.length > 0 && totalPages > 1 && (
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
      )}

      {/* 生成试卷模态框 */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="生成试卷">
          <div className="mb-6">
            <label htmlFor="examContent" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              输入试卷内容
            </label>
            <textarea
              id="examContent"
              rows="5"
              value={examContent}
              onChange={(e) => setExamContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="请输入试卷内容或要求..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              className="mr-3"
              onClick={() => setShowModal(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={generateExam}
              disabled={generating}
            >
              {generating ? '生成中...' : '生成试卷'}
            </Button>
          </div>
        </Modal>
      )}

      {/* 工作流结果模态框 */}
      {showResultModal && (
        <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="试卷生成结果" size="lg">
          <div className="space-y-6">
            {examResult.map((exam, index) => (
              <div
                key={exam.id || index}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exam.name}</h3>
                  <Button
                    onClick={() => handleDeleteQuestion(index)}
                    variant="danger"
                    size="sm"
                    className="ml-2"
                  >
                    删除
                  </Button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300">{exam.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      类别: {exam.category}
                    </span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                      难度: {exam.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                      时长: {exam.duration}分钟
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                      总分: {exam.totalScore}分
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                      及格分: {exam.passingScore}分
                    </span>
                  </div>
                </div>

                {/* 题目预览 */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">题目预览 (共{exam.questions.length}题)</h4>

                  <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                    {/* 编程题 */}
                    {exam.questions.filter(q => q.type === 'PROGRAMMING').length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">编程题 ({exam.questions.filter(q => q.type === 'PROGRAMMING').length}题)</h5>
                        {exam.questions.filter(q => q.type === 'PROGRAMMING').map((q, idx) => (
                          <div key={idx} className="mb-3 p-3 bg-white dark:bg-gray-700 rounded border-l-4 border-blue-500">
                            <div className="font-medium">{q.title}: {q.content}</div>
                            {q.requirements && q.requirements.length > 0 && (
                              <div className="mt-1 text-sm">
                                <span className="font-medium">要求:</span>
                                <ul className="list-disc pl-5 mt-1">
                                  {q.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {q.inputExample && (
                              <div className="mt-1 text-sm">
                                <span className="font-medium">输入示例:</span>
                                <code className="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{q.inputExample}</code>
                              </div>
                            )}
                            {q.outputExample && (
                              <div className="mt-1 text-sm">
                                <span className="font-medium">输出示例:</span>
                                <code className="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{q.outputExample}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 判断题 */}
                    {exam.questions.filter(q => q.type === 'TRUE_FALSE').length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">判断题 ({exam.questions.filter(q => q.type === 'TRUE_FALSE').length}题)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {exam.questions.filter(q => q.type === 'TRUE_FALSE').map((q, idx) => (
                            <div key={idx} className="p-2 bg-white dark:bg-gray-700 rounded border-l-4 border-green-500">
                              <div className="text-sm">{q.title}: {q.content}</div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">答案: {q.answer}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 选择题 */}
                    {exam.questions.filter(q => q.type === 'SINGLE_CHOICE').length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-2">选择题 ({exam.questions.filter(q => q.type === 'SINGLE_CHOICE').length}题)</h5>
                        {exam.questions.filter(q => q.type === 'SINGLE_CHOICE').map((q, idx) => (
                          <div key={idx} className="mb-3 p-3 bg-white dark:bg-gray-700 rounded border-l-4 border-purple-500">
                            <div className="font-medium">{q.title}: {q.content}</div>
                            <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                              {q.options.map((opt, i) => (
                                <div key={i} className={`px-2 py-1 rounded ${q.answer === String.fromCharCode(65 + i) ? 'bg-purple-100 dark:bg-purple-900' : ''}`}>
                                  {String.fromCharCode(65 + i)}: {opt}
                                </div>
                              ))}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">答案: {q.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-center mt-4">
            <Button
              onClick={handleImport}
              disabled={importing || examResult.length === 0}
              variant="primary"
              className="w-40"
            >
              {importing ? '导入中...' : '导入数据库'}
            </Button>
          </div>
        </Modal>
      )}

      {/* 错误提示模态框 */}
      {errorMsg && (
        <Modal isOpen={!!errorMsg} onClose={() => setErrorMsg('')} title="错误">
          <div className="text-red-600 dark:text-red-400 mb-4">{errorMsg}</div>
          <div className="flex justify-end">
            <Button onClick={() => setErrorMsg('')} variant="secondary">关闭</Button>
          </div>
        </Modal>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && examToDelete && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="确认删除试卷"
        >
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              您确定要删除试卷 <strong>"{examToDelete.name}"</strong> 吗？
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    警告
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>此操作将永久删除该试卷</li>
                      <li>该试卷下的所有 {examToDelete.questionCount || 0} 道题目也将被删除</li>
                      <li>此操作不可撤销</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="secondary"
              disabled={deletingExamId === examToDelete.id}
            >
              取消
            </Button>
            <Button
              onClick={handleDeleteExam}
              variant="danger"
              disabled={deletingExamId === examToDelete.id}
            >
              {deletingExamId === examToDelete.id ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}