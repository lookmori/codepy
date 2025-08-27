'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import MonacoEditor, { loader } from '@monaco-editor/react';
import Toast, { useToast } from '../../../components/Toast';

loader.config({
  paths: {
    vs: '/monaco/vs' // 假设 public/monaco/vs 目录下有 Monaco Editor 静态资源
  }
});


export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { examId } = params; // Get the examId from the route parameters
  const { addToast, removeToast, clearToasts } = useToast();
  const toast = Toast();

  // 状态管理
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [previousSubmission, setPreviousSubmission] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showRetakeButton, setShowRetakeButton] = useState(false);

  // 添加倒计时状态 - 从试卷数据中获取时长
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // 切屏计数
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交状态
  const [isSubmitted, setIsSubmitted] = useState(false); // 是否已提交

  // 添加确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogCallback, setConfirmDialogCallback] = useState(null);

  // 用于检测页面可见性变化的引用
  const visibilityRef = useRef(null);

  // 加载之前的答题记录
  const loadPreviousSubmission = async () => {
    try {
      const studentId = "student123"; // 这里应该从用户登录信息获取
      const response = await fetch(`/api/exams/${examId}/submit?studentId=${studentId}`);
      const data = await response.json();

      if (data.success && data.submission) {
        setPreviousSubmission(data.submission);
        setHasSubmitted(true);
        setShowRetakeButton(true);

        // 回显之前的答案
        setStudentAnswers(data.submission.answers);

        // 标记已作答的题目为完成状态
        setQuestions(prev => prev.map(q => ({
          ...q,
          completed: data.submission.answers[q.id] !== undefined &&
            data.submission.answers[q.id] !== null &&
            data.submission.answers[q.id] !== ''
        })));
      }
    } catch (error) {
      console.error('加载答题记录失败:', error);
    }
  };

  // 加载试卷数据
  const loadExamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}`);
      const data = await response.json();

      if (data.success) {
        setExam(data.exam);

        // 转换题目数据格式，添加完成状态，并按类型排序
        const formattedQuestions = data.exam.questions.map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          content: q.content,
          problem: q.content, // 兼容原有的 problem 字段
          score: q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE' ? 2 : q.score, // 选择题和判断题固定2分
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          orderIndex: q.orderIndex,
          completed: false,
          // 根据题目类型添加特定字段
          ...(q.type === 'PROGRAMMING' && {
            input: q.options?.inputExample || '',
            out: q.options?.outputExample || '',
            require: q.options?.requirements || []
          }),
          ...(q.type === 'SINGLE_CHOICE' && {
            ans: q.answer
          }),
          ...(q.type === 'TRUE_FALSE' && {
            ans: q.answer === '正确' || q.answer === 'true' || q.answer === true
          })
        }));

        // 按题目类型排序：选择题 -> 判断题 -> 编程题
        const sortedQuestions = formattedQuestions.sort((a, b) => {
          const typeOrder = {
            'SINGLE_CHOICE': 1,
            'TRUE_FALSE': 2,
            'PROGRAMMING': 3
          };
          return typeOrder[a.type] - typeOrder[b.type];
        });

        setQuestions(sortedQuestions);

        // 设置考试时长（转换为秒）
        setTimeRemaining(data.exam.duration * 60);

        // 设置第一个题目为选中状态
        if (sortedQuestions.length > 0) {
          setSelectedQuestionId(sortedQuestions[0].id);
        }

        // 检查是否有之前的答题记录
        await loadPreviousSubmission();
      } else {
        setError(data.error || '加载试卷失败');
      }
    } catch (error) {
      console.error('加载试卷数据失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  const questionsForExam = questions;

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({}); // State to store student answers

  const selectedQuestion = useMemo(() => {
    return questionsForExam.find(q => q.id === selectedQuestionId);
  }, [selectedQuestionId, questionsForExam]);

  // 处理倒计时
  useEffect(() => {
    // 只有在以下条件都满足时才开始倒计时：
    // 1. 未提交
    // 2. 不在加载中
    // 3. 时间大于 0
    // 4. 不是重做模式
    if (isSubmitted || loading || timeRemaining <= 0 || showRetakeButton) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam('timeout'); // 时间到自动提交
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, loading, timeRemaining]);

  // 处理页面可见性变化（检测切屏）
  useEffect(() => {
    if (isSubmitted || showRetakeButton) return; // 如果已提交或在重做模式，不再检测切屏

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            // 切屏超过3次，自动提交
            handleSubmitExam('tabswitch');
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubmitted]);

  // 格式化剩余时间为 时:分:秒
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 提交试卷
  const handleSubmitExam = (reason = 'manual') => {
    // 如果已经提交过，不再重复提交
    if (isSubmitted) return;

    // 检查未作答的题目
    if (reason === 'manual') {
      const unansweredQuestions = questions.filter(q => !q.completed);
      if (unansweredQuestions.length > 0) {
        // 使用自定义确认对话框
        setConfirmDialogMessage(`您还有 ${unansweredQuestions.length} 道题目未作答，确定要提交吗？`);
        setConfirmDialogCallback(() => () => {
          // 用户确认提交
          proceedWithSubmission(reason);
        });
        setShowConfirmDialog(true);
        return; // 等待用户确认
      }
    }

    // 如果没有未作答题目或非手动提交，直接继续
    proceedWithSubmission(reason);
  };

  // 重做试卷
  const handleRetakeExam = async () => {
    try {
      const studentId = "student123"; // 这里应该从用户登录信息获取
      const response = await fetch(`/api/exams/${examId}/submit?studentId=${studentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        // 重置所有状态
        setPreviousSubmission(null);
        setHasSubmitted(false);
        setShowRetakeButton(false);
        setIsSubmitted(false);
        setStudentAnswers({});
        setTabSwitchCount(0);

        // 重置题目完成状态
        setQuestions(prev => prev.map(q => ({ ...q, completed: false })));

        // 重置考试时间
        setTimeRemaining(exam.duration * 60);

        toast.success({
          title: '重做试卷',
          message: '上次答题记录已删除，可以重新开始答题',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('删除答题记录失败:', error);
      toast.error({
        title: '操作失败',
        message: '删除答题记录时发生错误',
        duration: 3000
      });
    }
  };

  // 实际执行提交逻辑
  const proceedWithSubmission = async (reason) => {
    setIsSubmitting(true);

    try {
      const studentId = "student123"; // 这里应该从用户登录信息获取
      const timeUsed = (exam?.duration || 120) * 60 - timeRemaining;

      // 提交到服务器
      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          answers: studentAnswers,
          timeUsed,
          tabSwitchCount
        })
      });

      const data = await response.json();

      if (data.success) {
        // 设置为已提交状态
        setIsSubmitted(true);
        setHasSubmitted(true);
        setShowRetakeButton(true);
        setPreviousSubmission(data.submission);

        // 计算选择题和判断题的统计信息
        const choiceAndTrueFalseQuestions = questions.filter(q =>
          q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE'
        );
        const correctAnswers = data.questionResults.filter(r => r.isCorrect).length;
        const totalAnswered = data.questionResults.filter(r =>
          r.studentAnswer !== undefined && r.studentAnswer !== null && r.studentAnswer !== ''
        ).length;

        // 根据不同的提交原因显示不同的提示
        let toastTitle = '';
        let toastMessage = '';
        let toastType = 'success';

        switch (reason) {
          case 'timeout':
            toastTitle = '考试时间结束';
            toastMessage = `考试时间已到，系统已自动提交。得分：${data.submission.score}/${data.submission.maxScore}分`;
            toastType = 'warning';
            break;
          case 'tabswitch':
            toastTitle = '切屏次数超限';
            toastMessage = `您已切换页面超过3次，系统已自动提交。得分：${data.submission.score}/${data.submission.maxScore}分`;
            toastType = 'error';
            break;
          default:
            toastTitle = '试卷提交成功';
            toastMessage = `您的得分：${data.submission.score}/${data.submission.maxScore}分（选择题和判断题正确${correctAnswers}/${choiceAndTrueFalseQuestions.length}题）`;
            toastType = 'success';
        }

        // 使用Toast组件显示提示信息
        if (toastType === 'success') {
          toast.success({ title: toastTitle, message: toastMessage, duration: 5000 });
        } else if (toastType === 'warning') {
          toast.warning({ title: toastTitle, message: toastMessage, duration: 5000 });
        } else if (toastType === 'error') {
          toast.error({ title: toastTitle, message: toastMessage, duration: 5000 });
        }

        // 打印详细结果到控制台
        console.log("提交结果:", data);
      } else {
        throw new Error(data.error || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error({
        title: '提交失败',
        message: error.message || '网络错误，请稍后重试',
        duration: 3000
      });
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to mark a question as completed
  const markQuestionCompleted = (questionId) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? { ...q, completed: true } : q
      )
    );
  };

  // Function to handle answer changes
  const handleAnswerChange = (questionId, answer) => {
    setStudentAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer,
    }));

    // Mark question as completed if an answer is provided
    if (answer !== '' && answer !== null && answer !== undefined) {
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId ? { ...q, completed: true } : q
        )
      );
    } else {
      // Optional: Mark as incomplete if answer is cleared
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId ? { ...q, completed: false } : q
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      {/* 顶部栏：包含倒计时和切屏计数 */}
      <div className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            onClick={() => router.push('/exam')}
            variant="secondary"
            size="sm"
            className="mr-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold">{exam ? exam.name : `考试：${examId}`}</h1>
            {previousSubmission && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                上次得分：{previousSubmission.score}/{previousSubmission.maxScore}分
                （{new Date(previousSubmission.submittedAt).toLocaleString()}）
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isSubmitted && !showRetakeButton && (
            <>
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-300 mr-2">切屏次数:</span>
                <span className={`font-bold ${tabSwitchCount >= 2 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                  {tabSwitchCount}/3
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-300 mr-2">剩余时间:</span>
                <span className={`font-bold ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                onClick={() => handleSubmitExam()}
                loading={isSubmitting}
                variant="danger"
                className="w-24 h-10 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中' : '提交试卷'}
              </Button>
            </>
          )}
          {showRetakeButton && (
            <Button
              onClick={handleRetakeExam}
              variant="primary"
              className="w-24 h-10 flex items-center justify-center"
            >
              重做试卷
            </Button>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Question Navigation */}
        <div className="w-80 bg-white dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 p-4 overflow-y-auto flex flex-col">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-600 pb-3">
            题目列表 {!loading && `(${questionsForExam.length})`}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm">加载中...</span>
            </div>
          ) : questionsForExam.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              暂无题目
            </div>
          ) : showRetakeButton && !isSubmitted ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                试卷已完成，点击右上角&ldquo;重做试卷&rdquo;按钮可重新答题
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                上次得分：{previousSubmission?.score || 0}/{previousSubmission?.maxScore || 0}分
              </div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="mb-4 text-sm">
                <span className="mr-4"><span className="inline-block w-3 h-3 mr-1 rounded-full bg-gray-400"></span> 未作答</span>
                <span className="mr-4"><span className="inline-block w-3 h-3 mr-1 rounded-full bg-green-500"></span> 已作答</span>
                <span><span className="inline-block w-3 h-3 mr-1 rounded-full bg-blue-500"></span> 当前题</span>
              </div>
              <ul>
                {/* Question number grid */}
                <div className="grid grid-cols-5 gap-2">
                  {questionsForExam.map((question, index) => (
                    <button
                      key={question.id}
                      className={`w-10 h-10 flex items-center justify-center border rounded text-sm font-semibold
                        ${selectedQuestionId === question.id ? 'bg-blue-500 text-white border-blue-600' :
                          question.completed ? 'bg-green-500 text-white border-green-600' :
                            'bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-600 dark:text-white dark:border-gray-500'}
                        ${showRetakeButton && !isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'} focus:outline-none`}
                      onClick={() => !showRetakeButton && setSelectedQuestionId(question.id)}
                      disabled={showRetakeButton && !isSubmitted}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </ul>
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-lg">加载试卷中...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="text-red-500 text-xl mb-4">加载失败</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
              <Button onClick={loadExamData} variant="primary">重新加载</Button>
            </div>
          ) : showRetakeButton && !isSubmitted ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="text-center">
                <div className="text-2xl font-bold mb-4">试卷已完成</div>
                <div className="text-lg mb-6">
                  您的得分：{previousSubmission?.score || 0}/{previousSubmission?.maxScore || 0}分
                </div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">
                  完成时间：{previousSubmission?.submittedAt ? new Date(previousSubmission.submittedAt).toLocaleString() : ''}
                </div>
                <Button onClick={handleRetakeExam} variant="primary" size="lg">
                  重做试卷
                </Button>
              </div>
            </div>
          ) : selectedQuestion ? (
            <div>
              {/* Question Type Badge and Count */}
              <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-500 text-white text-sm font-semibold px-2.5 py-0.5 rounded">
                  {selectedQuestion.type === 'PROGRAMMING' || selectedQuestion.type === 'bian' ? '编程题' :
                    selectedQuestion.type === 'TRUE_FALSE' || selectedQuestion.type === 'pan' ? '判断题' : '选择题'}
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span>第 {questionsForExam.findIndex(q => q.id === selectedQuestionId) + 1} 题 / 共 {questionsForExam.length} 题</span>
                  <span className="ml-4">分值: {selectedQuestion.score}分</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4">{selectedQuestion.title || selectedQuestion.problem}</h3>
              <div className="text-gray-700 dark:text-gray-300 mb-4">{selectedQuestion.content}</div>
              {/* Render question details based on type */}
              {(selectedQuestion.type === 'PROGRAMMING' || selectedQuestion.type === 'bian') && (
                <div className="space-y-2">
                  <p><strong>输入:</strong> {selectedQuestion.input}</p>
                  <p><strong>输出:</strong> {selectedQuestion.out}</p>
                  <div>
                    <strong>要求:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {(selectedQuestion.require || []).map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {(selectedQuestion.type === 'TRUE_FALSE' || selectedQuestion.type === 'pan') && (
                <div className="space-y-4">
                  {/* Options for true/false */}
                  <div className="space-y-2">
                    <div
                      className={`border border-gray-300 dark:border-gray-600 rounded-md p-4 transition-colors flex items-center ${showRetakeButton && !isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => !(showRetakeButton && !isSubmitted) && handleAnswerChange(selectedQuestion.id, true)}
                    >
                      <input
                        type="radio"
                        name={`answer-${selectedQuestion.id}`}
                        id={`option-${selectedQuestion.id}-true`}
                        className="mr-3 text-blue-600 focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-600"
                        value="true"
                        checked={studentAnswers[selectedQuestion.id] === true}
                        onChange={() => !(showRetakeButton && !isSubmitted) && handleAnswerChange(selectedQuestion.id, true)}
                        disabled={showRetakeButton && !isSubmitted}
                      />
                      <label htmlFor={`option-${selectedQuestion.id}-true`} className={`flex-1 text-gray-800 dark:text-gray-200 ${showRetakeButton && !isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}>正确</label>
                    </div>
                    <div
                      className={`border border-gray-300 dark:border-gray-600 rounded-md p-4 transition-colors flex items-center ${showRetakeButton && !isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => !(showRetakeButton && !isSubmitted) && handleAnswerChange(selectedQuestion.id, false)}
                    >
                      <input
                        type="radio"
                        name={`answer-${selectedQuestion.id}`}
                        id={`option-${selectedQuestion.id}-false`}
                        className="mr-3 text-blue-600 focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-600"
                        value="false"
                        checked={studentAnswers[selectedQuestion.id] === false}
                        onChange={() => !(showRetakeButton && !isSubmitted) && handleAnswerChange(selectedQuestion.id, false)}
                        disabled={showRetakeButton && !isSubmitted}
                      />
                      <label htmlFor={`option-${selectedQuestion.id}-false`} className={`flex-1 text-gray-800 dark:text-gray-200 ${showRetakeButton && !isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}>错误</label>
                    </div>
                  </div>
                </div>
              )}
              {(selectedQuestion.type === 'SINGLE_CHOICE' || selectedQuestion.type === 'xuan') && (
                <div className="space-y-4">
                  {/* Options for multiple choice */}
                  <div className="space-y-2">
                    {(Array.isArray(selectedQuestion.options) ? selectedQuestion.options : []).map((option, i) => {
                      // 处理选项格式，如果是字符串数组直接使用，如果是带前缀的格式则提取
                      const optionText = typeof option === 'string' && option.includes(':') ?
                        option.split(':').slice(1).join(':').trim().replace(/^"(.*)"$/, '$1') :
                        option;
                      const optionValue = String.fromCharCode(65 + i); // A, B, C, D

                      return (
                        <div
                          key={i}
                          className={`border border-gray-300 dark:border-gray-600 rounded-md p-4 transition-colors flex items-center ${showRetakeButton && !isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          onClick={() => !(showRetakeButton && !isSubmitted) && handleAnswerChange(selectedQuestion.id, optionValue)}
                        >
                          <input
                            type="radio"
                            name={`answer-${selectedQuestion.id}`}
                            id={`option-${selectedQuestion.id}-${i}`}
                            className="mr-3 text-blue-600 focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-600"
                            value={optionValue}
                            checked={studentAnswers[selectedQuestion.id] === optionValue}
                            onChange={() => !(showRetakeButton && !isSubmitted) && handleAnswerChange(selectedQuestion.id, optionValue)}
                            disabled={showRetakeButton && !isSubmitted}
                          />
                          <label htmlFor={`option-${selectedQuestion.id}-${i}`} className={`flex-1 text-gray-800 dark:text-gray-200 ${showRetakeButton && !isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}>
                            {optionValue}: {optionText}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  {/* Answer input for multiple choice - Removed as selection handles it */}
                </div>
              )}
              {/* Add area for user to input answers or code */}
              {(selectedQuestion.type === 'PROGRAMMING' || selectedQuestion.type === 'bian') ? (
                <div className="mt-6">
                  <MonacoEditor
                    height="60vh"
                    defaultLanguage="python"
                    value={studentAnswers[selectedQuestion.id] || ''}
                    onChange={(value) => !showRetakeButton && handleAnswerChange(selectedQuestion.id, value)}
                    theme={editorTheme}
                    options={{
                      fontSize: 18,
                      minimap: { enabled: true },
                      wordWrap: 'on',
                      folding: true,
                      lineNumbers: 'on',
                      formatOnType: true,
                      formatOnPaste: true,
                      autoClosingBrackets: 'always',
                      autoClosingQuotes: 'always',
                      suggestOnTriggerCharacters: true,
                      tabSize: 4,
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                      renderLineHighlight: 'all',
                      quickSuggestions: true,
                      autoIndent: 'full',
                      contextmenu: true,
                      fixedOverflowWidgets: true,
                      readOnly: showRetakeButton && !isSubmitted,
                    }}
                  />
                  <div className="mt-4 flex justify-between">
                    <Button
                      onClick={() => {
                        const currentIndex = questionsForExam.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex > 0) {
                          setSelectedQuestionId(questionsForExam[currentIndex - 1].id);
                        }
                      }}
                      variant="secondary"
                      disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === 0 || (showRetakeButton && !isSubmitted)}
                    >
                      上一题
                    </Button>
                    <Button
                      onClick={() => handleAnswerChange(selectedQuestion.id, studentAnswers[selectedQuestion.id] || '')}
                      variant="primary"
                      className="mx-2"
                      disabled={showRetakeButton && !isSubmitted}
                    >
                      提交答案
                    </Button>
                    <Button
                      onClick={() => {
                        const currentIndex = questionsForExam.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex < questionsForExam.length - 1) {
                          setSelectedQuestionId(questionsForExam[currentIndex + 1].id);
                        }
                      }}
                      variant="success"
                      disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === questionsForExam.length - 1 || (showRetakeButton && !isSubmitted)}
                    >
                      下一题
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex justify-between">
                  <Button
                    onClick={() => {
                      const currentIndex = questionsForExam.findIndex(q => q.id === selectedQuestion.id);
                      if (currentIndex > 0) {
                        setSelectedQuestionId(questionsForExam[currentIndex - 1].id);
                      }
                    }}
                    variant="secondary"
                    disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === 0 || (showRetakeButton && !isSubmitted)}
                  >
                    上一题
                  </Button>
                  <Button
                    onClick={() => {
                      const currentIndex = questionsForExam.findIndex(q => q.id === selectedQuestion.id);
                      if (currentIndex < questionsForExam.length - 1) {
                        setSelectedQuestionId(questionsForExam[currentIndex + 1].id);
                      }
                    }}
                    variant="success"
                    disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === questionsForExam.length - 1 || (showRetakeButton && !isSubmitted)}
                  >
                    下一题
                  </Button>
                </div>
              )}
            </div>
          ) : questionsForExam.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">该试卷暂无题目</p>
            </div>
          ) : (
            <p>请从左侧选择一个题目开始。</p>
          )}
        </div>
      </div>

      {/* 自定义确认对话框 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">确认提交</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{confirmDialogMessage}</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="secondary"
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  if (confirmDialogCallback) {
                    confirmDialogCallback();
                  }
                }}
                variant="danger"
              >
                确认提交
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 