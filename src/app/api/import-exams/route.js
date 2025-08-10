import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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
    return NextResponse.json({ error: 'Forbidden: Only admin can import exams' }, { status: 403 });
  }

  try {
    const { exams } = await request.json();

    if (!Array.isArray(exams) || exams.length === 0) {
      return NextResponse.json({ error: 'No exams provided' }, { status: 400 });
    }

    // 批量处理试卷数据
    const results = await Promise.all(exams.map(async (exam) => {
      // 1. 创建试卷
      const createdExam = await prisma.exam.create({
        data: {
          name: String(exam.name || `考试 ${Date.now()}`),
          description: String(exam.description || ''),
          category: String(exam.category || '未分类'),
          difficulty: String(exam.difficulty || '中等'),
          duration: Number(exam.duration || 60), // 默认60分钟
          totalScore: Number(exam.totalScore || 100), // 默认100分
          passingScore: Number(exam.passingScore || 60), // 默认60分及格
        }
      });

      // 2. 如果有题目，创建题目
      if (Array.isArray(exam.questions) && exam.questions.length > 0) {
        // 处理每个题目
        const questions = exam.questions.map((q, index) => {
          // 根据题目类型处理 options 字段
          let options = [];

          if (q.type === 'PROGRAMMING') {
            // 编程题：将要求、输入输出示例等信息保存到 options 中
            options = {
              requirements: q.requirements || [],
              inputExample: q.inputExample || '',
              outputExample: q.outputExample || ''
            };
          } else if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
            // 选择题：保存选项数组
            options = Array.isArray(q.options) ? q.options : [];
          } else if (q.type === 'TRUE_FALSE') {
            // 判断题：固定选项
            options = ['正确', '错误'];
          } else {
            // 其他类型：保持原有逻辑
            options = Array.isArray(q.options) ? q.options : [];
          }

          return {
            examId: createdExam.id,
            title: String(q.title || `题目 ${index + 1}`),
            content: String(q.content || ''),
            type: String(q.type || 'SINGLE_CHOICE'), // 默认单选题
            score: Number(q.score || 5), // 默认5分
            options: options,
            answer: String(q.answer || ''),
            explanation: String(q.explanation || ''),
            orderIndex: index, // 题目顺序
          };
        });

        // 批量创建题目
        await prisma.question.createMany({
          data: questions,
          skipDuplicates: false,
        });
      }

      return createdExam;
    }));

    return NextResponse.json({
      success: true,
      count: results.length,
      exams: results.map(e => ({ id: e.id, name: e.name }))
    });
  } catch (error) {
    console.error('导入试卷错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 