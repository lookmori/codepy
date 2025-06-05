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

export async function GET(request, { params }) {
  const userId = params.userId;

  const user = getUserFromRequest(request);
  // Only allow ADMIN or TEACHER to view user details in this context
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return NextResponse.json({ error: '未授权或权限不足' }, { status: 401 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Select specific fields to return
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: targetUser });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ message: 'Failed to fetch user details', error: error.message }, { status: 500 });
  }
} 