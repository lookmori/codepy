import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 验证密码
function verifyPassword(storedPassword, suppliedPassword) {
  const [salt, storedHash] = storedPassword.split(':');
  const suppliedHash = crypto.pbkdf2Sync(suppliedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === suppliedHash;
}

export async function POST(request) {
  console.log('登录API路由开始处理请求');
  try {
    const body = await request.json();
    console.log('接收到登录请求数据:', { email: body.email, hasPassword: !!body.password });
    const { email, password } = body;

    // 验证数据
    if (!email || !password) {
      console.log('缺少邮箱或密码');
      return NextResponse.json(
        { error: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 连接数据库
    console.log('尝试连接数据库...');
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('缺少DATABASE_URL环境变量');
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }
    console.log('数据库URL格式检查:', DATABASE_URL.substring(0, 10) + '...');

    try {
      // 使用正确的查询方式 - 标签模板字符串
      const sql = neon(DATABASE_URL);
      console.log('数据库客户端已创建');
      
      // 查找用户 - 使用标签模板字符串语法
      console.log('开始查询用户:', email);
      const users = await sql`SELECT * FROM "User" WHERE email = ${email}`;
      
      console.log('查询结果:', users ? `找到${users.length}个用户` : '没有结果');
      
      if (!users || users.length === 0) {
        console.log('未找到用户');
        return NextResponse.json(
          { error: '邮箱或密码不正确' },
          { status: 401 }
        );
      }
      
      const user = users[0];
      console.log('找到用户:', user.username);
      
      // 验证密码
      console.log('开始验证密码');
      if (!verifyPassword(user.password, password)) {
        console.log('密码验证失败');
        return NextResponse.json(
          { error: '邮箱或密码不正确' },
          { status: 401 }
        );
      }
      
      console.log('密码验证成功');
      
      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      
      // 确保用户数据有name字段，如果没有则使用username
      const userData = {
        ...userWithoutPassword,
        name: userWithoutPassword.name || userWithoutPassword.username,
        isAdmin: user.role === 'admin' // 添加一个便于前端判断的字段
      };
      
      console.log('用户数据处理完成:', userData);
      
      // 成功响应
      const responseData = {
        success: true,
        message: '登录成功',
        user: userData
      };
      console.log('准备返回成功响应');
      
      return NextResponse.json(responseData);
    } catch (dbError) {
      console.error('数据库查询错误:', dbError);
      return NextResponse.json(
        { error: '数据库查询错误', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('登录API错误详情:', error);
    return NextResponse.json(
      { error: '登录过程中发生错误', details: error.message },
      { status: 500 }
    );
  }
} 