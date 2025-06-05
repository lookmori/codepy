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
  const studentId = params.userId; // Assuming userId from params is the studentId

  const user = getUserFromRequest(request)  // Only allow ADMIN or the student themselves to view history
  // Or perhaps only ADMIN and TEACHER? Let's assume ADMIN and TEACHER for now based on personnel page access.
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return NextResponse.json({ error: '未授权或权限不足' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Fetch exercise records for the student with pagination
    const exerciseRecords = await prisma.studentExerciseStatus.findMany({
      where: { user_id: studentId },
      include: {
        exercise: { // Include related Exercise data to get the title
          select: { title: true },
        },
      },
      orderBy: { submit_time: 'desc' }, // Order by most recent submission
      skip: skip,
      take: limit,
    });

    // Get total count for pagination
    const totalRecords = await prisma.studentExerciseStatus.count({
      where: { user_id: studentId },
    });
    const totalPages = Math.ceil(totalRecords / limit);

    // Format the response to include exercise title directly
    const formattedRecords = exerciseRecords.map(record => ({
      ...record,
      exerciseTitle: record.exercise.title, // Add exercise title at the top level
      exercise: undefined, // Remove the nested exercise object
    }));

    return NextResponse.json({ exercises: formattedRecords, totalPages });

  } catch (error) {
    console.error('Error fetching student exercise history:', error);
    return NextResponse.json({ message: 'Failed to fetch exercise history', error: error.message }, { status: 500 });
  }
} 