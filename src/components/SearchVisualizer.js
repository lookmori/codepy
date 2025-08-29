'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import CustomSelect from './CustomSelect';

const SearchVisualizer = ({ algorithm = 'linear', data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] }) => {
  const [array] = useState([...data]);
  const [target, setTarget] = useState(7);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchRange, setSearchRange] = useState({ left: 0, right: data.length - 1 });
  const [found, setFound] = useState(false);
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(800);

  const resetSearch = () => {
    setCurrentIndex(-1);
    setSearchRange({ left: 0, right: array.length - 1 });
    setFound(false);
    setSteps([]);
    setIsSearching(false);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const linearSearch = async () => {
    const searchSteps = [];
    
    for (let i = 0; i < array.length; i++) {
      setCurrentIndex(i);
      searchSteps.push(`第${i + 1}步: 检查位置${i}，值为${array[i]}`);
      setSteps([...searchSteps]);
      
      await sleep(speed);
      
      if (array[i] === target) {
        setFound(true);
        searchSteps.push(`找到了！目标值${target}在位置${i}`);
        setSteps([...searchSteps]);
        return;
      }
    }
    
    searchSteps.push(`没有找到目标值${target}`);
    setSteps([...searchSteps]);
  };

  const binarySearch = async () => {
    let left = 0;
    let right = array.length - 1;
    const searchSteps = [];
    let stepCount = 0;
    
    while (left <= right) {
      stepCount++;
      const mid = Math.floor((left + right) / 2);
      
      setCurrentIndex(mid);
      setSearchRange({ left, right });
      
      searchSteps.push(`第${stepCount}步: 搜索范围[${left}, ${right}]，检查中间位置${mid}，值为${array[mid]}`);
      setSteps([...searchSteps]);
      
      await sleep(speed);
      
      if (array[mid] === target) {
        setFound(true);
        searchSteps.push(`找到了！目标值${target}在位置${mid}，总共用了${stepCount}步`);
        setSteps([...searchSteps]);
        return;
      } else if (array[mid] < target) {
        left = mid + 1;
        searchSteps.push(`目标值${target}比${array[mid]}大，搜索右半部分`);
      } else {
        right = mid - 1;
        searchSteps.push(`目标值${target}比${array[mid]}小，搜索左半部分`);
      }
      
      setSteps([...searchSteps]);
      await sleep(speed / 2);
    }
    
    searchSteps.push(`没有找到目标值${target}，总共用了${stepCount}步`);
    setSteps([...searchSteps]);
  };

  const startSearch = async () => {
    setIsSearching(true);
    resetSearch();
    
    await sleep(100);
    
    if (algorithm === 'linear') {
      await linearSearch();
    } else if (algorithm === 'binary') {
      await binarySearch();
    }
    
    setIsSearching(false);
  };

  const getCellColor = (index) => {
    if (found && index === currentIndex) return 'bg-green-500 text-white';
    if (index === currentIndex) return 'bg-red-500 text-white';
    if (algorithm === 'binary' && index >= searchRange.left && index <= searchRange.right) {
      return 'bg-yellow-200 dark:bg-yellow-700';
    }
    return 'bg-gray-200 dark:bg-gray-600';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {algorithm === 'linear' ? '线性搜索' : '二分搜索'}可视化
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {algorithm === 'linear' 
            ? '红色表示当前检查的元素，绿色表示找到的目标元素' 
            : '黄色表示搜索范围，红色表示当前检查的中间元素，绿色表示找到的目标元素'
          }
        </p>
      </div>

      {/* 数组可视化 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {array.map((value, index) => (
            <div
              key={index}
              className={`w-12 h-12 flex items-center justify-center rounded border-2 transition-all duration-300 ${getCellColor(index)}`}
            >
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          数组索引: {array.map((_, i) => i).join(', ')}
        </div>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            目标值:
          </label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            disabled={isSearching}
            className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <Button
          onClick={startSearch}
          disabled={isSearching}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isSearching ? '搜索中...' : '开始搜索'}
        </Button>
        
        <Button
          onClick={resetSearch}
          disabled={isSearching}
          variant="outline"
        >
          重置
        </Button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            速度:
          </label>
          <div className="w-20">
            <CustomSelect
              value={speed}
              onChange={setSpeed}
              disabled={isSearching}
              options={[
                { value: 1200, label: '慢' },
                { value: 800, label: '中' },
                { value: 400, label: '快' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* 搜索步骤 */}
      {steps.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">搜索步骤:</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 max-h-32 overflow-y-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 算法说明 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">算法说明:</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {algorithm === 'linear' 
            ? '线性搜索从数组第一个元素开始，逐个检查每个元素，直到找到目标值或检查完所有元素。时间复杂度为O(n)。'
            : '二分搜索在已排序数组中，每次检查中间元素，根据比较结果缩小搜索范围。时间复杂度为O(log n)，比线性搜索更高效。'
          }
        </p>
      </div>
    </div>
  );
};

export default SearchVisualizer;