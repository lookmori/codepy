import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

// Password hash function from register route
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

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

export async function POST(request) {
  const user = getUserFromRequest(request);
  // 只有管理员和教师可以创建用户（但创建教师只有管理员可以）
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return NextResponse.json({ error: '未授权或权限不足' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, email, password, role } = body;

    // 权限检查：只有管理员可以创建教师
    if (role === 'TEACHER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '您没有权限创建教师' }, { status: 403 });
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 409 }
      );
    }
    
    // 检查用户名是否已存在（如果用户名需要唯一）
   // 检查用户名是否已存在（如果用户名需要唯一）
const existingUsername = await prisma.user.findFirst({
  where: { username }
});

    if (existingUsername) {
        return NextResponse.json(
            { error: '该用户名已存在' },
            { status: 409 }
        );
    }

    // 哈希密码
    const hashedPassword = hashPassword(password);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
      select: { id: true, username: true, email: true, role: true }, // 返回部分用户信息
    });

    return NextResponse.json({ success: true, user: newUser });

  } catch (error) {
    console.error('创建用户错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// Reuse validators from register API
// You may need to copy or import the actual validator functions if not in a shared location
// For now, assuming they are available via '@/utils/validators'

// Example placeholder validators (if not already defined elsewhere)
/*
function validateEmail(email) {
  // Basic email validation regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  // Password must be at least 6 characters long
  return password.length >= 6;
}

function validateName(name) {
    // Name can contain Chinese, English, numbers, and underscore, 2-20 characters
    const re = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/;
    return re.test(name);
}
*/