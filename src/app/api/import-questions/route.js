import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

function getUserFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/token=([^;]+)/);
  if (!match) return null;
  try {
    return jwt.verify(match[1], JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(request) {
  // 管理员鉴权
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only admin can import questions' }, { status: 403 });
  }
  try {
    const { questions } = await request.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    // 批量插入题目
    const cleanQuestions = questions.map(q => ({
      title: String(q.title || ''),
      difficulty: String(q.difficulty || ''),
      example_input: String(q.example_input || ''),
      example_output: String(q.example_output || ''),
      problem_description: String(q.problem_description || ''),
      problem_tag: String(q.problem_tag || ''),
    }));
    const created = await prisma.exercise.createMany({
      data: cleanQuestions,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 