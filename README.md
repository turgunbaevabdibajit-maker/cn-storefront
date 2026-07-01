# ChineseMaster — Learn Chinese Online

Chinese virtual goods storefront. Auto-sells Chinese learning materials to international students.

## Quick Start

```bash
cd cn-storefront
cp .env.example .env.local   # fill in your env vars
npm install
npm run dev
```

Open http://localhost:3000

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

## Tech Stack

- **Next.js 16** (App Router, Node.js server)
- **Tailwind CSS v4** + shadcn/ui
- **Supabase** (Auth + PostgreSQL)
- **Creem.io** (Payments)
