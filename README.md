# ChineseMaster — Chinese Virtual Goods Storefront

A Next.js storefront for selling Chinese learning materials (courses, templates, ebooks) to international students. Integrated with Supabase for auth/database and Creem for payments.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Auth & DB | Supabase (PostgreSQL) |
| Payments | Creem |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Deployment | Vercel |
| DNS | Cloudflare |

## Getting Started

### 1. Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | Supabase Dashboard → Settings → API |
| `CREEM_API_KEY` | Creem API key | Creem Dashboard → Settings → API Keys |
| `CREEM_WEBHOOK_SECRET` | Webhook signing secret | Creem Dashboard → Webhooks |
| `CREEM_BASE_URL` | Creem API base URL | `https://api.creem.io` (default) |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL | Your Vercel URL in production |

### 2. Database Setup

Run the migrations in Supabase SQL Editor:

```bash
# In Supabase Dashboard → SQL Editor:
# 1. Run supabase/migrations/001_initial_schema.sql
# 2. Run supabase/migrations/002_seed_products.sql
```

This creates:
- `profiles` table (synced with Supabase Auth)
- `products` table (your courses)
- `orders` table (purchase records)
- `download_access` table (granted after payment)
- Helper functions: `has_purchased()`, `get_user_purchases()`

### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth routes (login, signup)
│   ├── api/
│   │   ├── checkout/    # Create Creem checkout session
│   │   ├── creem/       # Webhook & success handlers
│   │   └── signout/     # Sign out endpoint
│   ├── products/        # Product catalog & detail pages
│   │   └── [slug]/      # Dynamic product + download routes
│   ├── dashboard/       # User dashboard (purchases, downloads)
│   ├── layout.tsx       # Root layout with navbar/footer/toaster
│   ├── page.tsx         # Landing page
│   ├── sitemap.ts       # Auto-generated sitemap
│   └── robots.ts        # SEO robots.txt
├── components/
│   ├── navbar.tsx       # Navigation bar
│   ├── footer.tsx       # Site footer
│   ├── purchase-button.tsx  # Checkout CTA
│   └── ui/              # shadcn/ui components
└── lib/
    ├── supabase/        # Supabase client (server/client/middleware)
    ├── creem.ts         # Creem API (checkout + webhook)
    └── actions/         # Server actions (signout)
```

## Key Flows

### Purchase Flow
1. User browses `/products` → clicks a course → views `/products/[slug]`
2. Clicks "Purchase" → hits `/api/checkout` → creates order + Creem session
3. Redirected to Creem checkout page
4. After payment → Creem sends webhook → order marked "paid" → download_access granted
5. User visits `/products/[slug]/download` to access materials

### Webhook Handling
- Webhook signature verified with HMAC-SHA256 before processing
- `payment.succeeded` → marks order paid, grants download access
- `payment.failed` → marks order failed

## Deployment to Vercel

1. Push to git repo
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

## Security Notes

- All Supabase tables have Row Level Security (RLS) enabled
- Service role key must never be exposed to the browser
- Webhook signature verification prevents fake payment confirmations
- Checkout API requires authenticated user
- `timingSafeCompare` used for webhook signature verification
