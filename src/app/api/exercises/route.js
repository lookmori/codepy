import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

function getUserFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  // 匹配所有 token=xxx
  const tokens = [...cookie.matchAll(/token=([^;]+)/g)].map(m => m[1]);
  // 取最长的那个（通常是 JWT）
  const jwtToken = tokens.length ? tokens.reduce((a, b) => (a.length > b.length ? a : b)) : null;
  console.log('cookie:', cookie);
  console.log('all tokens:', tokens);
  console.log('jwtToken:', jwtToken);
  if (!jwtToken) return null;
  try {
    const user = jwt.verify(jwtToken, JWT_SECRET);
    console.log('jwt.verify success:', user);
    return user;
  } catch (e) {
    console.error('JWT verify error:', e);
    return null;
  }
}

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exercises = await prisma.exercise.findMany();

    if (user.role === 'STUDENT') {
      // 联表查询每道题的当前用户答题状态，字段名为 answers
      const exercises = await prisma.exercise.findMany({
        include: {
          answers: {
            where: { user_id: user.id },
            select: { status: true }
          }
        }
      });
      const result = exercises.map(q => ({
        ...q,
        status: q.answers[0]?.status || '未作',
        answers: undefined // 可选：去掉冗余字段
      }));
      return NextResponse.json({ exercises: result });
    } else {
      return NextResponse.json({ exercises });
    }
  } catch (error) {
    console.error('获取练习题错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 