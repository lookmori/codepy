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

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    });
    if (!exercise) {
      return NextResponse.json({ error: '未找到该题目' }, { status: 404 });
    }
    // 获取学生做题状态和最后一次提交代码
    const user = getUserFromRequest(request);
    let status = '未作';
    let student_code = '';
    if (user && user.role === 'STUDENT') {
      const record = await prisma.studentExerciseStatus.findUnique({
        where: { user_id_exercise_id: { user_id: user.id, exercise_id: id } }
      });
      if (record) {
        status = record.status;
        student_code = record.last_code || '';
      }
    }
    return NextResponse.json({ exercise: { ...exercise, status, student_code } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 