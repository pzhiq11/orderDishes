# 配置 Prisma Postgres 数据库 - 本地和生产共用

## 🎯 关于 Prisma Postgres

您使用的是 **Prisma Postgres**（带 Accelerate），这是 Prisma 提供的增强型数据库服务，包含：
- ✅ PostgreSQL 数据库
- ✅ Prisma Accelerate（连接池 + 全局缓存）
- ✅ 更好的性能和可扩展性

---

## 📋 您获得的环境变量

从 Vercel Dashboard 您会看到三个变量：

```bash
# 直接数据库连接（用于本地开发和迁移）
POSTGRES_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"

# Prisma Accelerate 连接（用于生产环境，带缓存和连接池）
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# 别名，与 POSTGRES_URL 相同
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
```

---

## 🚀 快速配置步骤

### 1️⃣ 修改 Prisma Schema（已完成）

`prisma/schema.prisma` 已经配置好：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 2️⃣ 创建本地环境变量文件

创建 `.env` 文件：

```bash
# .env.local

# 本地开发使用直接连接
DATABASE_URL="postgres://396647646f7e1741bd30a1ebb3f98663c22512018a01a9a6a2177cba89e6021a:sk_bWjx9VZimcX2beY_8cFvD@db.prisma.io:5432/postgres?sslmode=require"

# 用于数据库迁移的直接连接（与上面相同）
DIRECT_URL="postgres://396647646f7e1741bd30a1ebb3f98663c22512018a01a9a6a2177cba89e6021a:sk_bWjx9VZimcX2beY_8cFvD@db.prisma.io:5432/postgres?sslmode=require"
```

⚠️ **重要**：
- `DATABASE_URL` 使用 `POSTGRES_URL` 的值（直接连接）
- `DIRECT_URL` 也使用相同的值
- **不要**在本地使用 `PRISMA_DATABASE_URL`（那是给生产环境用的）

### 3️⃣ 配置 Vercel 环境变量

在 Vercel 项目设置中配置生产环境变量：

```bash
# 方式1：让 Vercel 自动注入（推荐）
# Vercel 会自动将 Storage 中的环境变量注入到项目

# 方式2：手动配置
# Settings → Environment Variables
DATABASE_URL = [PRISMA_DATABASE_URL 的值]  # 使用 Accelerate
DIRECT_URL = [POSTGRES_URL 的值]           # 直接连接
```

**推荐配置**：
- 生产环境使用 `PRISMA_DATABASE_URL`（享受 Accelerate 的性能优势）
- 迁移和管理使用 `POSTGRES_URL`（直接连接）

### 4️⃣ 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库表结构
npx prisma migrate dev --name init_postgres

# 如果提示，输入 yes
```

### 5️⃣ 导入种子数据

```bash
npm run db:seed
```

### 6️⃣ 测试本地开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 检查是否能看到菜品数据
```

### 7️⃣ 部署到 Vercel

```bash
git add .
git commit -m "配置 Prisma Postgres"
git push

# Vercel 自动部署
```

---

## 🔧 配置详解

### 本地开发环境

`.env`：
```bash
# 使用直接连接（POSTGRES_URL）
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
DIRECT_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
```

**为什么本地用直接连接？**
- ✅ 本地开发不需要连接池
- ✅ 直接连接更简单
- ✅ 避免 Accelerate API 额度消耗

### Vercel 生产环境

推荐配置：
```bash
# 使用 Accelerate 连接（PRISMA_DATABASE_URL）
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
DIRECT_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
```

**为什么生产用 Accelerate？**
- ✅ 全局连接池（提高并发性能）
- ✅ 查询缓存（减少数据库负载）
- ✅ 更快的响应时间
- ✅ 自动扩展

---

## 📊 配置对比表

| 环境 | DATABASE_URL | DIRECT_URL | 用途 |
|------|--------------|------------|------|
| 本地开发 | POSTGRES_URL | POSTGRES_URL | 开发调试 |
| 生产环境 | PRISMA_DATABASE_URL | POSTGRES_URL | 用户访问 |
| 数据库迁移 | - | POSTGRES_URL | 创建表结构 |

---

## ✅ 验证配置

### 测试 1：查看数据库

```bash
# 打开 Prisma Studio
npx prisma studio

# 应该能看到：
# - Category 表
# - Dish 表  
# - Order 表
# - OrderItem 表
```

### 测试 2：本地运行

```bash
npm run dev

# 访问 http://localhost:3000/admin/dishes
# 应该能看到 60 道菜品
```

### 测试 3：创建订单

```
1. 创建新订单
2. 添加几道菜
3. 检查是否保存成功
```

### 测试 4：数据同步

```
1. 本地创建一个订单
2. 在 Prisma Studio 中查看
3. 应该能看到新订单
```

---

## 🎯 Prisma Accelerate 优势

### 连接池
```
传统方式：每个请求 → 新的数据库连接
Accelerate：请求 → 连接池 → 复用连接
结果：更快，更稳定
```

### 查询缓存
```
第一次查询：数据库 → Accelerate → 客户端
第二次查询：Accelerate 缓存 → 客户端（超快！）
```

### 全球分布
```
Accelerate 在全球有节点
自动选择最近的节点
降低延迟
```

---

## 🔧 常用命令

```bash
# 查看数据库
npx prisma studio

# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name migration_name

# 应用迁移（生产）
npx prisma migrate deploy

# 导入种子数据
npm run db:seed

# 查看数据库结构
npx prisma db pull
```

---

## 📝 完整的 .env.local 示例

```bash
# .env.local
# Prisma Postgres 配置

# 主连接（本地开发用直接连接）
DATABASE_URL="postgres://396647646f7e1741bd30a1ebb3f98663c22512018a01a9a6a2177cba89e6021a:sk_bWjx9VZimcX2beY_8cFvD@db.prisma.io:5432/postgres?sslmode=require"

# 直接连接（用于迁移）
DIRECT_URL="postgres://396647646f7e1741bd30a1ebb3f98663c22512018a01a9a6a2177cba89e6021a:sk_bWjx9VZimcX2beY_8cFvD@db.prisma.io:5432/postgres?sslmode=require"
```

---

## 🌐 Vercel 环境变量配置

### 方式1：自动注入（推荐）

如果你的 Vercel 项目已连接 Storage：
1. Vercel 会自动注入所有环境变量
2. 无需手动配置
3. 包括 `DATABASE_URL`、`POSTGRES_URL` 等

### 方式2：手动配置

如果需要手动配置（或想使用不同的配置）：

```bash
# Settings → Environment Variables → Add

# 添加以下变量（生产环境）
DATABASE_URL = prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

DIRECT_URL = postgres://396647646f7e1741bd30a1ebb3f98663c22512018a01a9a6a2177cba89e6021a:sk_bWjx9VZimcX2beY_8cFvD@db.prisma.io:5432/postgres?sslmode=require
```

---

## ⚠️ 重要注意事项

### 1. 安全性
- ✅ `.env.local` 已在 `.gitignore` 中
- ❌ 不要提交数据库凭据到 Git
- ❌ 不要在公开场合分享 API key

### 2. 本地不要用 Accelerate
```bash
# ❌ 错误（本地不要用这个）
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# ✅ 正确（本地用直接连接）
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
```

**原因**：
- 本地开发不需要连接池
- 避免消耗 Accelerate API 配额
- 直接连接更适合开发调试

### 3. 数据同步
- ✅ 本地和生产使用同一个数据库
- ⚠️ 本地修改会影响生产
- 💡 测试数据记得及时清理

---

## 🐛 故障排除

### 问题1：连接超时

```bash
Error: P1001: Can't reach database server
```

**解决方案**：
1. 检查网络连接
2. 确认 `.env.local` 文件存在
3. 重启开发服务器

### 问题2：API Key 错误

```bash
Error: Invalid API key
```

**解决方案**：
1. 确认使用的是 `POSTGRES_URL`（不是 `PRISMA_DATABASE_URL`）
2. 检查连接字符串是否完整
3. 重新从 Vercel 复制连接字符串

### 问题3：迁移失败

```bash
Error: Migration failed
```

**解决方案**：
```bash
# 删除 migrations 文件夹
rm -rf prisma/migrations

# 重新创建迁移
npx prisma migrate dev --name init

# 导入种子数据
npm run db:seed
```

### 问题4：看不到数据

```bash
# 检查当前连接的数据库
npx prisma studio

# 重新导入种子数据
npm run db:seed

# 检查环境变量
cat .env.local
```

---

## 💰 Prisma Postgres 免费额度

### 免费计划包含
- ✅ 10 GB 数据传输/月
- ✅ 100,000 次 Accelerate 请求/月
- ✅ 适合开发和小型应用

### 升级选项
- 如果超出额度，可以升级到付费计划
- 访问 Prisma Dashboard 查看使用情况

---

## 📚 相关资源

- [Prisma Postgres 文档](https://www.prisma.io/docs/prisma-postgres)
- [Prisma Accelerate 文档](https://www.prisma.io/docs/accelerate)
- [Vercel Storage 文档](https://vercel.com/docs/storage)

---

## ✅ 配置完成检查清单

- [ ] `.env.local` 文件已创建
- [ ] `DATABASE_URL` 使用 `POSTGRES_URL` 的值
- [ ] `DIRECT_URL` 使用 `POSTGRES_URL` 的值
- [ ] 运行 `npx prisma migrate dev` 成功
- [ ] 运行 `npm run db:seed` 成功
- [ ] 本地 `npm run dev` 正常运行
- [ ] 能看到 60 道菜品
- [ ] 能创建订单
- [ ] Vercel 部署成功
- [ ] 生产环境正常访问

---

## 🎉 配置完成！

现在您的系统已经连接到 Prisma Postgres 数据库，享受：
- ✅ 高性能 PostgreSQL
- ✅ Accelerate 连接池和缓存
- ✅ 本地和生产数据同步
- ✅ 全球分布式访问

**开始使用吧！** 🚀

