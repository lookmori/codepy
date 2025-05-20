# Python 编程学习平台

这是一个使用 Next.js 和 Prisma ORM 构建的 Python 编程学习平台。

## 数据库设置

本项目使用 Prisma ORM 与 PostgreSQL 数据库进行交互。

### 设置步骤

1. 安装依赖：
   ```
   npm install
   ```

2. 生成 Prisma 客户端：
   ```
   npx prisma generate
   ```

3. 如果需要创建数据库表或应用模型更改，请运行：
   ```
   npx prisma migrate dev --name init
   ```

4. 如果您想要查看和管理数据库数据，可以使用 Prisma Studio：
   ```
   npx prisma studio
   ```

## 环境变量

确保创建一个 `.env` 文件，其中包含以下变量：

```
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
```

## API 说明

本项目的 API 使用 Prisma ORM 与数据库交互，主要 API 端点包括：

- `/api/register` - 用户注册
- `/api/login` - 用户登录
- `/api/reset-password` - 重置用户密码

## 启动开发服务器

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 构建与部署

```
npm run build
npm start
```
