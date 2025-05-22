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

function getStartDate(range) {
  const now = new Date();
  if (range === 'year') {
    now.setFullYear(now.getFullYear() - 1);
  } else if (range === 'halfyear') {
    now.setMonth(now.getMonth() - 6);
  } else {
    now.setMonth(now.getMonth() - 1);
  }
  return now;
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'month';
  const startDate = getStartDate(range);

  // 查询该用户在时间范围内的所有答题记录
  const records = await prisma.studentExerciseStatus.findMany({
    where: {
      user_id: user.id,
      submit_time: { gte: startDate },
    },
    select: {
      submit_time: true,
      status: true,
    },
    orderBy: { submit_time: 'asc' },
  });

  // 按天统计做题数和正确数，只包含有记录的日期
  const statsMap = {};
  records.forEach(r => {
    const day = r.submit_time.toISOString().slice(0, 10);
    if (!statsMap[day]) statsMap[day] = { total: 0, correct: 0 };
    statsMap[day].total++;
    if (r.status === '已通过' || r.status === '正确') statsMap[day].correct++;
  });

  // 将统计结果转换为数组并按日期排序
  const stats = Object.entries(statsMap)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({ stats });
} 