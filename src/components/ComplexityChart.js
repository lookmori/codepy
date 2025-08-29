'use client';

import React, { useState, useEffect } from 'react';

const ComplexityChart = ({ showComparison = true }) => {
  const [inputSize, setInputSize] = useState(10);
  const [selectedComplexities, setSelectedComplexities] = useState(['O(1)', 'O(log n)', 'O(n)', 'O(n²)']);

  const complexityFunctions = {
    'O(1)': (n) => 1,
    'O(log n)': (n) => Math.log2(n),
    'O(n)': (n) => n,
    'O(n log n)': (n) => n * Math.log2(n),
    'O(n²)': (n) => n * n,
    'O(n³)': (n) => n * n * n,
    'O(2^n)': (n) => Math.pow(2, n)
  };

  const complexityColors = {
    'O(1)': '#10B981',      // green
    'O(log n)': '#3B82F6',  // blue
    'O(n)': '#F59E0B',      // yellow
    'O(n log n)': '#F97316', // orange
    'O(n²)': '#EF4444',     // red
    'O(n³)': '#8B5CF6',     // purple
    'O(2^n)': '#EC4899'     // pink
  };

  const generateDataPoints = (maxN = 20) => {
    const points = [];
    for (let n = 1; n <= maxN; n++) {
      const point = { n };
      Object.keys(complexityFunctions).forEach(complexity => {
        if (selectedComplexities.includes(complexity)) {
          point[complexity] = complexityFunctions[complexity](n);
        }
      });
      points.push(point);
    }
    return points;
  };

  const dataPoints = generateDataPoints(inputSize);
  const maxValue = Math.max(...dataPoints.map(point => 
    Math.max(...selectedComplexities.map(c => point[c] || 0))
  ));

  const toggleComplexity = (complexity) => {
    setSelectedComplexities(prev => 
      prev.includes(complexity) 
        ? prev.filter(c => c !== complexity)
        : [...prev, complexity]
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          算法复杂度对比图
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          不同时间复杂度随输入规模增长的对比
        </p>
      </div>

      {/* 控制面板 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              输入规模 (n):
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={inputSize}
              onChange={(e) => setInputSize(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-mono">{inputSize}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(complexityFunctions).map(complexity => (
            <button
              key={complexity}
              onClick={() => toggleComplexity(complexity)}
              className={`px-3 py-1 rounded text-sm font-mono transition-all ${
                selectedComplexities.includes(complexity)
                  ? 'text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              style={{
                backgroundColor: selectedComplexities.includes(complexity) 
                  ? complexityColors[complexity] 
                  : undefined
              }}
            >
              {complexity}
            </button>
          ))}
        </div>
      </div>

      {/* 图表 */}
      <div className="mb-6">
        <div className="relative h-64 border-l-2 border-b-2 border-gray-300 dark:border-gray-600">
          {/* Y轴标签 */}
          <div className="absolute -left-8 top-0 text-xs text-gray-500 transform -rotate-90 origin-center">
            操作次数
          </div>
          
          {/* X轴标签 */}
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
            输入规模 (n)
          </div>

          {/* 网格线 */}
          {[0.25, 0.5, 0.75].map(ratio => (
            <div
              key={ratio}
              className="absolute w-full border-t border-gray-200 dark:border-gray-700"
              style={{ bottom: `${ratio * 100}%` }}
            />
          ))}

          {/* 数据线 */}
          <svg className="absolute inset-0 w-full h-full">
            {selectedComplexities.map(complexity => {
              const points = dataPoints.map((point, index) => ({
                x: (index / (dataPoints.length - 1)) * 100,
                y: 100 - (point[complexity] / maxValue) * 100
              }));

              const pathData = points.reduce((path, point, index) => {
                const command = index === 0 ? 'M' : 'L';
                return `${path} ${command} ${point.x}% ${point.y}%`;
              }, '');

              return (
                <path
                  key={complexity}
                  d={pathData}
                  fill="none"
                  stroke={complexityColors[complexity]}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* 数据点 */}
          {selectedComplexities.map(complexity => 
            dataPoints.map((point, index) => (
              <div
                key={`${complexity}-${index}`}
                className="absolute w-2 h-2 rounded-full transform -translate-x-1 -translate-y-1"
                style={{
                  backgroundColor: complexityColors[complexity],
                  left: `${(index / (dataPoints.length - 1)) * 100}%`,
                  bottom: `${(point[complexity] / maxValue) * 100}%`
                }}
                title={`${complexity}: n=${point.n}, 操作数=${Math.round(point[complexity])}`}
              />
            ))
          )}
        </div>
      </div>

      {/* 数据表格 */}
      {showComparison && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            当 n = {inputSize} 时的操作次数对比:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">复杂度</th>
                  <th className="text-right py-2 text-gray-600 dark:text-gray-400">操作次数</th>
                  <th className="text-right py-2 text-gray-600 dark:text-gray-400">相对比例</th>
                </tr>
              </thead>
              <tbody>
                {selectedComplexities.map(complexity => {
                  const operations = complexityFunctions[complexity](inputSize);
                  const minOperations = Math.min(...selectedComplexities.map(c => 
                    complexityFunctions[c](inputSize)
                  ));
                  const ratio = operations / minOperations;
                  
                  return (
                    <tr key={complexity} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <span 
                          className="inline-block w-3 h-3 rounded mr-2"
                          style={{ backgroundColor: complexityColors[complexity] }}
                        />
                        <code>{complexity}</code>
                      </td>
                      <td className="text-right py-2 font-mono">
                        {operations > 1000000 
                          ? `${(operations / 1000000).toFixed(1)}M`
                          : operations > 1000 
                          ? `${(operations / 1000).toFixed(1)}K`
                          : Math.round(operations)
                        }
                      </td>
                      <td className="text-right py-2 font-mono">
                        {ratio.toFixed(1)}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">复杂度说明:</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div><code>O(1)</code> - 常数时间：无论输入多大，执行时间都一样</div>
          <div><code>O(log n)</code> - 对数时间：如二分搜索，每次减半搜索空间</div>
          <div><code>O(n)</code> - 线性时间：如遍历数组，时间与输入成正比</div>
          <div><code>O(n²)</code> - 平方时间：如冒泡排序，嵌套循环</div>
        </div>
      </div>
    </div>
  );
};

export default ComplexityChart;