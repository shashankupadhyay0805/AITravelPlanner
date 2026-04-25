# Trao — AI Travel Planner

Production-grade multi-user AI travel itinerary + budget planner.

## Apps

- `apps/web`: Next.js (App Router) + Tailwind
- `apps/api`: Node.js + Express + MongoDB (Mongoose)

## Quick start

1. Install dependencies (from repo root):

```bash
npm install
```

2. Create env files:

- `apps/api/.env` (see `apps/api/.env.example`)
- `apps/web/.env.local` (see `apps/web/.env.example`)

3. Run dev:

```bash
npm run dev
```

## Architecture

- Backend follows a modular MVC/service layering with centralized error handling and Zod validation.
- Frontend uses server-first Next.js pages, with client components for forms/data fetching (React Query).
- AI service produces strict JSON via schema-constrained prompting and robust parsing.

