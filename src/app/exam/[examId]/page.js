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
// Provided fake question data
const questionsData = {
  "bian": [
    {
      "input": "请输入半径：5",
      "out": "面积=78.54，周长=31.42",
      "problem": "编写程序计算圆的面积和周长",
      "require": [
        "1. 从键盘输入圆的半径（整数）",
        "2. 使用math库的pi常量进行圆周率计算",
        "3. 输出格式：面积=xxx.xx，周长=xxx.xx（保留两位小数）",
        "4. 包含字符串转数值的类型转换",
        "5. 添加异常处理（非数字输入处理）"
      ]
    },
    {
      "input": "无",
      "out": "显示红色正方形图案",
      "problem": "使用turtle库绘制正方形",
      "require": [
        "1. 导入turtle库并创建画布",
        "2. 控制画笔绘制边长为100的正方形",
        "3. 实现前进、右转90度、颜色控制",
        "4. 绘制完成后隐藏画笔",
        "5. 添加提笔落笔操作控制线条连贯性"
      ]
    }
  ],
  "pan": [
    {
      "0": {
        "ans": true,
        "problem": "Python程序默认按顺序执行语句，即从上到下逐行运行代码。"
      }
    },
    {
      "1": {
        "ans": false,
        "problem": "在Python中，变量名可以命名为'print'，因为print是普通标识符。"
      }
    },
    {
      "2": {
        "ans": false,
        "problem": "在IDLE的交互模式下，可以直接运行包含多行循环语句的完整程序。"
      }
    },
    {
      "3": {
        "ans": true,
        "problem": "turtle.left(90)会让海龟逆时针旋转90度。"
      }
    },
    {
      "4": {
        "ans": false,
        "problem": "表达式 int('3.14') 能正确将字符串转换为整数3。"
      }
    },
    {
      "5": {
        "ans": true,
        "problem": "在Python中，'5' + str(2) 的结果是字符串'52'。"
      }
    },
    {
      "6": {
        "ans": false,
        "problem": "turtle.penup()执行后，海龟移动时会在画布上留下轨迹。"
      }
    },
    {
      "7": {
        "ans": false,
        "problem": "在Python中，多行注释必须使用井号(#)在每行开头标注。"
      }
    },
    {
      "8": {
        "ans": false,
        "problem": "逻辑表达式 (5 > 3) and (2 == '2') 的最终结果为True。"
      }
    },
    {
      "9": {
        "ans": true,
        "problem": "turtle.circle(100, 180) 会绘制出一个直径为100像素的半圆形。"
      }
    }
  ],
  "xuan": [
    {
      "0": {
        "ans": "A",
        "options": [
          "A: Ctrl+N",
          "B: Ctrl+S",
          "C: Ctrl+O",
          "D: Alt+F4"
        ],
        "problem": "在Python IDLE中，新建文件的快捷键是？"
      }
    },
    {
      "1": {
        "ans": "B",
        "options": [
          "A: Ctrl+N",
          "B: Ctrl+S",
          "C: F5",
          "D: Alt+F4"
        ],
        "problem": "在Python IDLE中，保存文件的快捷键是？"
      }
    },
    {
      "2": {
        "ans": "A",
        "options": [
          "A: Python Shell窗口",
          "B: 编辑窗口",
          "C: 调试窗口",
          "D: 新建的文件窗口"
        ],
        "problem": "在Python IDLE中运行程序后，输出结果显示在哪里？"
      }
    },
    {
      "3": {
        "ans": "C",
        "options": [
          "A: Python 1.0",
          "B: Python 2.7",
          "C: Python 3.x",
          "D: Python 4.0"
        ],
        "problem": "Python目前最常用的版本是？"
      }
    },
    {
      "4": {
        "ans": "A",
        "options": [
          "A: 启动IDLE时自动打开",
          "B: 在编辑窗口按F5",
          "C: 菜单栏选择File→New",
          "D: 快捷键Ctrl+Shift+N"
        ],
        "problem": "如何进入Python IDLE的交互模式？"
      }
    },
    {
      "5": {
        "ans": "C",
        "options": [
          "A: 2var",
          "B: var!",
          "C: _var",
          "D: for"
        ],
        "problem": "下列哪个是合法的Python变量名？"
      }
    },
    {
      "6": {
        "ans": "C",
        "options": [
          "A: if",
          "B: while",
          "C: hello",
          "D: for"
        ],
        "problem": "以下哪个不是Python的保留字？"
      }
    },
    {
      "7": {
        "ans": "D",
        "options": [
          "A: 单引号",
          "B: 双引号",
          "C: 三引号",
          "D: 以上都可以"
        ],
        "problem": "在Python中，字符串可以用什么符号表示？"
      }
    },
    {
      "8": {
        "ans": "C",
        "options": [
          "A: int()",
          "B: float()",
          "C: str()",
          "D: chr()"
        ],
        "problem": "将整数转换为字符串的函数是？"
      }
    },
    {
      "9": {
        "ans": "B",
        "options": [
          "A: 35",
          "B: 23",
          "C: 20",
          "D: 19"
        ],
        "problem": "表达式 3 + 4 * 5 的结果是？"
      }
    },
    {
      "10": {
        "ans": "B",
        "options": [
          "A: 5 > 10",
          "B: 3 == 3",
          "C: 7 < 2",
          "D: 4 != 4"
        ],
        "problem": "以下哪个比较表达式的结果为True？"
      }
    },
    {
      "11": {
        "ans": "B",
        "options": [
          "A: True",
          "B: False",
          "C: 5",
          "D: 4"
        ],
        "problem": "表达式 (5>3) and (4<2) 的结果是？"
      }
    },
    {
      "12": {
        "ans": "C",
        "options": [
          "A: 整数",
          "B: 浮点数",
          "C: 字符串",
          "D: 布尔值"
        ],
        "problem": "input()函数默认返回的数据类型是？"
      }
    },
    {
      "13": {
        "ans": "C",
        "options": [
          "A: 7",
          "B: \"7\"",
          "C: \"34\"",
          "D: 34"
        ],
        "problem": "print(\"3\" + \"4\") 的输出结果是什么？"
      }
    },
    {
      "14": {
        "ans": "A",
        "options": [
          "A: 1",
          "B: 0",
          "C: 3",
          "D: 10"
        ],
        "problem": "表达式 10 % 3 的结果是？"
      }
    },
    {
      "15": {
        "ans": "B",
        "options": [
          "A: 8",
          "B: 15",
          "C: 53",
          "D: 35"
        ],
        "problem": "a = 5; b = 3; c = a * b; print(c) 的输出是？"
      }
    },
    {
      "16": {
        "ans": "B",
        "options": [
          "A: A",
          "B: B",
          "C: 10",
          "D: 20"
        ],
        "problem": "a = 10; b = 20; if a > b: print(\"A\") else: print(\"B\") 的输出是？"
      }
    },
    {
      "17": {
        "ans": "B",
        "options": [
          "A: 3.0",
          "B: 3",
          "C: 15",
          "D: 5"
        ],
        "problem": "x = 15; y = 5; z = x / y; print(int(z)) 的输出是？"
      }
    },
    {
      "18": {
        "ans": "B",
        "options": [
          "A: 30",
          "B: \"1020\"",
          "C: 1020",
          "D: \"30\""
        ],
        "problem": "a = \"10\"; b = \"20\"; print(a + b) 的输出是？"
      }
    },
    {
      "19": {
        "ans": "B",
        "options": [
          "A: 10",
          "B: 20",
          "C: 30",
          "D: 40"
        ],
        "problem": "a = 10; b = 20; c = a + b; a = c - a; print(a) 的输出是？"
      }
    },
    {
      "20": {
        "ans": "A",
        "options": [
          "A: import turtle",
          "B: import turtle*",
          "C: include turtle",
          "D: load turtle"
        ],
        "problem": "正确导入turtle库的语句是？"
      }
    },
    {
      "21": {
        "ans": "A",
        "options": [
          "A: turtle.forward(100)",
          "B: turtle.backward(100)",
          "C: turtle.left(100)",
          "D: turtle.right(100)"
        ],
        "problem": "控制海龟向前移动100像素的命令是？"
      }
    },
    {
      "22": {
        "ans": "A",
        "options": [
          "A: turtle.color(\"red\")",
          "B: turtle.setcolor(\"red\")",
          "C: turtle.pencolor(\"red\")",
          "D: turtle.colour(\"red\")"
        ],
        "problem": "设置画笔颜色为红色的命令是？"
      }
    },
    {
      "23": {
        "ans": "B",
        "options": [
          "A: turtle.circle()",
          "B: turtle.circle(50)",
          "C: turtle.draw_circle(50)",
          "D: turtle.oval(50)"
        ],
        "problem": "画一个半径为50的圆的命令是？"
      }
    },
    {
      "24": {
        "ans": "A",
        "options": [
          "A: turtle.penup()",
          "B: turtle.pendown()",
          "C: turtle.up()",
          "D: turtle.down()"
        ],
        "problem": "抬起画笔停止绘图的命令是？"
      }
    }
  ]
};

// Helper to flatten the question data and assign unique IDs
const flattenQuestions = (data) => {
  let idCounter = 0;
  const flattened = [];

  // Process 'xuan' (multiple choice) questions
  data.xuan.forEach(item => {
    const key = Object.keys(item)[0];
    const q = item[key];
    flattened.push({
      id: `q_${idCounter++}`,
      type: 'xuan',
      problem: q.problem,
      options: q.options,
      ans: q.ans,
      completed: false, // Simulate completed status
    });
  });

  // Process 'pan' (true/false) questions
  data.pan.forEach(item => {
    const key = Object.keys(item)[0];
    const q = item[key];
    flattened.push({
      id: `q_${idCounter++}`,
      type: 'pan',
      problem: q.problem,
      ans: q.ans,
      completed: false, // Simulate completed status
    });
  });

  // Process 'bian' (coding) questions
  data.bian.forEach(q => {
    flattened.push({
      id: `q_${idCounter++}`,
      type: 'bian',
      problem: q.problem,
      input: q.input,
      out: q.out,
      require: q.require,
      completed: false, // Simulate completed status
    });
  });

  return flattened;
};

// Initial state based on flattened questions, all marked as incomplete initially
const initialQuestions = flattenQuestions(questionsData);

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { examId } = params; // Get the examId from the route parameters
  const { addToast, removeToast, clearToasts } = useToast();
  const toast = Toast();

  // Manage questions state, including completion status
  const [questions, setQuestions] = useState(initialQuestions);
  const [editorTheme, setEditorTheme] = useState('vs-dark'); // 添加编辑器主题状态
  
  // 添加倒计时状态
  const [timeRemaining, setTimeRemaining] = useState(2 * 60 * 60); // 2小时，以秒为单位
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // 切屏计数
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交状态
  const [isSubmitted, setIsSubmitted] = useState(false); // 是否已提交
  
  // 添加确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogCallback, setConfirmDialogCallback] = useState(null);
  
  // 用于检测页面可见性变化的引用
  const visibilityRef = useRef(null);

  // For now, display all questions regardless of examId. 
  // In a real app, you'd filter or fetch questions based on examId.
  const questionsForExam = questions;

  const [selectedQuestionId, setSelectedQuestionId] = useState(questionsForExam.length > 0 ? questionsForExam[0].id : null);
  const [studentAnswers, setStudentAnswers] = useState({}); // State to store student answers

  const selectedQuestion = useMemo(() => {
    return questionsForExam.find(q => q.id === selectedQuestionId);
  }, [selectedQuestionId, questionsForExam]);

  // 处理倒计时
  useEffect(() => {
    if (isSubmitted) return; // 如果已提交，不再倒计时
    
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
  }, [isSubmitted]);

  // 处理页面可见性变化（检测切屏）
  useEffect(() => {
    if (isSubmitted) return; // 如果已提交，不再检测切屏
    
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
  
  // 实际执行提交逻辑
  const proceedWithSubmission = (reason) => {
    setIsSubmitting(true);
    
    // 准备提交数据
    const examData = {
      examId,
      studentId: "student123", // 这里可以替换为实际的学生ID
      submittedAt: new Date().toISOString(),
      tabSwitchCount,
      timeUsed: 2 * 60 * 60 - timeRemaining, // 使用的时间（秒）
      answers: studentAnswers,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        problem: q.problem,
        completed: q.completed,
        correctAnswer: q.ans // 正确答案
      }))
    };
    
    // 打印到控制台
    console.log("提交的试卷信息:", examData);
    
    // 计算得分（仅供演示）
    let correctCount = 0;
    let totalAnswered = 0;
    
    // 打印每一题的详细答案信息
    console.log("\n===== 详细答题情况 =====");
    questions.forEach((question, index) => {
      const studentAnswer = studentAnswers[question.id];
      const isAnswered = studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== '';
      let isCorrect = false;
      let answerDisplay = '未作答';
      
      if (isAnswered) {
        totalAnswered++;
        
        // 根据题目类型显示不同的答案信息
        if (question.type === 'xuan') {
          answerDisplay = `选择了: ${studentAnswer}`;
          isCorrect = studentAnswer === question.ans;
          if (isCorrect) correctCount++;
        } else if (question.type === 'pan') {
          answerDisplay = studentAnswer ? '选择了: 正确' : '选择了: 错误';
          isCorrect = studentAnswer === question.ans;
          if (isCorrect) correctCount++;
        } else if (question.type === 'bian') {
          // 编程题显示代码长度
          answerDisplay = `提交了代码 (${studentAnswer.length} 字符)`;
        }
      }
      
      // 构建题目类型显示
      let questionTypeDisplay = '';
      if (question.type === 'xuan') questionTypeDisplay = '【选择题】';
      else if (question.type === 'pan') questionTypeDisplay = '【判断题】';
      else if (question.type === 'bian') questionTypeDisplay = '【编程题】';
      
      // 打印题目信息和答案
      console.log(`第 ${index + 1} 题 ${questionTypeDisplay} ${question.problem}`);
      console.log(`  答案状态: ${answerDisplay}`);
      
      // 对于选择题和判断题，显示正确答案和是否正确
      if (question.type === 'xuan' || question.type === 'pan') {
        const correctAnswerDisplay = question.type === 'xuan' ? 
          question.ans : 
          (question.ans ? '正确' : '错误');
        console.log(`  正确答案: ${correctAnswerDisplay}`);
        if (isAnswered) {
          console.log(`  是否正确: ${isCorrect ? '✓ 正确' : '✗ 错误'}`);
        }
      }
      console.log(''); // 空行分隔
    });
    
    console.log(`\n总结: 共${questions.length}题，已答${totalAnswered}题，选择题和判断题正确${correctCount}题`);
    
    // 设置为已提交状态
    setIsSubmitted(true);
    
    // 根据不同的提交原因显示不同的提示
    let toastTitle = '';
    let toastMessage = '';
    let toastType = 'success';
    
    switch(reason) {
      case 'timeout':
        toastTitle = '考试时间结束';
        toastMessage = '考试时间已到，系统已自动提交您的答案';
        toastType = 'warning';
        break;
      case 'tabswitch':
        toastTitle = '切屏次数超限';
        toastMessage = '您已切换页面超过3次，系统已自动提交您的答案';
        toastType = 'error';
        break;
      default:
        toastTitle = '试卷提交成功';
        toastMessage = `您已完成${totalAnswered}道题，选择题和判断题正确${correctCount}道`;
        toastType = 'success';
    }
    
    // 使用Toast组件显示提示信息
    if (toastType === 'success') {
      toast.success({ title: toastTitle, message: toastMessage, duration: 3000 });
    } else if (toastType === 'warning') {
      toast.warning({ title: toastTitle, message: toastMessage, duration: 3000 });
    } else if (toastType === 'error') {
      toast.error({ title: toastTitle, message: toastMessage, duration: 3000 });
    } else {
      toast.info({ title: toastTitle, message: toastMessage, duration: 3000 });
    }
    
    // 模拟提交后的操作
    setTimeout(() => {
      setIsSubmitting(false);
      // 返回上一级
      router.push('/exam');
    }, 2000);
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
        <h1 className="text-xl font-bold">考试：{examId}</h1>
        <div className="flex items-center space-x-6">
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
            className="ml-4 w-24 h-10 flex items-center justify-center"
            disabled={isSubmitting || isSubmitted}
          >
            {isSubmitting ? '提交中' : '提交试卷'}
          </Button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Question Navigation */}
        <div className="w-80 bg-white dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 p-4 overflow-y-auto flex flex-col">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-600 pb-3">题目列表 ({questionsForExam.length})</h2>
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
                    hover:opacity-80 focus:outline-none`}
                  onClick={() => setSelectedQuestionId(question.id)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedQuestion ? (
            <div>
              {/* Question Type Badge and Count */}
              <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-500 text-white text-sm font-semibold px-2.5 py-0.5 rounded">{selectedQuestion.type === 'bian' ? '编程题' : selectedQuestion.type === 'pan' ? '判断题' : '选择题'}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">第 {questionsForExam.findIndex(q => q.id === selectedQuestionId) + 1} 题 / 共 {questionsForExam.length} 题</span>
              </div>

              <h3 className="text-2xl font-bold mb-4">{selectedQuestion.problem}</h3>
              {/* Render question details based on type */}
              {selectedQuestion.type === 'bian' && (
                <div className="space-y-2">
                  <p><strong>输入:</strong> {selectedQuestion.input}</p>
                  <p><strong>输出:</strong> {selectedQuestion.out}</p>
                  <div>
                    <strong>要求:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {selectedQuestion.require.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {selectedQuestion.type === 'pan' && (
                <div className="space-y-4">
                  {/* Options for true/false */}
                  <div className="space-y-2">
                    <div
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                      onClick={() => handleAnswerChange(selectedQuestion.id, true)}
                    >
                      <input
                        type="radio"
                        name={`answer-${selectedQuestion.id}`}
                        id={`option-${selectedQuestion.id}-true`}
                        className="mr-3 text-blue-600 focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-600"
                        value="true"
                        checked={studentAnswers[selectedQuestion.id] === true}
                        onChange={() => handleAnswerChange(selectedQuestion.id, true)}
                      />
                      <label htmlFor={`option-${selectedQuestion.id}-true`} className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200">正确</label>
                    </div>
                    <div
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                      onClick={() => handleAnswerChange(selectedQuestion.id, false)}
                    >
                      <input
                        type="radio"
                        name={`answer-${selectedQuestion.id}`}
                        id={`option-${selectedQuestion.id}-false`}
                        className="mr-3 text-blue-600 focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-600"
                        value="false"
                        checked={studentAnswers[selectedQuestion.id] === false}
                        onChange={() => handleAnswerChange(selectedQuestion.id, false)}
                      />
                      <label htmlFor={`option-${selectedQuestion.id}-false`} className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200">错误</label>
                    </div>
                  </div>
                </div>
              )}
              {selectedQuestion.type === 'xuan' && (
                <div className="space-y-4">
                  {/* Options for multiple choice */}
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, i) => (
                      <div
                        key={i}
                        className="border border-gray-300 dark:border-gray-600 rounded-md p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                        onClick={() => handleAnswerChange(selectedQuestion.id, option.charAt(0))}
                      >
                        <input
                          type="radio"
                          name={`answer-${selectedQuestion.id}`}
                          id={`option-${selectedQuestion.id}-${i}`}
                          className="mr-3 text-blue-600 focus:ring-blue-500 dark:text-blue-500 dark:focus:ring-blue-600"
                          value={option.charAt(0)}
                          checked={studentAnswers[selectedQuestion.id] === option.charAt(0)}
                          onChange={() => handleAnswerChange(selectedQuestion.id, option.charAt(0))}
                        />
                        <label htmlFor={`option-${selectedQuestion.id}-${i}`} className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200">{option}</label>
                      </div>
                    ))}
                  </div>
                  {/* Answer input for multiple choice - Removed as selection handles it */}
                </div>
              )}
              {/* Add area for user to input answers or code */}
              {selectedQuestion.type === 'bian' ? (
                <div className="mt-6">
                  <MonacoEditor
                    height="60vh"
                    defaultLanguage="python"
                    value={studentAnswers[selectedQuestion.id] || ''}
                    onChange={(value) => handleAnswerChange(selectedQuestion.id, value)}
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
                      disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === 0}
                    >
                      上一题
                    </Button>
                    <Button
                      onClick={() => handleAnswerChange(selectedQuestion.id, studentAnswers[selectedQuestion.id] || '')}
                      variant="primary"
                      className="mx-2"
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
                      disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === questionsForExam.length - 1}
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
                    disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === 0}
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
                    disabled={questionsForExam.findIndex(q => q.id === selectedQuestion.id) === questionsForExam.length - 1}
                  >
                    下一题
                  </Button>
                </div>
              )}
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