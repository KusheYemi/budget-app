# Budget App

A modern, responsive monthly budgeting web app built with Next.js, Supabase, and Prisma.

## Features

- **Monthly Budget Management**: Set your income and allocate funds to categories
- **Smart Savings Logic**: Default 20% savings rate with required reason when saving less
- **User-Defined Categories**: Create custom budget categories with colors
- **Real-Time Calculations**: See remaining budget update instantly as you allocate
- **Historical Tracking**: View past months (read-only) and track trends over time
- **Insights & Statistics**: Visualize spending patterns with charts and aggregated data
- **Multi-Currency Support**: SLE (default), USD, GBP, EUR, NGN
- **Account Settings**: Change preferred currency and reset password
- **Dark/Light Mode**: Toggle between themes

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth (email/password)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **State**: Zustand
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a `.env` file for Prisma:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: seed a demo user (requires SEED_USER_ID + SEED_EMAIL)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── budget/[year]/[month]/  # Historical month view
│   ├── insights/         # Statistics page
│   ├── actions/          # Server actions
│   └── page.tsx          # Dashboard (current month)
├── components/
│   ├── auth/             # Auth forms
│   ├── budget/           # Budget UI components
│   ├── charts/           # Recharts components
│   ├── layout/           # Header, navigation
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── supabase/         # Supabase clients
│   ├── utils.ts          # Utility functions
│   └── validators.ts     # Zod schemas
└── stores/
    └── budget-store.ts   # Zustand store
```

## Key Features Explained

### Savings Rate Logic

The app enforces a default 20% savings rate. If a user wants to save less than 20%, they must provide a reason (minimum 10 characters). This encourages mindful financial decisions.

### Default Categories

New users get these categories automatically:
- Savings (system category, cannot be deleted)
- Transport & Food
- Utilities
- Partner & Child Support
- Subscriptions
- Fun
- Remittance

### Read-Only Historical Months

Past months are automatically locked and displayed in read-only mode. Only the current month can be edited.

## Database Schema

- **User**: Email, currency preference
- **BudgetMonth**: Year, month, income, savings rate, adjustment reason
- **Category**: Name, color, sort order, isSavings flag
- **Allocation**: Links budget months to categories with amounts

## Deployment

The app can be deployed to Vercel:

```bash
npm run build
```

Make sure to:
1. Set environment variables in your hosting platform
2. Run Prisma migrations against your production database

## License

MIT
