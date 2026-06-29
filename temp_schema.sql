-- ============================================================
-- CN Storefront - Database Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products
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

alter table public.products enable row level security;

create policy if not exists "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy if not exists "Admin can manage products"
  on public.products for all
  using (auth.role() = 'service_role');

-- Orders
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

alter table public.orders enable row level security;

create policy if not exists "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy if not exists "Admin can manage orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- Download Access
create table if not exists public.download_access (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.download_access enable row level security;

create policy if not exists "Users can view own access"
  on public.download_access for select
  using (auth.uid() = user_id);

create policy if not exists "Admin can manage access"
  on public.download_access for all
  using (auth.role() = 'service_role');
