import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 密码哈希函数
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// 验证函数
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // 简化密码规则，只检查长度
  return password.length >= 6;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    // 验证数据
    const validationErrors = {};
    
    if (!email || !email.trim()) {
      validationErrors.email = '请提供邮箱地址';
    } else if (!validateEmail(email)) {
      validationErrors.email = '请提供有效的邮箱地址';
    }
    
    if (!newPassword) {
      validationErrors.newPassword = '请提供新密码';
    } else if (!validatePassword(newPassword)) {
      validationErrors.newPassword = '密码长度至少为6个字符';
    }
    
    // 如果有验证错误，返回错误信息
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { 
          error: '表单验证失败', 
          validationErrors 
        },
        { status: 400 }
      );
    }

    // 连接数据库
    const sql = neon(process.env.DATABASE_URL);
    
    // 检查邮箱是否存在
    const existingUser = await sql`SELECT * FROM "User" WHERE email = ${email}`;
    
    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 404 }
      );
    }
    
    // 哈希新密码
    const hashedPassword = hashPassword(newPassword);
    
    // 更新密码
    await sql`UPDATE "User" SET password = ${hashedPassword} WHERE email = ${email}`;
    
    // 成功响应
    return NextResponse.json(
      { success: true, message: '密码重置成功' }
    );
  } catch (error) {
    console.error('密码重置错误:', error);
    return NextResponse.json(
      { error: '密码重置过程中发生错误', details: error.message },
      { status: 500 }
    );
  }
} 