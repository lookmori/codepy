'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // 清除服务器错误
    if (serverError) {
      setServerError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;
    
    // 验证姓名
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = '姓名只能包含中文、英文、数字和下划线，长度在2-20个字符之间';
    }
    
    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6个字符';
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setServerError('');
      
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'student' // 默认角色为学生
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '注册失败');
        }
        
        // 注册成功，跳转到登录页面
        router.push('/login?registered=true');
      } catch (error) {
        console.error('注册错误:', error);
        setServerError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧图片区域 (60%) */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-700 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <path d="M50,0 L100,50 L50,100 L0,50 Z" fill="rgba(255,255,255,0.1)"></path>
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="rgba(255,255,255,0.1)"></path>
            <path d="M50,20 L80,50 L50,80 L20,50 Z" fill="rgba(255,255,255,0.1)"></path>
            <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="rgba(255,255,255,0.1)"></path>
          </svg>
        </div>
        <div className="max-w-2xl p-8 relative z-10">
          <svg className="w-full h-auto" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M256 11.96L45.11 98.42V280.3L256 366.76L466.89 280.3V98.42L256 11.96Z" fill="#4B5563" fillOpacity="0.1"/>
            <path d="M256 11.96V366.76M256 11.96L45.11 98.42M256 11.96L466.89 98.42M256 366.76L45.11 280.3M256 366.76L466.89 280.3M45.11 98.42V280.3M466.89 98.42V280.3" stroke="white" strokeWidth="2"/>
            
            {/* Python Logo */}
            <g transform="translate(156, 120) scale(0.2)">
              <path d="M412.79 159.91C412.79 134 401.21 111.28 379.23 111.28L320.14 106.77L309.8 144.97L337.47 151.98C347.56 151.98 349.82 156.98 349.82 165.25V188.22H286.6V160.66H174.71V323.43H223.02V275.22H286.49V294.99C286.49 324.92 299.59 347.64 322.17 347.64L378.65 340.63L388.03 304.93L363.17 298.17C352.82 298.17 349.3 292.17 349.3 282.9V237.69H412.79V159.91Z" fill="#3874A4"/>
              <path d="M366.18 63.05C344.21 63.05 323.75 76.56 323.75 100.77V150.47H235.84V178.03H410.37V100.77C410.37 75.31 388.15 63.05 366.18 63.05Z" fill="#FFD945"/>
              <circle cx="366.35" cy="109.06" r="15.51" fill="#fff"/>
              
              <path d="M172.21 359.62C172.21 385.53 183.79 408.25 205.77 408.25L264.86 412.77L275.2 374.57L247.53 367.56C237.44 367.56 235.18 362.56 235.18 354.28V331.32H298.4V358.87H410.29V196.11H361.98V244.32H298.51V224.55C298.51 194.62 285.41 171.9 262.83 171.9L206.35 178.91L196.97 214.61L221.83 221.37C232.18 221.37 235.7 227.37 235.7 236.64V281.85H172.21V359.62Z" fill="#FFC331"/>
              <path d="M218.82 456.49C240.79 456.49 261.25 442.97 261.25 418.77V369.06H349.16V341.51H174.63V418.77C174.63 444.22 196.85 456.49 218.82 456.49Z" fill="#3874A4"/>
              <circle cx="218.65" cy="410.47" r="15.51" fill="#fff"/>
            </g>
            
            {/* Code Icons */}
            <g transform="translate(60, 100) scale(0.8)">
              <rect x="20" y="20" width="80" height="120" rx="4" fill="#E74694" fillOpacity="0.8"/>
              <rect x="30" y="40" width="60" height="6" fill="white" fillOpacity="0.9"/>
              <rect x="30" y="56" width="40" height="6" fill="white" fillOpacity="0.6"/>
              <rect x="30" y="72" width="50" height="6" fill="white" fillOpacity="0.6"/>
              <rect x="30" y="88" width="35" height="6" fill="white" fillOpacity="0.6"/>
              <rect x="30" y="104" width="45" height="6" fill="white" fillOpacity="0.6"/>
            </g>
            
            <g transform="translate(350, 140) scale(0.8)">
              <rect x="20" y="20" width="80" height="120" rx="4" fill="#60A5FA" fillOpacity="0.8"/>
              <rect x="30" y="40" width="60" height="6" fill="white" fillOpacity="0.9"/>
              <rect x="30" y="56" width="40" height="6" fill="white" fillOpacity="0.6"/>
              <rect x="30" y="72" width="50" height="6" fill="white" fillOpacity="0.6"/>
              <rect x="30" y="88" width="35" height="6" fill="white" fillOpacity="0.6"/>
              <rect x="30" y="104" width="45" height="6" fill="white" fillOpacity="0.6"/>
            </g>
            
            {/* Floating Particles */}
            <circle cx="100" cy="80" r="4" fill="#FCD34D"/>
            <circle cx="120" cy="220" r="6" fill="#F87171"/>
            <circle cx="400" cy="120" r="5" fill="#34D399"/>
            <circle cx="380" cy="240" r="7" fill="#A78BFA"/>
            
            {/* Connection Lines */}
            <path d="M100,80 L256,180 L380,240" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4"/>
            <path d="M120,220 L256,180 L400,120" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4"/>
          </svg>
          <div className="text-center mt-8">
            <h1 className="text-3xl font-bold text-white mb-3">Python 编程学习之旅</h1>
            <p className="text-white text-lg">
              加入我们的平台，开启您的 Python 编程学习之旅。
              通过实践练习掌握编程技能，成为专业的开发者。
            </p>
          </div>
        </div>
      </div>
      
      {/* 右侧注册表单区域 (40%) */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:w-2/5">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            创建新账号
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            已有账号?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              立即登录
            </Link>
          </p>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {serverError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4" role="alert">
                <p>{serverError}</p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="请输入您的姓名"
                    required
                    minLength="2"
                    maxLength="20"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    姓名只能包含中文、英文、数字和下划线，长度在2-20个字符之间
                  </p>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>
              </div>
              
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
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="请输入您的邮箱地址"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="请输入密码"
                    required
                    minLength="6"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    密码长度至少为6个字符
                  </p>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="请再次输入密码"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
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
                      处理中...
                    </>
                  ) : '注册'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 