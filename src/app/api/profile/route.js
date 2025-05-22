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
  if (!user) {
    return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });
  if (!dbUser) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }
  return NextResponse.json({ user: dbUser });
} 