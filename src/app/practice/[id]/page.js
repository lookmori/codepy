'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MonacoEditor, { loader } from '@monaco-editor/react';
import Button from '@/components/Button';
import Toast, { useToast } from '@/components/Toast';

// Monaco Editor 只用本地资源
loader.config({
  paths: {
    vs: '/monaco/vs' // 假设 public/monaco/vs 目录下有 Monaco Editor 静态资源
  }
});

export default function PracticeDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const { addToast } = useToast();

  useEffect(() => {
    // 获取题目信息
    fetch(`/api/exercises/${id}`)
      .then(res => res.json())
      .then(data => {
        setExercise(data.exercise);
        setCode(data.exercise?.starter_code || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/exercises/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        // 解析失败，data 保持为空对象
      }
      if (res.ok) {
        setResult(data);
        addToast({ type: data.code_status ? 'success' : 'error', title: '评测结果', message: data.code_status ? '答案正确' : (data.code_error || '答案错误') });
      } else {
        setResult({ error: data.error || '提交失败，请重试', ...data });
        addToast({ type: 'error', title: '提交失败', message: data.error || '提交失败，请重试' });
      }
    } catch (e) {
      // 尝试解析后端返回的错误信息
      let errorMsg = '提交失败，请重试';
      if (e && e.response) {
        try {
          const errData = await e.response.json();
          errorMsg = errData.error || errorMsg;
        } catch {}
      }
      addToast({ type: 'error', title: '提交失败', message: errorMsg });
      setResult({ error: errorMsg });
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!exercise) return <div className="text-center py-20 text-red-400">未找到该题目</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* 左侧题目信息 */}
      <div className="flex-1 min-w-0 md:max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 !px-4 !py-2 font-semibold shadow border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200"
            onClick={() => router.push('/practice')}
          >
            <span className="text-lg">←</span>
            返回问题列表
          </Button>
          <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-300 leading-tight ml-4">{exercise.title}</h1>
        </div>
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 font-semibold">难度: {exercise.difficulty}</span>
          {exercise.problem_tag && exercise.problem_tag.split(',').map(tag => (
            <span key={tag} className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 font-semibold">{tag}</span>
          ))}
        </div>
        <div className="mb-6 text-gray-700 dark:text-gray-200 whitespace-pre-line text-lg leading-relaxed border-l-4 border-blue-200 dark:border-blue-700 pl-4 bg-blue-50/40 dark:bg-blue-900/20 rounded">
          {exercise.problem_description}
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded shadow-sm border-l-4 border-blue-200 dark:border-blue-700">
            <div className="font-semibold mb-1 text-gray-600 dark:text-gray-300">示例输入</div>
            <pre className="text-blue-600 dark:text-blue-200 text-sm whitespace-pre-wrap">{exercise.example_input}</pre>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded shadow-sm border-l-4 border-green-200 dark:border-green-700">
            <div className="font-semibold mb-1 text-gray-600 dark:text-gray-300">示例输出</div>
            <pre className="text-green-600 dark:text-green-200 text-sm whitespace-pre-wrap">{exercise.example_output}</pre>
          </div>
        </div>
      </div>
      {/* 右侧代码编辑区 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-gray-700 dark:text-gray-200 text-lg">代码编辑区</div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors shadow flex items-center"
            title={editorTheme === 'vs-dark' ? '切换为浅色主题' : '切换为深色主题'}
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'vs-light' : 'vs-dark')}
          >
            {editorTheme === 'vs-dark' ? (
              <span className="text-yellow-400 text-xl">☀️</span>
            ) : (
              <span className="text-blue-500 text-xl">🌙</span>
            )}
          </Button>
        </div>
        <div className="border rounded-lg overflow-hidden shadow grow bg-gray-900/5 dark:bg-gray-800/40 flex flex-col">
          <MonacoEditor
            height="70vh"
            defaultLanguage="python"
            value={code}
            onChange={setCode}
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
              // 你可以根据需要继续添加更多辅助功能
            }}
          />
        </div>
        <Button
          onClick={handleSubmit}
          loading={submitting}
          className="w-full py-3 text-lg font-bold mt-6"
          variant="primary"
        >
          提交答案
        </Button>
        {result && (
          <div className="mt-6 p-4 rounded bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow">
            {result.error ? (
              <div className="text-red-500 font-bold">{result.error}</div>
            ) : (
              <div>
                <div className="font-semibold mb-1">评测结果：</div>
                <div className={result.code_status ? "text-green-600 dark:text-green-300 font-bold" : "text-red-500 font-bold"}>
                  {result.code_status ? "答案正确！" : "答案错误"}
                </div>
                {result.code_error && (
                  <div className="mt-2 text-red-500">错误信息：{result.code_error}</div>
                )}
                {result.msg && (
                  <div className="mt-2 text-gray-500">系统消息：{result.msg}</div>
                )}
                {result.debug_url && (
                  <div className="mt-2">
                    <a href={result.debug_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">查看判题详情</a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 