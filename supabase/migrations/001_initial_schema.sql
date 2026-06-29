-- ============================================================
-- CN Storefront - Database Schema
-- Run this in your Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------
-- 1. Profiles (extends Supabase auth.users)
-- -----------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.profiles enable row level security;

-- Drop existing policies if any to avoid conflicts
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow service role to manage profiles
drop policy if exists "Admin can manage profiles" on public.profiles;
create policy "Admin can manage profiles"
  on public.profiles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger (drop first to avoid duplicates)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------
-- 2. Products (Chinese learning materials)
-- -----------------------------------------------------------
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  price_cents integer not null,
  currency text default 'usd',
  cover_image_url text,
  thumbnail_url text,
  sample_url text,
  download_url text,
  category text,
  level text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
drop policy if exists "Admin can insert products" on public.products;
drop policy if exists "Admin can update products" on public.products;
drop policy if exists "Admin can delete products" on public.products;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Admin can manage products"
  on public.products for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -----------------------------------------------------------
-- 3. Orders
-- -----------------------------------------------------------
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  creem_payment_id text,
  creem_checkout_id text,
  amount_cents integer not null,
  currency text default 'usd',
  status text default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz default now(),
  paid_at timestamptz,
  updated_at timestamptz default now()
);

alter table if exists public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Admin can manage orders" on public.orders;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admin can manage orders"
  on public.orders for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -----------------------------------------------------------
-- 4. Download Access (unlocked after payment)
-- -----------------------------------------------------------
create table if not exists public.download_access (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table if exists public.download_access enable row level security;

drop policy if exists "Users can view own access" on public.download_access;
drop policy if exists "Admin can manage access" on public.download_access;

create policy "Users can view own access"
  on public.download_access for select
  using (auth.uid() = user_id);

create policy "Admin can manage access"
  on public.download_access for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- -----------------------------------------------------------
-- 5. Helper function: check if user has purchased a product
-- -----------------------------------------------------------
create or replace function public.has_purchased(
  p_user_id uuid,
  p_product_id uuid
) returns boolean as $$
begin
  return exists (
    select 1 from public.download_access da
    where da.user_id = p_user_id
      and da.product_id = p_product_id
  );
end;
$$ language plpgsql security definer;

-- -----------------------------------------------------------
-- 6. Helper function: get user's purchased products
-- -----------------------------------------------------------
create or replace function public.get_user_purchases(p_user_id uuid)
returns table (
  product_id uuid,
  title text,
  slug text,
  cover_image_url text,
  category text,
  level text,
  purchased_at timestamptz,
  download_url text
) as $$
begin
  return query
  select
    p.id,
    p.title,
    p.slug,
    p.cover_image_url,
    p.category,
    p.level,
    da.created_at,
    p.download_url
  from public.download_access da
  join public.products p on p.id = da.product_id
  where da.user_id = p_user_id
  order by da.created_at desc;
end;
$$ language plpgsql security definer;
