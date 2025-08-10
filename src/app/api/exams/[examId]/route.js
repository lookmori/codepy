import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { examId } = params;

    // 获取试卷详情，包含所有题目
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ 
        success: false, 
        error: '试卷不存在' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        category: exam.category,
        difficulty: exam.difficulty,
        duration: exam.duration,
        totalScore: exam.totalScore,
        passingScore: exam.passingScore,
        createdAt: exam.createdAt,
        questions: exam.questions.map(q => ({
          id: q.id,
          title: q.title,
          content: q.content,
          type: q.type,
          score: q.score,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          orderIndex: q.orderIndex
        }))
      }
    });
  } catch (error) {
    console.error('获取试卷详情错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}