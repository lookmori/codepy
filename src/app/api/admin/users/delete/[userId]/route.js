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

// TODO: Implement authentication and authorization checks
// Only allow ADMIN or authorized TEACHER to delete users

export async function DELETE(request, { params }) {
  const userId = params.userId;

  const user = getUserFromRequest(request);
  // 只有管理员可以删除用户
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: '未授权或权限不足' }, { status: 401 });
  }

  try {
    // Start a database transaction to ensure atomicity
    await prisma.$transaction(async (prisma) => {
      // 1. Delete related comments
      await prisma.comment.deleteMany({
        where: { userId: userId },
      });

      // 2. Delete related student exercise statuses
      await prisma.studentExerciseStatus.deleteMany({
        where: { user_id: userId },
      });

      // 3. Delete the user
      await prisma.user.delete({
        where: { id: userId },
      });
    });

    // If transaction is successful
    return NextResponse.json({ message: 'User and related data deleted successfully' }, { status: 200 });

  } catch (error) {
    // If any operation in the transaction fails, it will be rolled back
    console.error('Error deleting user:', error);
    // Check if the error is due to the user not being found
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
} 