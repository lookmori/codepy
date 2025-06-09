import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 查询总数
    const total = await prisma.exam.count({ where });

    // 查询分页数据
    const exams = await prisma.exam.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        totalScore: true,
        passingScore: true,
        createdAt: true,
        _count: {
          select: { questions: true }
        }
      }
    });

    // 处理返回数据，添加题目数量
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      category: exam.category,
      difficulty: exam.difficulty,
      duration: exam.duration,
      totalScore: exam.totalScore,
      passingScore: exam.passingScore,
      createdAt: exam.createdAt,
      questionCount: exam._count.questions,
      score: Math.floor(Math.random() * 40) + 60, // 模拟分数，实际应从用户成绩表获取
    }));

    return NextResponse.json({
      exams: formattedExams,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取试卷列表错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 