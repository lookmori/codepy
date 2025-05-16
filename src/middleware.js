import { NextResponse } from 'next/server';

export function middleware(request) {
  // 获取请求路径
  const path = request.nextUrl.pathname;
  
  // 需要保护的路由路径
  const protectedPaths = ['/protected', '/account'];
  // 只有管理员可以访问的路径
  const adminOnlyPaths = ['/admin'];
  
  // 定义路由保护规则
  const isPathProtected = protectedPaths.some(pp => path.startsWith(pp));
  const isAdminPath = adminOnlyPaths.some(ap => path.startsWith(ap));
  
  // 获取用户令牌和角色
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  
  // 如果路径需要保护，但没有令牌，则重定向到登录页面
  if (isPathProtected && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }
  
  // 如果是管理员专用路径，但用户不是管理员，则重定向到首页
  if (isAdminPath && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 如果已经登录，且尝试访问登录或注册页面，则重定向到首页
  if ((path === '/login' || path === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// 配置匹配的路由规则
export const config = {
  matcher: [
    // 需要保护的路由
    '/protected/:path*',
    '/account/:path*',
    // 管理员路由
    '/admin/:path*',
    // 仅当用户已登录时才拦截登录和注册页面
    // 移除这些匹配器，以允许未登录用户访问这些页面
  ],
}; 