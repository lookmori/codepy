# Python 编程学习平台

这是一个使用 Next.js (App Router) 和 Prisma ORM 构建的 Python 编程学习平台。平台旨在为用户提供一个在线学习和练习 Python 编程的环境，并支持用户管理、角色权限控制、在线评测和评论交流等功能。

## 主要功能

-   **用户认证与授权**: 支持用户注册、登录，并基于 JWT 实现会话管理。通过中间件实现基于角色的访问控制（学生、教师、管理员）。
-   **人员管理**: 管理员和教师可以访问人员管理页面，查看和管理学生列表。管理员还可以管理教师列表，并添加新的学生和教师。
-   **在线编程练习**: 用户可以浏览练习题列表，选择题目进行在线编程练习。代码编辑器基于 Monaco Editor 实现。
-   **题目评测**: 集成 Coze 工作流进行代码评测，根据评测结果更新学生的答题状态。
-   **评论区**: 每道题目下方设有评论区，用户可以发表评论并回复其他用户的评论，支持 Markdown 语法。
-   **数据库 Seed**: 提供种子脚本，用于在初始化或部署时自动创建管理员用户。

## 技术栈

-   **框架**: Next.js (App Router)
-   **数据库**: PostgreSQL (通过 Prisma ORM)
-   **ORM**: Prisma
-   **样式**: Tailwind CSS, Tailwind Typography
-   **用户认证**: JWT (JSON Web Tokens), `jsonwebtoken`, `crypto` (用于密码哈希)
-   **HTTP 客户端**: Fetch API (通过自定义 `fetchWithThrow` 封装)
-   **代码编辑器**: Monaco Editor (@monaco-editor/react)
-   **Markdown 渲染**: React Markdown (`react-markdown`, `remark-gfm`)
-   **图标**: React Icons (`react-icons`)
-   **其他**: `uuid`, `classnames`, `date-fns`, `chart.js` (项目中也包含了图表相关依赖), `@neondatabase/serverless` (可能用于无服务器环境的数据库连接)

## 环境要求

-   Node.js (推荐 LTS 版本)
-   npm, yarn, pnpm 或 bun (任选其一)
-   PostgreSQL 数据库实例 (例如使用 Neon)

## 项目设置

请按照以下步骤在本地设置和运行项目：

1.  **克隆仓库**

    ```bash
    git clone <仓库地址>
    cd codepy
    ```

    (请将 `<仓库地址>` 替换为您的实际仓库地址)

2.  **安装依赖**

    ```bash
    npm install
    # 或者 yarn install
    # 或者 pnpm install
    # 或者 bun install
    ```

3.  **配置环境变量**

    复制 `.env.example` 文件并重命名为 `.env`，然后根据您的实际环境配置其中的变量。请特别注意以下必需的变量：

    -   `DATABASE_URL`: 您的 PostgreSQL 数据库连接字符串。格式通常为 `postgresql://user:password@host:port/database?schema=public`。
    -   `JWT_SECRET`: 用于签名和验证用户认证 JWT 的密钥。请使用一个强随机字符串。
    -   `ADMIN_EMAIL`: 用于种子数据创建管理员用户的邮箱。
    -   `ADMIN_PASSWORD_RAW`: 用于种子数据创建管理员用户的明文密码（**注意：将明文密码直接存储在环境变量中存在安全风险，特别是在生产环境。更安全的方式是使用 `ADMIN_HASHED_PASSWORD` 并存储预先生成的哈希值，请参考 `prisma/seed.js` 中的注释了解替代方案。**）
    -   `ADMIN_NAME` (可选): 管理员用户的姓名，如果未设置，种子脚本将默认为 '管理员'。
    -   `COZE_CLIENT_ID_JWT`, `COZE_PRIVATE_KEY_JWT`, `COZE_PUBLIC_KEY_ID_JWT`, `COZE_WORKFLOW_ID_JWT`, `COZE_API_BASE_JWT`: Coze API 相关的 JWT 认证和工作流 ID 配置。`COZE_PRIVATE_KEY_JWT` 应包含您的 Coze 应用私钥内容（包括 BEGIN/END 标记和换行符）。

4.  **设置 Prisma 数据库**

    运行 Prisma 迁移以在数据库中创建所需的表结构：

    ```bash
    npx prisma migrate dev --name init
    ```

    (如果这是首次运行或您修改了 `prisma/schema.prisma`，请根据提示操作)

5.  **运行数据库 Seed (种子数据)**

    运行 Seed 脚本来插入初始数据，例如创建管理员用户。请确保您已经在 `.env` 文件中配置了 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD_RAW` (或 `ADMIN_HASHED_PASSWORD`)。

    ```bash
    npx prisma db seed
    ```

    运行此命令后，如果不存在同名邮箱的管理员用户，Seed 脚本将创建一个管理员用户。您可以登录该邮箱和密码（如果您使用了 `ADMIN_PASSWORD_RAW`）或相应哈希后的密码来访问管理员功能。

6.  **生成 Prisma 客户端**

    虽然通常 `postinstall` 和 `migrate dev` 命令会自动生成，但可以手动运行一次确保客户端已生成：

    ```bash
    npx prisma generate
    ```

7.  **运行开发服务器**

    ```bash
    npm run dev
    # 或者 yarn dev
    # 或者 pnpm dev
    # 或者 bun dev
    ```

    项目将在 `http://localhost:3000` 启动。

8.  **使用 Prisma Studio 查看数据**

    如果您想查看和管理本地数据库中的数据，可以运行 Prisma Studio：

    ```bash
    npx prisma studio
    ```

## 项目结构概述

-   `app/`: Next.js App Router 的根目录。
    -   `api/`: API 路由。
        -   `login/`: 登录接口。
        -   `register/`: 注册接口。
        -   `exercises/`: 练习题相关的接口（获取列表、详情、提交、评论等）。
        -   `admin/`: 管理员相关接口（如用户管理）。
    -   `[...]/page.js` / `[...]/layout.js`: 页面组件及其布局。
-   `components/`: 可重用的 React 组件。
-   `lib/`: 存放一些公共库和工具函数（如 `prisma.js`, `fetchWithThrow.js`）。
-   `prisma/`: Prisma ORM 的配置和 schema 文件。
    -   `schema.prisma`: 数据库模型定义。
    -   `seed.js`: 种子数据脚本。
-   `public/`: 静态资源目录（如 `monaco/` 编辑器文件）。
-   `scripts/`: 一些辅助脚本（如 `copy-monaco.js`）。
-   `middleware.js`: Next.js 中间件，用于处理路由和权限。

## 部署到 Vercel

将项目部署到 Vercel 的最简单方式是使用 Vercel Platform。请确保在 Vercel 项目设置中完成以下配置：

1.  **关联 Git 仓库**：将您的项目与 Vercel 关联。
2.  **配置环境变量**：在 Vercel 控制台中设置 `.env` 文件中定义的所有必需环境变量 (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_RAW` 或 `ADMIN_HASHED_PASSWORD`, `COZE_*` 等)。
3.  **配置 Build Command**：为了在部署时自动运行数据库迁移和种子脚本，将 Build Command 设置为：

    ```bash
    npx prisma migrate deploy && npx prisma db seed
    ```
    (确保您的 `package.json` 中有 `prisma:migrate` 和 `db:seed` 脚本)

4.  **配置 Root Directory** (如果项目不在仓库根目录)。

完成配置后，Vercel 将在每次 Push 到关联分支时自动构建和部署您的项目，并在部署过程中执行数据库迁移和种子脚本。

## 数据库 Seed 详解

`prisma/seed.js` 脚本设计用于在数据库初始化或部署时自动创建管理员用户。脚本会检查是否已存在具有指定 `ADMIN_EMAIL` 的用户。如果不存在，则会使用 `ADMIN_EMAIL`、`ADMIN_NAME` 和通过 `ADMIN_PASSWORD_RAW` (或 `ADMIN_HASHED_PASSWORD`) 生成的哈希密码创建一个角色为 'ADMIN' 的新用户。这样可以确保在新的部署或数据库初始化后，总有一个管理员用户可用。

如果您更改了 Seed 脚本的逻辑或希望手动重新运行 Seed，可以使用命令 `npx prisma db seed`。

## 贡献

(如果您希望接受贡献，可以在此添加贡献指南，例如如何提交 Issue 或 Pull Request)

## License

(在此添加您的项目 License 信息)
