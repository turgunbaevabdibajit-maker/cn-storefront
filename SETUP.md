# 📋 数据库设置 — 3 分钟搞定

## 第 1 步：创建数据库表

1. 打开 **https://app.supabase.com**
2. 点击你的项目（`kqfseplmehltivuaiwxa`）
3. 左侧菜单点击 **SQL Editor**
4. 点击右上角 **New Query**
5. 复制下面的 **建表 SQL**，粘贴到编辑器里
6. 点击右上角 **Run** 按钮（绿色 ▶）
7. 看到 "Success. No rows returned" 就对了

### 建表 SQL（复制这段）：

```sql
create extension if not exists "uuid-ossp";

-- Profiles 表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 自动创建 profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products 表
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  price_cents integer not null,
  currency text default 'usd',
  cover_image_url text,
  category text,
  level text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

-- Orders 表
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  creem_payment_id text,
  amount_cents integer not null,
  currency text default 'usd',
  status text default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz default now(),
  paid_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Download Access 表
create table if not exists public.download_access (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.download_access enable row level security;

create policy "Users can view own access"
  on public.download_access for select
  using (auth.uid() = user_id);
```

---

## 第 2 步：插入示例课程

1. 还是在 SQL Editor 里
2. 点 **New Query**
3. 复制下面的 **种子数据 SQL**，粘贴进去
4. 点 **Run**

### 种子数据 SQL：

```sql
insert into public.products (title, slug, description, short_description, price_cents, category, level, sort_order) values
('HSK 1-5 Complete Coursebook', 'hsk-1-5-complete-coursebook', 'Comprehensive Chinese learning materials covering HSK levels 1-5. Grammar, vocabulary, exercises, audio.', 'Complete HSK 1-5 course with grammar, vocabulary, and exercises', 4999, 'Coursebook', 'Beginner - Intermediate', 1),
('Business Chinese Bundle', 'business-chinese-bundle', 'Master professional Chinese for business contexts. Email writing, meetings, negotiations.', 'Professional Chinese for business communication', 3999, 'Business', 'Intermediate - Advanced', 2),
('Chinese Calligraphy Starter Kit', 'chinese-calligraphy-starter-kit', 'Learn Chinese calligraphy with stroke-order guides, 500+ character practice sheets, and video tutorials.', 'Digital kit with stroke guides and video tutorials', 2999, 'Culture & Art', 'Beginner', 3),
('Mandarin Pronunciation Masterclass', 'mandarin-pronunciation-masterclass', 'Perfect your Mandarin pronunciation and tones. Audio drills and printable reference charts.', 'Audio-driven pronunciation course', 1999, 'Pronunciation', 'Beginner', 4),
('Chinese Idioms Encyclopedia', 'chinese-idioms-encyclopedia', '300 essential Chinese idioms with stories, audio, and English translations.', '300 idioms with stories and translations', 3499, 'Vocabulary', 'Intermediate - Advanced', 5),
('Daily Conversation Flashcards', 'daily-conversation-flashcards', '200 digital flashcards for everyday Chinese conversations organized by scenario.', '200 scenario-based flashcards with audio', 1499, 'Vocabulary', 'Beginner', 6);
```

---

## 第 3 步：验证

1. 在 SQL Editor 里新建查询，粘贴：
```sql
select count(*) from public.products;
```
2. 点 Run，应该返回 `6`

---

## 第 4 步：运行网站

回到电脑，在项目文件夹里运行：

```bash
cd cn-storefront
npm run dev
```

然后浏览器打开 **http://localhost:3000** 🎉
