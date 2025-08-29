'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import CustomSelect from './CustomSelect';

const RecursionVisualizer = ({ algorithm = 'factorial' }) => {
  const [input, setInput] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [callStack, setCallStack] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [result, setResult] = useState(null);
  const [speed, setSpeed] = useState(800);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const resetVisualization = () => {
    setCallStack([]);
    setCurrentCall(null);
    setResult(null);
    setIsRunning(false);
  };

  const visualizeFactorial = async (n, depth = 0) => {
    const callId = `factorial(${n})`;
    const newCall = {
      id: callId,
      function: 'factorial',
      parameter: n,
      depth,
      status: 'calling',
      result: null
    };

    // 添加到调用栈
    setCallStack(prev => [...prev, newCall]);
    setCurrentCall(newCall);
    await sleep(speed);

    // 基础情况
    if (n <= 1) {
      const updatedCall = { ...newCall, status: 'returning', result: 1 };
      setCallStack(prev => prev.map(call => 
        call.id === callId ? updatedCall : call
      ));
      setCurrentCall(updatedCall);
      await sleep(speed);
      return 1;
    }

    // 递归调用
    const recursiveResult = await visualizeFactorial(n - 1, depth + 1);
    const finalResult = n * recursiveResult;

    // 更新当前调用的结果
    const updatedCall = { ...newCall, status: 'returning', result: finalResult };
    setCallStack(prev => prev.map(call => 
      call.id === callId ? updatedCall : call
    ));
    setCurrentCall(updatedCall);
    await sleep(speed);

    return finalResult;
  };

  const visualizeFibonacci = async (n, depth = 0, memo = {}) => {
    const callId = `fib(${n})-${depth}-${Date.now()}`;
    const newCall = {
      id: callId,
      function: 'fibonacci',
      parameter: n,
      depth,
      status: 'calling',
      result: null
    };

    setCallStack(prev => [...prev, newCall]);
    setCurrentCall(newCall);
    await sleep(speed);

    // 基础情况
    if (n <= 1) {
      const updatedCall = { ...newCall, status: 'returning', result: n };
      setCallStack(prev => prev.map(call => 
        call.id === callId ? updatedCall : call
      ));
      setCurrentCall(updatedCall);
      await sleep(speed);
      return n;
    }

    // 递归调用
    const fib1 = await visualizeFibonacci(n - 1, depth + 1, memo);
    const fib2 = await visualizeFibonacci(n - 2, depth + 1, memo);
    const result = fib1 + fib2;

    const updatedCall = { ...newCall, status: 'returning', result };
    setCallStack(prev => prev.map(call => 
      call.id === callId ? updatedCall : call
    ));
    setCurrentCall(updatedCall);
    await sleep(speed);

    return result;
  };

  const startVisualization = async () => {
    setIsRunning(true);
    resetVisualization();
    
    await sleep(100);
    
    let finalResult;
    if (algorithm === 'factorial') {
      finalResult = await visualizeFactorial(input);
    } else if (algorithm === 'fibonacci') {
      finalResult = await visualizeFibonacci(input);
    }
    
    setResult(finalResult);
    setIsRunning(false);
  };

  const getCallColor = (call) => {
    if (call.status === 'calling') return 'bg-blue-500 text-white';
    if (call.status === 'returning') return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {algorithm === 'factorial' ? '阶乘' : '斐波那契'}递归可视化
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          蓝色表示正在调用的函数，绿色表示正在返回结果的函数
        </p>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            输入值:
          </label>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(Math.max(0, Math.min(10, Number(e.target.value))))}
            disabled={isRunning}
            min="0"
            max="10"
            className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-xs text-gray-500">(0-10)</span>
        </div>

        <Button
          onClick={startVisualization}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isRunning ? '运行中...' : '开始可视化'}
        </Button>
        
        <Button
          onClick={resetVisualization}
          disabled={isRunning}
          variant="outline"
        >
          重置
        </Button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            速度:
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isRunning}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={1200}>慢</option>
            <option value={800}>中</option>
            <option value={400}>快</option>
          </select>
        </div>
      </div>

      {/* 调用栈可视化 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">调用栈:</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {callStack.map((call, index) => (
            <div
              key={call.id}
              className={`p-3 rounded transition-all duration-300 ${getCallColor(call)}`}
              style={{ marginLeft: `${call.depth * 20}px` }}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono">
                  {call.function}({call.parameter})
                </span>
                {call.result !== null && (
                  <span className="font-mono">
                    → {call.result}
                  </span>
                )}
              </div>
              <div className="text-xs opacity-75 mt-1">
                深度: {call.depth} | 状态: {call.status === 'calling' ? '调用中' : '返回中'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 结果显示 */}
      {result !== null && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">最终结果:</h4>
          <p className="text-lg font-mono text-green-700 dark:text-green-300">
            {algorithm === 'factorial' ? `${input}! = ${result}` : `fibonacci(${input}) = ${result}`}
          </p>
        </div>
      )}

      {/* 算法说明 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">算法说明:</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {algorithm === 'factorial' ? (
            <div>
              <p className="mb-2">阶乘递归公式:</p>
              <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                factorial(n) = n * factorial(n-1), 当 n &gt; 1<br/>
                factorial(1) = 1 (基础情况)
              </code>
            </div>
          ) : (
            <div>
              <p className="mb-2">斐波那契递归公式:</p>
              <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                fib(n) = fib(n-1) + fib(n-2), 当 n &gt; 1<br/>
                fib(0) = 0, fib(1) = 1 (基础情况)
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecursionVisualizer;