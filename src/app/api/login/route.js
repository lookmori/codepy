import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

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
        // 从环境变量获取管理员账号信息
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    
        // 检查是否是管理员登录
        if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          console.log('检测到管理员登录，跳过数据库验证');
          const adminUser = {
            id: 'admin-id', // 可以使用一个固定的ID或者生成一个
            email: ADMIN_EMAIL,
            name: process.env.ADMIN_NAME || '管理员',
            role: 'ADMIN',
            // 其他管理员可能需要的字段...
          };
    
          // 生成 JWT token
          const token = jwt.sign(
            {
              id: adminUser.id,
              email: adminUser.email,
              role: adminUser.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
    
          // 设置 Set-Cookie
          const response = NextResponse.json({
            user: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
              isAdmin: true,
              isTeacher: false
            },
            token
          });
          response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);
          return response;
        }
    
        // 如果不是管理员，继续正常的数据库查询和密码验证

    try {
      console.log('开始查询用户:', email);
      
      // 使用Prisma查找用户
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      console.log('查询结果:', user ? '找到用户' : '没有结果');
      
      if (!user) {
        console.log('未找到用户');
        return NextResponse.json(
          { error: '邮箱或密码不正确' },
          { status: 401 }
        );
      }
      
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
        isAdmin: user.role === 'ADMIN', // 更新为新的枚举值
        isTeacher: user.role === 'TEACHER' // 添加教师角色判断
      };
      
      console.log('用户数据处理完成:', userData);
      
      // 生成 JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // 设置 Set-Cookie
      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.role === 'ADMIN',
          isTeacher: user.role === 'TEACHER'
        },
        token
      });
      response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);
      return response;
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