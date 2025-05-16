'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 忘记密码模态框状态
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetFormData, setResetFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetErrors, setResetErrors] = useState({});
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // 检查URL参数，如果从注册页面重定向而来，显示成功消息
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setSuccessMessage('注册成功！请登录您的账号。');
    }
  }, [searchParams]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除该字段的错误
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // 清除错误和成功消息
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };
  
  // 验证登录表单
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱地址';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少为6个字符';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 处理重置密码表单变化
  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除该字段的错误
    if (resetErrors[name]) {
      setResetErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // 验证重置密码表单
  const validateResetForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!resetFormData.email.trim()) {
      errors.email = '请输入邮箱地址';
    } else if (!emailRegex.test(resetFormData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!resetFormData.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (resetFormData.newPassword.length < 6) {
      errors.newPassword = '密码长度至少为6个字符';
    }
    
    if (!resetFormData.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    
    setResetErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 处理重置密码提交
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (validateResetForm()) {
      setResetLoading(true);
      
      try {
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: resetFormData.email,
            newPassword: resetFormData.newPassword,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '密码重置失败');
        }
        
        // 重置成功
        setResetSuccess(true);
        
        // 3秒后关闭模态框
        setTimeout(() => {
          setShowResetModal(false);
          setResetSuccess(false);
          setResetFormData({
            email: '',
            newPassword: '',
            confirmPassword: ''
          });
        }, 3000);
      } catch (error) {
        console.error('密码重置错误:', error);
        setResetErrors(prev => ({
          ...prev,
          form: error.message
        }));
      } finally {
        setResetLoading(false);
      }
    }
  };
  
  // 设置cookie的辅助函数
  const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('表单提交开始...');
    
    // 表单验证
    if (!validateForm()) {
      console.log('表单验证失败');
      return;
    }
    
    setIsLoading(true);
    setError('');
    console.log('发送登录请求:', formData.email);
    
    try {
      console.log('准备发起API请求...');
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      console.log('API响应状态:', response.status);
      let data;
      try {
        data = await response.json();
        console.log('API响应数据:', data);
      } catch (jsonError) {
        console.error('解析响应JSON失败:', jsonError);
        throw new Error('服务器响应格式错误');
      }
      
      if (!response.ok) {
        const errorMessage = data.error || data.details || '登录失败';
        console.error('服务器返回错误:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // 登录成功，存储用户信息
      console.log('登录成功，存储用户信息');
      console.log('用户数据结构:', data.user);
      console.log('用户名:', data.user.username || data.user.name);
      
      // 确保先移除旧数据，然后再设置新数据（避免可能的缓存问题）
      localStorage.removeItem('user');
      localStorage.removeItem('auth_timestamp');
      
      // 设置用户数据
      localStorage.setItem('user', JSON.stringify(data.user));
      // 设置认证时间戳（用于触发事件和检测登录状态变化）
      localStorage.setItem('auth_timestamp', Date.now().toString());
      
      // 手动触发storage事件，确保同一窗口内也能捕获到变化
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        oldValue: null,
        newValue: JSON.stringify(data.user)
      }));
      
      // 触发auth_timestamp变化事件
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth_timestamp',
        oldValue: null,
        newValue: Date.now().toString()
      }));
      
      // 触发自定义事件通知导航栏
      window.dispatchEvent(new Event('auth-change'));
      
      // 设置cookie以便中间件可以使用
      setCookie('auth-token', 'authenticated', formData.remember ? 30 : 1);
      setCookie('user-role', data.user.role, formData.remember ? 30 : 1);
      
      // 登录成功，重定向到首页
      console.log('准备重定向到首页');
      
      // 添加短暂延迟，确保状态更新
      setTimeout(() => {
        console.log('延迟执行导航跳转');
        // 再次触发事件确保导航栏更新
        window.dispatchEvent(new Event('auth-change'));
        // 导航到首页
        router.push('/', undefined, { shallow: false });
      }, 300);
    } catch (error) {
      console.error('登录错误详情:', error);
      setError(typeof error === 'string' ? error : error.message || '登录失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 忘记密码模态框
  const ResetPasswordModal = () => {
    if (!showResetModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {resetSuccess ? '密码重置成功' : '重置密码'}
            </h3>
            <button
              onClick={() => setShowResetModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              type="button"
              aria-label="关闭"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {resetSuccess ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">密码已成功重置！</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">请使用新密码登录您的账号。</p>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit}>
              {resetErrors.form && (
                <div className="mb-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4">
                  <p>{resetErrors.form}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  value={resetFormData.email}
                  onChange={handleResetChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    resetErrors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  placeholder="请输入您的邮箱地址"
                  required
                />
                {resetErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{resetErrors.email}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="reset-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新密码 <span className="text-red-500">*</span>
                </label>
                <input
                  id="reset-new-password"
                  name="newPassword"
                  type="password"
                  value={resetFormData.newPassword}
                  onChange={handleResetChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    resetErrors.newPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  placeholder="请输入新密码"
                  required
                  minLength="6"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  密码长度至少为6个字符
                </p>
                {resetErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{resetErrors.newPassword}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  确认新密码 <span className="text-red-500">*</span>
                </label>
                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={resetFormData.confirmPassword}
                  onChange={handleResetChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    resetErrors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  placeholder="请再次输入新密码"
                  required
                />
                {resetErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{resetErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    resetLoading 
                      ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {resetLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </>
                  ) : '重置密码'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧图片区域 (60%) */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-tr from-teal-500 via-emerald-600 to-green-700 dark:from-teal-800 dark:via-emerald-900 dark:to-green-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.1)"/>
            <circle cx="80" cy="30" r="15" fill="rgba(255,255,255,0.1)"/>
            <circle cx="40" cy="80" r="25" fill="rgba(255,255,255,0.1)"/>
            <circle cx="70" cy="70" r="18" fill="rgba(255,255,255,0.1)"/>
          </svg>
        </div>
        <div className="max-w-2xl p-8 relative z-10">
          <svg className="w-full h-auto" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Python Editor Screen */}
            <rect x="56" y="46" width="400" height="300" rx="10" fill="#1E293B"/>
            <rect x="56" y="46" width="400" height="32" rx="10" fill="#334155"/>
            <circle cx="76" cy="62" r="6" fill="#EF4444"/>
            <circle cx="96" cy="62" r="6" fill="#F59E0B"/>
            <circle cx="116" cy="62" r="6" fill="#10B981"/>
            
            {/* Editor Content */}
            <text x="76" y="105" fontFamily="monospace" fontSize="12" fill="#CE9178">
              <tspan x="76" dy="0">"Hello, Python!"</tspan>
            </text>
            
            <text x="76" y="135" fontFamily="monospace" fontSize="12" fill="#569CD6">
              <tspan x="76" dy="0">def</tspan>
            </text>
            <text x="100" y="135" fontFamily="monospace" fontSize="12" fill="#DCDCAA">
              <tspan x="100" dy="0">greet</tspan>
            </text>
            <text x="136" y="135" fontFamily="monospace" fontSize="12" fill="#D4D4D4">
              <tspan x="136" dy="0">(name):</tspan>
            </text>
            
            <text x="96" y="165" fontFamily="monospace" fontSize="12" fill="#569CD6">
              <tspan x="96" dy="0">return</tspan>
            </text>
            <text x="136" y="165" fontFamily="monospace" fontSize="12" fill="#CE9178">
              <tspan x="136" dy="0">`Welcome, ${name}!`</tspan>
            </text>
            
            <text x="76" y="195" fontFamily="monospace" fontSize="12" fill="#569CD6">
              <tspan x="76" dy="0">class</tspan>
            </text>
            <text x="110" y="195" fontFamily="monospace" fontSize="12" fill="#4EC9B0">
              <tspan x="110" dy="0">User:</tspan>
            </text>
            
            <text x="96" y="225" fontFamily="monospace" fontSize="12" fill="#569CD6">
              <tspan x="96" dy="0">def</tspan>
            </text>
            <text x="120" y="225" fontFamily="monospace" fontSize="12" fill="#DCDCAA">
              <tspan x="120" dy="0">__init__</tspan>
            </text>
            <text x="173" y="225" fontFamily="monospace" fontSize="12" fill="#D4D4D4">
              <tspan x="173" dy="0">(self, name, role):</tspan>
            </text>
            
            <text x="116" y="255" fontFamily="monospace" fontSize="12" fill="#D4D4D4">
              <tspan x="116" dy="0">self.name = name</tspan>
            </text>
            
            <text x="116" y="285" fontFamily="monospace" fontSize="12" fill="#D4D4D4">
              <tspan x="116" dy="0">self.role = role</tspan>
            </text>
            
            {/* Console Output */}
            <rect x="76" y="315" width="360" height="90" rx="5" fill="#2D3748"/>
            <text x="96" y="340" fontFamily="monospace" fontSize="12" fill="#38BDF8">
              <tspan x="96" dy="0">&gt;&gt;&gt; </tspan>
            </text>
            <text x="126" y="340" fontFamily="monospace" fontSize="12" fill="#D4D4D4">
              <tspan x="126" dy="0">user = User("Student", "Learner")</tspan>
            </text>
            <text x="96" y="370" fontFamily="monospace" fontSize="12" fill="#38BDF8">
              <tspan x="96" dy="0">&gt;&gt;&gt; </tspan>
            </text>
            <text x="126" y="370" fontFamily="monospace" fontSize="12" fill="#D4D4D4">
              <tspan x="126" dy="0">print(greet(user.name))</tspan>
            </text>
            <text x="96" y="400" fontFamily="monospace" fontSize="12" fill="#10B981">
              <tspan x="96" dy="0">Welcome, Student!</tspan>
            </text>
            
            {/* Floating Elements */}
            <g transform="translate(30, 410) scale(0.9)">
              <path d="M85.7,446.6c-0.2,0-0.4,0-0.5-0.1c-10.1-2.9-16.5-10.3-16.5-19.6c0-12.2,14-22.2,31.2-22.2s31.2,10,31.2,22.2 c0,0.8-0.7,1.5-1.5,1.5s-1.5-0.7-1.5-1.5c0-10.5-12.6-19.2-28.2-19.2c-15.6,0-28.2,8.6-28.2,19.2c0,7.8,5.6,14,14.3,16.5 c0.8,0.2,1.3,1.1,1,1.9C86.9,446.1,86.3,446.6,85.7,446.6z" fill="#FCD34D"/>
              <path d="M115.8,428.3c-0.8,0-1.5-0.7-1.5-1.5c0-4.1-6.6-7.5-14.6-7.5c-8.1,0-14.6,3.4-14.6,7.5c0,0.8-0.7,1.5-1.5,1.5 s-1.5-0.7-1.5-1.5c0-5.8,7.9-10.5,17.6-10.5c9.7,0,17.6,4.7,17.6,10.5C117.3,427.6,116.6,428.3,115.8,428.3z" fill="#FCD34D"/>
            </g>
            
            <g transform="translate(380, 380) scale(0.35) rotate(15)">
              <path d="M95,290.9c0-42.3,33.4-76.9,78.1-83.1c-1.3-4.4-2-9-2-13.8c0-31,30.1-56.2,67.2-56.2c28.7,0,53,13.5,62.8,32.8 c10.3-5.2,22.6-8.3,35.8-8.3c37.1,0,67.2,25.2,67.2,56.2c0,3.5-0.4,6.8-1,10.1c45.9,5.2,80.9,40.4,80.9,83.4 c0,46.4-42.3,84.1-94.5,84.1H189.4C137.2,375,95,337.3,95,290.9z" fill="#E0F2FE"/>
            </g>
            
            <g transform="translate(360, 100) scale(0.3) rotate(-10)">
              <path d="M223.7,336.3c-29.8,0-59.6-11.3-82.3-34c-45.4-45.4-45.4-119.2,0-164.6L304.9,9.3c16.5-16.5,38.6-25.7,62.1-25.7 c23.4,0,45.4,9.1,62,25.6l118.3,118.3c16.5,16.5,25.6,38.6,25.6,62c0,23.4-9.1,45.4-25.6,62l-56,56c-5.9,5.9-15.4,5.9-21.2,0 c-5.9-5.9-5.9-15.4,0-21.2l56-56c10.7-10.7,16.6-24.9,16.6-40c0-15.1-5.9-29.3-16.6-40L407.8,32c-10.7-10.7-24.9-16.6-40-16.6 s-29.3,5.9-40,16.6L164.3,195.3c-33.7,33.7-33.7,88.4,0,122.1c33.7,33.7,88.4,33.7,122.1,0l137-137c22-22,22-57.7,0-79.8 c-22-22-57.7-22-79.8,0l-122,122c-10.1,10.2-10.1,26.7,0,36.9c5,5,11.6,7.7,18.6,7.7s13.6-2.7,18.6-7.7l75.3-75.3 c5.9-5.9,15.4-5.9,21.2,0c5.9,5.9,5.9,15.4,0,21.2l-75.3,75.3c-16,16-37.2,24.8-59.8,24.8s-43.8-8.8-59.8-24.8 c-32.9-32.9-32.9-86.6,0-119.5l122-122c33.7-33.7,88.5-33.7,122.2,0c33.7,33.7,33.7,88.5,0,122.2l-137,137 C283.3,325,253.5,336.3,223.7,336.3z" fill="#F87171"/>
            </g>
          </svg>
          <div className="text-center mt-8">
            <h1 className="text-3xl font-bold text-white mb-3">欢迎回到 Python 学习平台</h1>
            <p className="text-white text-lg">
              登录您的账号，继续 Python 编程学习。
              探索编程世界，提升您的技能。
            </p>
          </div>
        </div>
      </div>
      
      {/* 右侧登录表单区域 (40%) */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:w-2/5">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            登录您的账号
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            或{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              注册一个新账号
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 bg-green-50 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4" role="alert">
                <p>{successMessage}</p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      formErrors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="请输入邮箱地址"
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  密码 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      formErrors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="请输入密码"
                    required
                    minLength="6"
                  />
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    记住我
                  </label>
                </div>

                <div className="text-sm">
                  <button 
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    忘记密码?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading 
                      ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在登录...
                    </>
                  ) : '登录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* 忘记密码模态框 */}
      <ResetPasswordModal />
    </div>
  );
}