'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { fetchWithThrow } from '@/lib/fetchWithThrow';
import { Suspense } from 'react';
import PageLoading from '@/app/loading';

const COZE_CLIENT_ID = '90242169603687806132942397704438.app.coze';
const COZE_REDIRECT_URI = 'http://localhost:3000/practice';
const COZE_AUTH_URL = `https://www.coze.cn/api/permission/oauth2/authorize?response_type=code&client_id=${COZE_CLIENT_ID}&redirect_uri=${encodeURIComponent(COZE_REDIRECT_URI)}&state=practice`;
const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || '7487949711161442367';

function PracticeContent() {
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [workflowContent, setWorkflowContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // 临时设为true以展示功能，实际应基于用户角色
  const [accessToken, setAccessToken] = useState(null);
  const [pendingWorkflow, setPendingWorkflow] = useState(null);
  const [workflowResult, setWorkflowResult] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [shouldAutoExecute, setShouldAutoExecute] = useState(false);
  
  const levels = ['初级', '中级', '高级'];
  const categories = ['前端', '后端', '数据库', '算法', '机器学习'];
  
  const { addToast } = useToast();
  
  // 加载真实题目数据
  useEffect(() => {
    fetchWithThrow('/api/exercises')
      .then(data => {
        setExercises(data.exercises || []);
        setLoading(false);
      })
      .catch(err => { throw err; });
  }, []);
  
  // 根据筛选条件过滤练习题
  const filteredExercises = exercises.filter(exercise => 
    (selectedLevel === '全部' || exercise.level === selectedLevel) && 
    (selectedCategory === '全部' || exercise.category === selectedCategory) &&
    (searchQuery === '' || exercise.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // 计算分页
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
  
  // 分页导航
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // 当筛选条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevel, selectedCategory, searchQuery]);
  
  // 执行工作流
  const executeWorkflow = async () => {
    if (!accessToken) {
      // 存储内容和标志到 localStorage
      localStorage.setItem('pendingWorkflow', workflowContent);
      setPendingWorkflow(workflowContent);
      window.location.href = COZE_AUTH_URL;
      return;
    }
    if (!workflowContent.trim()) {
      addToast({
        title: '输入错误',
        message: '请输入工作流内容（input）',
        type: 'warning',
      });
      return;
    }
    setExecuting(true);
    try {
      const res = await fetch('https://api.coze.cn/v1/workflow/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: COZE_WORKFLOW_ID,
          parameters: {
            input: workflowContent.trim(),
          },
        }),
      });
      const data = await res.json();
      console.log('Coze工作流原始响应:', data);
      if (!res.ok) {
        if (res.status === 401) {
          setAccessToken(null);
          localStorage.removeItem('coze_access_token');
          localStorage.setItem('pendingWorkflow', workflowContent);
          setPendingWorkflow(workflowContent);
          window.location.href = COZE_AUTH_URL;
          setExecuting(false);
          return;
        }
        setErrorMsg(data.error || data.msg || '工作流执行失败');
        setShowModal(false);
        setWorkflowContent('');
        setPendingWorkflow(null);
        setExecuting(false);
        return;
      }
      let questions = [];
      if (typeof data.data === 'string') {
        try {
          console.log('Coze工作流 data.data 字符串:', data.data);
          const parsed = JSON.parse(data.data);
          console.log('Coze工作流 data.data 解析后:', parsed);
          if (Array.isArray(parsed.output)) {
            questions = parsed.output;
            console.log('Coze工作流解析后 output:', parsed.output);
          }
        } catch (e) {
          addToast({
            title: '解析错误',
            message: '工作流 data 字段解析失败: ' + e.message,
            type: 'danger',
          });
          setShowModal(false);
          setWorkflowContent('');
          setPendingWorkflow(null);
          setExecuting(false);
          return;
        }
      }
      if (!questions.length) {
        addToast({
          title: '结果异常',
          message: '未获取到问题数据，请检查工作流返回格式。',
          type: 'warning',
        });
        setShowModal(false);
        setWorkflowContent('');
        setPendingWorkflow(null);
        setExecuting(false);
        return;
      }
      setWorkflowResult(questions);
      setShowResultModal(true);
    } catch (err) {
      addToast({
        title: '请求失败',
        message: '请求出错: ' + err.message,
        type: 'danger',
      });
    }
    setExecuting(false);
    setShowModal(false);
    setWorkflowContent('');
    setPendingWorkflow(null);
    localStorage.removeItem('pendingWorkflow');
  };
  
  // 检查URL code参数，自动换取access_token
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code && !accessToken) {
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
            // 检查 localStorage 是否有 pendingWorkflow
            const pending = localStorage.getItem('pendingWorkflow');
            if (pending) {
              setWorkflowContent(pending);
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
        });
    } else {
      const token = localStorage.getItem('coze_access_token');
      if (token) setAccessToken(token);
    }
  }, []);
  
  // 新增：监听 shouldAutoExecute+accessToken+workflowContent，满足条件时自动执行
  useEffect(() => {
    if (shouldAutoExecute && accessToken && workflowContent) {
      executeWorkflow();
      setShouldAutoExecute(false);
      localStorage.removeItem('pendingWorkflow');
      }
  }, [shouldAutoExecute, accessToken, workflowContent]);

  // 检查用户是否为管理员的逻辑，实际应用中应根据用户认证信息
  useEffect(() => {
    // 这里应该是从localStorage或会话存储中获取用户信息并检查角色
    const checkAdmin = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setIsAdmin(user?.isAdmin || true);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  // 删除单个问题
  const handleDeleteQuestion = (index) => {
    setWorkflowResult(prev => prev.filter((_, i) => i !== index));
  };

  // 导入数据库
  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/import-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: workflowResult }),
      });
      if (!res.ok) throw new Error('导入失败');
      addToast({
        title: '导入成功',
        message: '题目数据已成功导入！',
        type: 'success',
      });
      setShowResultModal(false);
      setWorkflowResult([]);
      // 导入成功后刷新题目列表
      setLoading(true);
      fetch('/api/exercises')
        .then(res => res.json())
        .then(data => {
          setExercises(data.exercises || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (e) {
      addToast({
        title: '导入失败',
        message: e.message,
        type: 'danger',
      });
    }
    setImporting(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-8 text-center">在线练习</h1>
      
      {/* 搜索栏 */}
      <div className="mb-8 mx-auto max-w-3xl">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="搜索题目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button
            className="absolute right-0 top-0 h-full px-4 text-white bg-blue-600 rounded-r-md hover:bg-blue-700 transition-colors"
            onClick={() => setSearchQuery(searchQuery)}
            variant="primary"
            size="sm"
          >
            搜索
          </Button>
        </div>
      </div>
      
      {/* 表格视图 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                序号
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                标题
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                难度
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                标签
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  加载中...
                </td>
              </tr>
            ) : currentExercises.length > 0 ? (
              currentExercises.map((exercise, index) => (
                <tr key={exercise.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {indexOfFirstExercise + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    <Link href={`/practice/${exercise.id}`}>{exercise.title}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${exercise.difficulty === '简单' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        exercise.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {exercise.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* 状态：未作/已通过/已提交/错误，未作为灰色，已通过为绿色，已提交为蓝色，错误为红色 */}
                    {exercise.status === '已通过' ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">已通过</span>
                    ) : exercise.status === '已提交' ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">已提交</span>
                    ) : exercise.status === '错误' ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">错误</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">未作</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {exercise.problem_tag && exercise.problem_tag.split(',').map((tag) => (
                        <span
                          key={tag.trim()}
                          className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag.trim()}
                      </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  暂无问题数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 分页控件 */}
      {filteredExercises.length > 0 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
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
          </nav>
        </div>
      )}
      
      {/* 悬浮按钮 - 只对管理员显示 */}
      {isAdmin && (
        <Button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
          aria-label="执行工作流"
          variant="primary"
          size="lg"
          style={{ borderRadius: '50%' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Button>
      )}
      
      {/* 工作流模态框 */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="工作流内容">
          <div className="mb-6">
            <label htmlFor="workflow" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              输入工作流内容
            </label>
            <textarea
              id="workflow"
              rows="5"
              value={workflowContent}
              onChange={(e) => setWorkflowContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="请输入工作流 input 内容..."
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
              onClick={executeWorkflow}
              disabled={executing}
            >
              {executing ? '执行中...' : '执行工作流'}
            </Button>
          </div>
        </Modal>
      )}

      {/* 工作流结果模态框 */}
      {showResultModal && (
        <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="工作流结果">
          <div>
            {workflowResult.map((q) => (
              <div
                key={q.id || q.title}
                className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow flex flex-col"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-gray-900 dark:text-white">{q.title}</span>
                  <Button
                    onClick={() => handleDeleteQuestion(q.id || q.title)}
                    variant="danger"
                    size="sm"
                    className="ml-2"
                  >
                    删除
                  </Button>
                </div>
                <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">{q.problem_description}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>难度: <span className="font-semibold text-yellow-700">{q.difficulty}</span></span>
                  <span>| 示例输入: <code className="bg-gray-100 px-1 rounded text-gray-700">{q.example_input}</code></span>
                  <span>| 示例输出: <code className="bg-gray-100 px-1 rounded text-gray-700">{q.example_output}</code></span>
                  <span>| 标签:
                    {q.problem_tag && q.problem_tag.split(',').map((tag) => (
                      <span
                        key={tag.trim()}
                        className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-center">
            <Button
              onClick={handleImport}
              disabled={importing || workflowResult.length === 0}
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
    </div>
  );
}

export default function Practice() {
  return (
    <Suspense fallback={<PageLoading />}> 
      <PracticeContent />
    </Suspense>
  );
} 