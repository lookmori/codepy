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

function validateName(name) {
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;
  return nameRegex.test(name);
}

function validatePassword(password) {
  // 简化密码规则，只检查长度
  return password.length >= 6;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'student' } = body;

    // 验证数据
    const validationErrors = {};
    
    if (!name || !name.trim()) {
      validationErrors.name = '请提供姓名';
    } else if (!validateName(name)) {
      validationErrors.name = '姓名只能包含中文、英文、数字和下划线，长度在2-20个字符之间';
    }
    
    if (!email || !email.trim()) {
      validationErrors.email = '请提供邮箱地址';
    } else if (!validateEmail(email)) {
      validationErrors.email = '请提供有效的邮箱地址';
    }
    
    if (!password) {
      validationErrors.password = '请提供密码';
    } else if (!validatePassword(password)) {
      validationErrors.password = '密码长度至少为6个字符';
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

    // 验证角色
    if (role !== 'student' && role !== 'admin') {
      return NextResponse.json(
        { error: '角色无效，必须是 student 或 admin' },
        { status: 400 }
      );
    }

    // 连接数据库
    const sql = neon(process.env.DATABASE_URL);
    
    // 检查邮箱是否已存在
    const existingUser = await sql`SELECT * FROM "User" WHERE email = ${email}`;
    
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 409 }
      );
    }
    
    // 哈希密码
    const hashedPassword = hashPassword(password);
    
    // 创建用户
    await sql`INSERT INTO "User" (username, email, password, role) VALUES (${name}, ${email}, ${hashedPassword}, ${role})`;
    
    // 成功响应
    return NextResponse.json(
      { success: true, message: '用户注册成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册过程中发生错误', details: error.message },
      { status: 500 }
    );
  }
} 