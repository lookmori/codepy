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

export async function DELETE(request, { params }) {
  try {
    // 管理员鉴权
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Forbidden: Only admin can delete exams' 
      }, { status: 403 });
    }

    const { examId } = params;

    // 检查试卷是否存在
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ 
        success: false, 
        error: '试卷不存在' 
      }, { status: 404 });
    }

    // 删除试卷（由于设置了 onDelete: Cascade，相关题目会自动删除）
    await prisma.exam.delete({
      where: { id: examId }
    });

    return NextResponse.json({
      success: true,
      message: `试卷 "${exam.name}" 及其 ${exam._count.questions} 道题目已成功删除`
    });
  } catch (error) {
    console.error('删除试卷错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}