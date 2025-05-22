import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// 递归组装评论树
async function buildCommentTree(comments, allComments) {
  return Promise.all(
    comments.map(async (comment) => {
      const replies = allComments.filter(c => c.parentId === comment.id);
      return {
        ...comment,
        replies: await buildCommentTree(replies, allComments),
      };
    })
  );
}

export async function GET(req, context) {
  const { id: exerciseId } = await context.params;
  // 获取所有评论及用户
  const allComments = await prisma.comment.findMany({
    where: { exerciseId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true, role: true } } },
  });
  // 只取顶级评论
  const rootComments = allComments.filter(c => !c.parentId);
  const tree = await buildCommentTree(rootComments, allComments);
  return NextResponse.json({ comments: tree });
}

export async function POST(req, context) {
  const { id: exerciseId } = await context.params;
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const { content, replyTo } = await req.json();
  if (!content || !content.trim()) return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: user.id,
      exerciseId,
      parentId: replyTo || null,
    },
    include: { user: { select: { id: true, username: true, role: true } } },
  });
  return NextResponse.json({ comment });
} 