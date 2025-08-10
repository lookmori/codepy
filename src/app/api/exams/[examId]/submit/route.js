import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { examId } = params;
    const { studentId, answers, timeUsed, tabSwitchCount } = await request.json();

    // 获取试卷和题目信息
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

    // 计算分数（只计算选择题和判断题，每题2分）
    let score = 0;
    let maxScore = 0;
    const questionResults = [];

    exam.questions.forEach(question => {
      const studentAnswer = answers[question.id];
      let isCorrect = false;
      let earnedScore = 0;

      if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
        maxScore += 2; // 每题2分
        
        if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== '') {
          if (question.type === 'SINGLE_CHOICE') {
            isCorrect = studentAnswer === question.answer;
          } else if (question.type === 'TRUE_FALSE') {
            const correctAnswer = question.answer === '正确' || question.answer === 'true' || question.answer === true;
            isCorrect = studentAnswer === correctAnswer;
          }
          
          if (isCorrect) {
            earnedScore = 2;
            score += 2;
          }
        }
      }

      questionResults.push({
        questionId: question.id,
        type: question.type,
        studentAnswer,
        correctAnswer: question.answer,
        isCorrect,
        earnedScore
      });
    });

    // 保存或更新答题记录
    const submission = await prisma.examSubmission.upsert({
      where: {
        examId_studentId: {
          examId,
          studentId
        }
      },
      update: {
        answers,
        score,
        maxScore,
        timeUsed,
        tabSwitchCount,
        submittedAt: new Date()
      },
      create: {
        examId,
        studentId,
        answers,
        score,
        maxScore,
        timeUsed,
        tabSwitchCount
      }
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score,
        maxScore,
        timeUsed,
        submittedAt: submission.submittedAt
      },
      questionResults
    });
  } catch (error) {
    console.error('提交答题记录错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少学生ID' 
      }, { status: 400 });
    }

    // 获取答题记录
    const submission = await prisma.examSubmission.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('获取答题记录错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少学生ID' 
      }, { status: 400 });
    }

    // 删除答题记录
    await prisma.examSubmission.delete({
      where: {
        examId_studentId: {
          examId,
          studentId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: '答题记录已删除'
    });
  } catch (error) {
    console.error('删除答题记录错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}