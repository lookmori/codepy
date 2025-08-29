'use client';

import React, { useState } from 'react';
import Button from './Button';

const SortingComparison = () => {
  const [arraySize, setArraySize] = useState(10);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // 生成随机数组
  const generateRandomArray = (size) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
  };

  // 冒泡排序
  const bubbleSort = (arr) => {
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - 1 - i; j++) {
        comparisons++;
        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          swaps++;
        }
      }
    }

    const endTime = performance.now();
    return {
      name: '冒泡排序',
      time: endTime - startTime,
      comparisons,
      swaps,
      complexity: 'O(n²)'
    };
  };

  // 选择排序
  const selectionSort = (arr) => {
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    for (let i = 0; i < array.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < array.length; j++) {
        comparisons++;
        if (array[j] < array[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        swaps++;
      }
    }

    const endTime = performance.now();
    return {
      name: '选择排序',
      time: endTime - startTime,
      comparisons,
      swaps,
      complexity: 'O(n²)'
    };
  };

  // 插入排序
  const insertionSort = (arr) => {
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    for (let i = 1; i < array.length; i++) {
      const key = array[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        if (array[j] > key) {
          array[j + 1] = array[j];
          swaps++;
          j--;
        } else {
          break;
        }
      }
      array[j + 1] = key;
    }

    const endTime = performance.now();
    return {
      name: '插入排序',
      time: endTime - startTime,
      comparisons,
      swaps,
      complexity: 'O(n²)'
    };
  };

  // 快速排序
  const quickSort = (arr) => {
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    const quickSortHelper = (arr, low, high) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        quickSortHelper(arr, low, pi - 1);
        quickSortHelper(arr, pi + 1, high);
      }
    };

    const partition = (arr, low, high) => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        comparisons++;
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;
      return i + 1;
    };

    quickSortHelper(array, 0, array.length - 1);

    const endTime = performance.now();
    return {
      name: '快速排序',
      time: endTime - startTime,
      comparisons,
      swaps,
      complexity: 'O(n log n)'
    };
  };

  // 归并排序
  const mergeSort = (arr) => {
    const array = [...arr];
    let comparisons = 0;
    let swaps = 0;
    const startTime = performance.now();

    const mergeSortHelper = (arr, left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(arr, left, mid);
        mergeSortHelper(arr, mid + 1, right);
        merge(arr, left, mid, right);
      }
    };

    const merge = (arr, left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        swaps++;
        k++;
      }
      
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        swaps++;
        i++;
        k++;
      }
      
      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        swaps++;
        j++;
        k++;
      }
    };

    mergeSortHelper(array, 0, array.length - 1);

    const endTime = performance.now();
    return {
      name: '归并排序',
      time: endTime - startTime,
      comparisons,
      swaps,
      complexity: 'O(n log n)'
    };
  };

  const runComparison = async () => {
    setIsRunning(true);
    setResults([]);

    const testArray = generateRandomArray(arraySize);
    const algorithms = [bubbleSort, selectionSort, insertionSort, quickSort, mergeSort];
    const newResults = [];

    for (const algorithm of algorithms) {
      const result = algorithm(testArray);
      newResults.push(result);
      setResults([...newResults]);
      await new Promise(resolve => setTimeout(resolve, 100)); // 小延迟以显示进度
    }

    setIsRunning(false);
  };

  const getBestPerformance = (metric) => {
    if (results.length === 0) return null;
    return Math.min(...results.map(r => r[metric]));
  };

  const getWorstPerformance = (metric) => {
    if (results.length === 0) return null;
    return Math.max(...results.map(r => r[metric]));
  };

  const getPerformanceColor = (value, metric) => {
    const best = getBestPerformance(metric);
    const worst = getWorstPerformance(metric);
    
    if (value === best) return 'text-green-600 dark:text-green-400 font-bold';
    if (value === worst) return 'text-red-600 dark:text-red-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          排序算法性能对比
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          比较不同排序算法的执行时间、比较次数和交换次数
        </p>
      </div>

      {/* 控制面板 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            数组大小:
          </label>
          <select
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isRunning}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={10}>10 个元素</option>
            <option value={50}>50 个元素</option>
            <option value={100}>100 个元素</option>
            <option value={500}>500 个元素</option>
            <option value={1000}>1000 个元素</option>
          </select>
        </div>

        <Button
          onClick={runComparison}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isRunning ? '测试中...' : '开始性能测试'}
        </Button>
      </div>

      {/* 结果表格 */}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400">算法</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400">时间复杂度</th>
                <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">执行时间 (ms)</th>
                <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">比较次数</th>
                <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">交换次数</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
                    {result.name}
                  </td>
                  <td className="py-3 px-2">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {result.complexity}
                    </code>
                  </td>
                  <td className={`py-3 px-2 text-right font-mono ${getPerformanceColor(result.time, 'time')}`}>
                    {result.time.toFixed(3)}
                  </td>
                  <td className={`py-3 px-2 text-right font-mono ${getPerformanceColor(result.comparisons, 'comparisons')}`}>
                    {result.comparisons.toLocaleString()}
                  </td>
                  <td className={`py-3 px-2 text-right font-mono ${getPerformanceColor(result.swaps, 'swaps')}`}>
                    {result.swaps.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 性能分析 */}
      {results.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">性能分析:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-green-600 dark:text-green-400">最快算法:</span>
              <br />
              {results.find(r => r.time === getBestPerformance('time'))?.name}
            </div>
            <div>
              <span className="font-medium text-blue-600 dark:text-blue-400">最少比较:</span>
              <br />
              {results.find(r => r.comparisons === getBestPerformance('comparisons'))?.name}
            </div>
            <div>
              <span className="font-medium text-purple-600 dark:text-purple-400">最少交换:</span>
              <br />
              {results.find(r => r.swaps === getBestPerformance('swaps'))?.name}
            </div>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">测试说明:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 绿色数字表示该指标的最佳性能</li>
          <li>• 红色数字表示该指标的最差性能</li>
          <li>• 执行时间可能因设备性能而异</li>
          <li>• 数据量越大，算法差异越明显</li>
        </ul>
      </div>
    </div>
  );
};

export default SortingComparison;