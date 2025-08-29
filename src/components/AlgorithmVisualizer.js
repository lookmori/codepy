"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import CustomSelect from "./CustomSelect";

const AlgorithmVisualizer = ({
  algorithm = "bubble",
  data = [64, 34, 25, 12, 22, 11, 90],
}) => {
  const [array, setArray] = useState([...data]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [pivot, setPivot] = useState(-1);
  const [heapRange, setHeapRange] = useState([]);
  const [mergeRange, setMergeRange] = useState([]);
  const [leftArray, setLeftArray] = useState([]);
  const [rightArray, setRightArray] = useState([]);
  const [speed, setSpeed] = useState(1000);
  const [currentAction, setCurrentAction] = useState("");
  const [stepCount, setStepCount] = useState(0);
  const pauseRef = useRef(false);

  const resetArray = () => {
    setArray([...data]);
    setComparing([]);
    setSorted([]);
    setPivot(-1);
    setHeapRange([]);
    setMergeRange([]);
    setLeftArray([]);
    setRightArray([]);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentAction("");
    setStepCount(0);
    pauseRef.current = false;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForResume = async () => {
    while (pauseRef.current) {
      await sleep(100);
    }
  };

  const showAction = async (action) => {
    setCurrentAction(action);
    setStepCount((prev) => prev + 1);
    await sleep(speed);
    await waitForResume();
  };

  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;

    await showAction("开始冒泡排序");

    for (let i = 0; i < n - 1; i++) {
      await showAction(`第 ${i + 1} 轮排序，将最大元素移到位置 ${n - 1 - i}`);

      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await showAction(`比较 ${arr[j]} 和 ${arr[j + 1]}`);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await showAction(
            `交换 ${arr[j + 1]} 和 ${arr[j]}，因为 ${arr[j + 1]} > ${arr[j]}`
          );
        } else {
          await showAction(`不交换，因为 ${arr[j]} ≤ ${arr[j + 1]}`);
        }
      }
      setSorted((prev) => [...prev, n - 1 - i]);
      await showAction(`位置 ${n - 1 - i} 已排序完成`);
    }
    setSorted((prev) => [...prev, 0]);
    setComparing([]);
    await showAction("冒泡排序完成！");
  };

  const selectionSort = async () => {
    const arr = [...array];
    const n = arr.length;

    await showAction("开始选择排序");

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setComparing([i]);
      await showAction(`第 ${i + 1} 轮：在位置 ${i} 到 ${n - 1} 中寻找最小值`);

      for (let j = i + 1; j < n; j++) {
        setComparing([i, j, minIdx]);
        await showAction(`比较 ${arr[j]} 和当前最小值 ${arr[minIdx]}`);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          await showAction(`找到更小的值 ${arr[j]}，更新最小值位置为 ${j}`);
        }
      }

      if (minIdx !== i) {
        await showAction(
          `将最小值 ${arr[minIdx]} 与位置 ${i} 的 ${arr[i]} 交换`
        );
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
      } else {
        await showAction(`位置 ${i} 已经是最小值，无需交换`);
      }

      setSorted((prev) => [...prev, i]);
      await showAction(`位置 ${i} 排序完成`);
    }
    setSorted((prev) => [...prev, n - 1]);
    setComparing([]);
    await showAction("选择排序完成！");
  };

  const insertionSort = async () => {
    const arr = [...array];
    const n = arr.length;

    await showAction("开始插入排序");
    setSorted([0]); // 第一个元素默认已排序

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      setComparing([i]);
      await showAction(`第 ${i + 1} 轮：将 ${key} 插入到已排序部分的正确位置`);

      while (j >= 0 && arr[j] > key) {
        setComparing([j, j + 1]);
        await showAction(`${arr[j]} > ${key}，将 ${arr[j]} 向右移动`);

        arr[j + 1] = arr[j];
        setArray([...arr]);
        j--;
        await sleep(speed / 2);
      }

      arr[j + 1] = key;
      setArray([...arr]);
      setSorted((prev) => [...prev, i]);
      await showAction(`将 ${key} 插入到位置 ${j + 1}`);
    }

    setComparing([]);
    await showAction("插入排序完成！");
  };

  const quickSort = async (arr, low = 0, high = arr.length - 1, depth = 0) => {
    if (low < high) {
      const indent = "  ".repeat(depth);
      await showAction(`${indent}快速排序区间 [${low}, ${high}]`);

      const pi = await partition(arr, low, high, depth);
      await showAction(`${indent}基准元素 ${arr[pi]} 已就位，位置 ${pi}`);

      await quickSort(arr, low, pi - 1, depth + 1);
      await quickSort(arr, pi + 1, high, depth + 1);
    }
  };

  const partition = async (arr, low, high, depth) => {
    const pivot = arr[high];
    setPivot(high);
    const indent = "  ".repeat(depth);
    await showAction(`${indent}选择 ${pivot} 作为基准元素`);

    let i = low - 1;

    for (let j = low; j < high; j++) {
      setComparing([j, high]);
      await showAction(`${indent}比较 ${arr[j]} 和基准 ${pivot}`);

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          await showAction(
            `${indent}${arr[j]} < ${pivot}，交换 ${arr[i]} 和 ${arr[j]}`
          );
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
        }
      }
    }

    await showAction(`${indent}将基准 ${pivot} 放到正确位置 ${i + 1}`);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    setPivot(-1);

    return i + 1;
  };

  const startQuickSort = async () => {
    const arr = [...array];
    await showAction("开始快速排序");
    await quickSort(arr, 0, arr.length - 1);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setComparing([]);
    await showAction("快速排序完成！");
  };

  const heapSort = async () => {
    const arr = [...array];
    const n = arr.length;

    await showAction("开始堆排序");

    // 构建最大堆
    await showAction("第一阶段：构建最大堆");
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(arr, n, i, "构建堆");
    }

    await showAction("最大堆构建完成，开始排序");

    // 一个个从堆顶取出元素
    for (let i = n - 1; i > 0; i--) {
      setHeapRange(Array.from({ length: i + 1 }, (_, idx) => idx));

      // 将当前最大元素（堆顶）移到数组末尾
      await showAction(
        `将堆顶最大元素 ${arr[0]} 与位置 ${i} 的 ${arr[i]} 交换`
      );
      setComparing([0, i]);
      [arr[0], arr[i]] = [arr[i], arr[0]];
      setArray([...arr]);
      await sleep(speed);

      setSorted((prev) => [...prev, i]);
      await showAction(`位置 ${i} 已排序，堆大小减少到 ${i}`);

      // 重新调整堆
      await heapify(arr, i, 0, "重新调整堆");
    }

    setSorted((prev) => [...prev, 0]);
    setComparing([]);
    setHeapRange([]);
    await showAction("堆排序完成！");
  };

  const heapify = async (arr, n, i, phase) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    await showAction(`${phase}：调整节点 ${i}（值：${arr[i]}）`);
    setComparing([i]);
    await sleep(speed / 2);

    // 检查左子节点
    if (left < n) {
      setComparing([i, left]);
      await showAction(
        `比较节点 ${i}（${arr[i]}）和左子节点 ${left}（${arr[left]}）`
      );
      if (arr[left] > arr[largest]) {
        largest = left;
        await showAction(`左子节点 ${arr[left]} 更大，更新最大值位置`);
      }
    }

    // 检查右子节点
    if (right < n) {
      setComparing([largest, right]);
      await showAction(
        `比较当前最大值 ${arr[largest]} 和右子节点 ${right}（${arr[right]}）`
      );
      if (arr[right] > arr[largest]) {
        largest = right;
        await showAction(`右子节点 ${arr[right]} 更大，更新最大值位置`);
      }
    }

    // 如果最大值不是根节点，则交换并继续调整
    if (largest !== i) {
      await showAction(
        `交换节点 ${i}（${arr[i]}）和节点 ${largest}（${arr[largest]}）`
      );
      setComparing([i, largest]);
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      setArray([...arr]);
      await sleep(speed);

      // 递归调整受影响的子树
      await heapify(arr, n, largest, phase);
    } else {
      await showAction(`节点 ${i} 已满足堆性质，无需调整`);
    }

    setComparing([]);
  };

  const mergeSort = async () => {
    const arr = [...array];
    await showAction("开始归并排序");
    await mergeSortHelper(arr, 0, arr.length - 1, 0);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setComparing([]);
    setMergeRange([]);
    setLeftArray([]);
    setRightArray([]);
    await showAction("归并排序完成！");
  };

  const mergeSortHelper = async (arr, left, right, depth) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      const indent = "  ".repeat(depth);

      // 显示当前分割的范围
      setMergeRange(
        Array.from({ length: right - left + 1 }, (_, i) => left + i)
      );
      await showAction(
        `${indent}分割数组 [${left}, ${right}] 为 [${left}, ${mid}] 和 [${
          mid + 1
        }, ${right}]`
      );

      // 递归排序左半部分
      await showAction(`${indent}递归排序左半部分 [${left}, ${mid}]`);
      await mergeSortHelper(arr, left, mid, depth + 1);

      // 递归排序右半部分
      await showAction(`${indent}递归排序右半部分 [${mid + 1}, ${right}]`);
      await mergeSortHelper(arr, mid + 1, right, depth + 1);

      // 合并两个已排序的部分
      await showAction(
        `${indent}合并 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`
      );
      await merge(arr, left, mid, right, depth);
    }
  };

  const merge = async (arr, left, mid, right, depth) => {
    const indent = "  ".repeat(depth);

    // 创建临时数组
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    setLeftArray(leftArr);
    setRightArray(rightArr);
    setMergeRange(Array.from({ length: right - left + 1 }, (_, i) => left + i));

    await showAction(
      `${indent}左数组: [${leftArr.join(", ")}], 右数组: [${rightArr.join(
        ", "
      )}]`
    );

    let i = 0,
      j = 0,
      k = left;

    // 合并两个数组
    while (i < leftArr.length && j < rightArr.length) {
      setComparing([left + i, mid + 1 + j]);
      await showAction(`${indent}比较 ${leftArr[i]} 和 ${rightArr[j]}`);

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        await showAction(
          `${indent}${leftArr[i]} ≤ ${rightArr[j]}，将 ${leftArr[i]} 放入位置 ${k}`
        );
        i++;
      } else {
        arr[k] = rightArr[j];
        await showAction(
          `${indent}${leftArr[i]} > ${rightArr[j]}，将 ${rightArr[j]} 放入位置 ${k}`
        );
        j++;
      }

      setArray([...arr]);
      k++;
      await sleep(speed);
    }

    // 复制左数组剩余元素
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      await showAction(`${indent}复制左数组剩余元素 ${leftArr[i]} 到位置 ${k}`);
      setArray([...arr]);
      i++;
      k++;
      await sleep(speed / 2);
    }

    // 复制右数组剩余元素
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      await showAction(
        `${indent}复制右数组剩余元素 ${rightArr[j]} 到位置 ${k}`
      );
      setArray([...arr]);
      j++;
      k++;
      await sleep(speed / 2);
    }

    setComparing([]);
    await showAction(
      `${indent}合并完成: [${arr.slice(left, right + 1).join(", ")}]`
    );
  };

  const startSorting = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setSorted([]);
    setComparing([]);
    setPivot(-1);
    setCurrentAction("");
    setStepCount(0);
    pauseRef.current = false;

    try {
      if (algorithm === "bubble") {
        await bubbleSort();
      } else if (algorithm === "selection") {
        await selectionSort();
      } else if (algorithm === "insertion") {
        await insertionSort();
      } else if (algorithm === "quick") {
        await startQuickSort();
      } else if (algorithm === "heap") {
        await heapSort();
      } else if (algorithm === "merge") {
        await mergeSort();
      }
    } catch (error) {
      console.error("排序过程中出错:", error);
    }

    setIsRunning(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isRunning) {
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);
      pauseRef.current = newPausedState;
    }
  };

  const getBarColor = (index) => {
    if (pivot === index) return "bg-purple-500"; // 基准元素
    if (sorted.includes(index)) return "bg-green-500"; // 已排序
    if (comparing.includes(index)) return "bg-red-500"; // 正在比较
    if (heapRange.includes(index) && !sorted.includes(index))
      return "bg-orange-400"; // 堆范围
    if (mergeRange.includes(index) && !sorted.includes(index))
      return "bg-yellow-400"; // 归并范围
    return "bg-blue-500"; // 默认
  };

  const getAlgorithmName = () => {
    const names = {
      bubble: "冒泡排序",
      selection: "选择排序",
      insertion: "插入排序",
      quick: "快速排序",
      heap: "堆排序",
      merge: "归并排序",
    };
    return names[algorithm] || "排序算法";
  };

  const getAlgorithmDescription = () => {
    const descriptions = {
      bubble:
        '冒泡排序通过重复遍历数组，比较相邻元素并交换位置，让大的元素像气泡一样"冒"到数组末尾。时间复杂度：O(n²)',
      selection:
        "选择排序每次从未排序部分选择最小元素，放到已排序部分的末尾。时间复杂度：O(n²)",
      insertion:
        "插入排序将每个元素插入到已排序部分的正确位置，类似于整理扑克牌。时间复杂度：O(n²)",
      quick:
        "快速排序选择一个基准元素，将数组分为小于和大于基准的两部分，然后递归排序。平均时间复杂度：O(n log n)",
      heap: "堆排序首先构建最大堆，然后重复取出堆顶最大元素放到数组末尾，并重新调整堆。时间复杂度：O(n log n)",
      merge:
        "归并排序采用分治策略，将数组分成两半分别排序，然后合并两个已排序的数组。时间复杂度：O(n log n)",
    };
    return descriptions[algorithm] || "";
  };

  const maxValue = Math.max(...array);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {getAlgorithmName()}可视化
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          红色：正在比较 | 绿色：已排序 | 紫色：基准元素 | 橙色：堆范围 |
          黄色：归并范围 | 蓝色：未排序
        </p>
      </div>

      {/* 当前操作提示 */}
      {currentAction && (
        <div
          className={`mb-4 p-3 border rounded ${
            isPaused
              ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                isPaused
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-blue-800 dark:text-blue-200"
              }`}
            >
              步骤 {stepCount}: {currentAction}
              {isPaused && <span className="ml-2 text-xs">(已暂停)</span>}
            </span>
          </div>
        </div>
      )}

      {/* 可视化区域 */}
      <div className="flex items-end justify-center space-x-1 mb-6 h-64">
        {array.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 transition-all duration-500 ${getBarColor(
                index
              )}`}
              style={{
                height: `${(value / maxValue) * 200}px`,
                minHeight: "20px",
              }}
            />
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Button
          onClick={startSorting}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isRunning ? "排序中..." : "开始排序"}
        </Button>

        {isRunning && (
          <Button
            onClick={togglePause}
            className={
              isPaused
                ? "bg-green-500 hover:bg-green-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            }
          >
            {isPaused ? "继续" : "暂停"}
          </Button>
        )}

        <Button onClick={resetArray} disabled={isRunning} variant="outline">
          重置
        </Button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            速度:
          </label>
          <div className="w-24">
            <CustomSelect
              value={speed}
              onChange={setSpeed}
              disabled={isRunning}
              options={[
                { value: 2000, label: "很慢" },
                { value: 1500, label: "慢" },
                { value: 1000, label: "中等" },
                { value: 500, label: "快" },
                { value: 200, label: "很快" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 算法说明 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          算法说明:
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getAlgorithmDescription()}
        </p>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;
