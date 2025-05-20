import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
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
      const statuses = await prisma.studentExerciseStatus.findMany({
        where: { user_id: user.id }
      });
      const statusMap = new Map(statuses.map(s => [s.exercise_id, s.status]));
      const result = exercises.map(q => ({
        ...q,
        status: statusMap.get(q.id) || '未作'
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