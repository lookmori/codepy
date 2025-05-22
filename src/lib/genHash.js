import crypto from 'crypto';
import readline from 'readline';

// 密码哈希函数 (与您的注册接口中一致)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('请输入您要生成哈希的密码: ', (password) => {
  if (!password) {
    console.error('密码不能为空！');
    rl.close();
    return;
  }

  const hashedPassword = hashPassword(password);
  console.log('\n请将以下哈希密码用于数据库插入或环境变量：');
  console.log(hashedPassword);

  rl.close();
});
