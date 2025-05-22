import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// 密码哈希函数 (与您的注册接口中一致)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'; // 从环境变量获取或使用默认值
  const adminPasswordRaw = process.env.ADMIN_PASSWORD_RAW; // 从环境变量获取明文密码 (不推荐)
  const adminName = process.env.ADMIN_NAME || '管理员'; // 从环境变量获取或使用默认值

  if (!adminEmail || !adminPasswordRaw) {
      console.error("错误: 请设置 ADMIN_EMAIL 和 ADMIN_PASSWORD_RAW 环境变量以运行种子脚本。");
      console.error("考虑使用更安全的 ADMIN_HASHED_PASSWORD 环境变量。详情请查看 seed.js 文件内的注释。");
      process.exit(1);
  }

  // 现场生成哈希密码 (不推荐在生产环境使用明文环境变量)
  const adminHashedPassword = hashPassword(adminPasswordRaw);

  // 检查管理员用户是否已存在
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log(`正在创建管理员用户: ${adminEmail}`);
    await prisma.user.create({
      data: {
        username: adminName,
        email: adminEmail,
        password: adminHashedPassword, // 使用哈希后的密码
        role: 'ADMIN',
      },
    });
    console.log('管理员用户创建成功');
  } else {
    console.log(`管理员用户已存在: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error('种子数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 