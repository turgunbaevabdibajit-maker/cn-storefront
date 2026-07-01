# Deployment Guide - ChineseMaster Storefront

## Prerequisites

1. A **Supabase** project (free tier is fine)
2. A **Creem.io** account for payments
3. A hosting platform (Vercel recommended, but Docker/Node works too)

---

## Step 1: Set Up Supabase Database

Connect to your Supabase project and run the SQL in `setup-supabase.sql`.

---

## Step 2: Set Up Creem Payments

1. Sign up at https://creem.io
2. Get your API Key (from dashboard/settings)
3. Get your Webhook Secret (from webhooks settings)
4. After deploying, configure your Creem webhook URL to:
   ```
   https://yourdomain.com/api/creem/webhook
   ```

---

## Step 3: Environment Variables

Copy `.env.example` to `.env.local` (development) or set these on your hosting platform.

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CREEM_API_KEY=
CREEM_WEBHOOK_SECRET=
CREEM_BASE_URL=https://api.creem.io
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Step 4: Deploy

### Option A: Vercel (Recommended)

```bash
npm i -g vercel
cd cn-storefront
vercel
vercel --prod
```

Add all environment variables in Vercel dashboard → Settings → Environment Variables, then redeploy.

### Option B: Docker

Build and run with Docker (see `Dockerfile`).

Note: Add `"output": "standalone"` to `next.config.ts` for Docker.

### Option C: Railway / Render / Fly.io

All support Next.js. Set the same environment variables.
Build command: `npm run build`
Start command: `npm start`

---

## Step 5: Post-Deploy Checklist

- [ ] Supabase tables created with RLS policies
- [ ] Products seeded (or add via Supabase dashboard)
- [ ] Creem webhook URL configured to point to production
- [ ] All environment variables set on hosting platform
- [ ] Test signup flow end-to-end
- [ ] Test checkout -> payment -> webhook -> download flow
- [ ] Test download page access control
- [ ] Verify sitemap.xml and robots.txt are accessible
