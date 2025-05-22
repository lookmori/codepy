import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

function getUserFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const tokens = [...cookie.matchAll(/token=([^;]+)/g)].map(m => m[1]);
  const jwtToken = tokens.length ? tokens.reduce((a, b) => (a.length > b.length ? a : b)) : null;
  if (!jwtToken) return null;
  try {
    return jwt.verify(jwtToken, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  // 只有管理员和教师可以访问此接口
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return NextResponse.json({ error: '未授权或权限不足' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get('role'); // STUDENT or TEACHER
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // 校验角色参数和权限
  if (!roleFilter || (roleFilter !== 'STUDENT' && roleFilter !== 'TEACHER')) {
      return NextResponse.json({ error: '无效的用户角色过滤参数' }, { status: 400 });
  }

  // 如果查询教师列表，只有管理员可以访问
  if (roleFilter === 'TEACHER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '您没有权限查看教师列表' }, { status: 403 });
  }

  const skip = (page - 1) * limit;

  try {
    // 获取用户列表
    const users = await prisma.user.findMany({
      where: { role: roleFilter },
      select: { id: true, username: true, email: true, role: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    // 统计总用户数（用于分页）
    const totalUsers = await prisma.user.count({
      where: { role: roleFilter },
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({ users, totalPages });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
} 