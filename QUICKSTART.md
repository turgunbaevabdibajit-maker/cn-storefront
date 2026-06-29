# CN Storefront — 快速上手指南

## 第一步：复制环境变量文件

在项目根目录 `cn-storefront/` 下，把 `.env.example` 复制一份命名为 `.env.local`：

```bash
cp .env.example .env.local
```

然后用记事本打开 `.env.local`，填入以下内容：

### Supabase 配置（必填）
1. 打开 https://app.supabase.com
2. 点击你的项目
3. 左侧菜单 → Settings → API
4. 复制 **Project URL** 填入 `NEXT_PUBLIC_SUPABASE_URL`
5. 复制 **anon public** key 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. 复制 **service_role secret** 填入 `SUPABASE_SERVICE_ROLE_KEY`

### Creem 配置（支付时需要）
1. 登录你的 Creem 账号
2. 找到 API Keys 设置页
3. 复制 API Key 填入 `CREEM_API_KEY`
4. 复制 Webhook Secret 填入 `CREEM_WEBHOOK_SECRET`

## 第二步：在 Supabase 创建数据库表

1. 打开 https://app.supabase.com，进入你的项目
2. 左侧菜单 → SQL Editor
3. 点击 "New Query"
4. 复制下面"数据库初始化 SQL"部分的代码粘贴进去
5. 点击 "Run" 按钮

## 第三步：插入示例课程数据

1. 还是在 Supabase → SQL Editor
2. 新建一个查询
3. 复制下面"种子数据 SQL"部分的代码粘贴进去
4. 点击 "Run"

## 第四步：运行项目

```bash
npm run dev
```

然后在浏览器打开 http://localhost:3000
