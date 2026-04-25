# Trao — AI Travel Planner

Trao is a full-stack, multi-user travel planning app that generates AI-powered itineraries, budgets, and hotel suggestions.  
It combines trip management, weather-aware recommendations, holiday planning, and editable day-by-day travel plans in one workflow.

---

## 1) Project Overview

Trao solves a practical problem: planning trips usually requires switching between multiple tools (notes, maps, weather, budget sheets).  
This project provides a single app where users can:

- create and manage private trips,
- generate itineraries with AI,
- edit and regenerate specific days,
- view weather context and holiday calendars,
- open map links for hotels and activities.

---

## 2) Chosen Tech Stack (and Why)

### Frontend: `apps/frontend`
- **Next.js (App Router) + React + TypeScript**: fast routing, modern React patterns, and type safety.
- **Tailwind CSS**: rapid UI iteration and consistent styling.
- **TanStack Query**: reliable API state management (loading, error, cache invalidation).
- **Zustand + persist middleware**: lightweight auth/session state in browser storage.

### Backend: `apps/backend`
- **Node.js + Express + TypeScript**: straightforward API architecture and deployment.
- **MongoDB + Mongoose**: flexible document model for itinerary/budget/hotel payloads.
- **Zod**: strict runtime validation for request payloads.
- **JWT auth**: stateless authentication for API requests.

### External Services
- **Groq API**: AI itinerary generation.
- **Open-Meteo**: weather-aware planning context.
- **Nager + date-holidays fallback**: holiday calendar data.

---

## 3) Setup Instructions

### Local Setup

1. Install dependencies at repo root:

```bash
npm install
```

2. Create environment files:

- `apps/backend/.env` from `apps/backend/.env.example`
- `apps/frontend/.env.local` from `apps/frontend/.env.example`

3. Start both apps:

```bash
npm run dev
```

4. Default local URLs:
- Web: `http://localhost:3000`
- API: `http://localhost:8080`

### Deployed Setup

#### Backend on Render
- Service type: **Web Service**
- Build command:
```bash
npm install && npm run build -w @trao/backend
```
- Start command:
```bash
npm run start -w @trao/backend
```
- Required env vars:
  - `NODE_ENV`
  - `MONGODB_URI`
  - `JWT_ACCESS_SECRET`
  - `JWT_ACCESS_TTL`
  - `GROQ_API_KEY`
  - `GROQ_MODEL`
  - `CORS_ORIGIN` (supports comma-separated origins)

#### Frontend on Vercel
- Root directory: `apps/frontend`
- Build command: `next build`
- Output directory: default
- Install command (monorepo): `npm install --prefix=../..`
- Required env var:
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend>.onrender.com`

---

## 4) High-Level Architecture

Trao follows a client-server architecture with clear module boundaries.

- **Web app** (`apps/frontend`):
  - Pages and UI components.
  - Client-side data fetching with React Query.
  - Auth/session state via Zustand.

- **API app** (`apps/backend`):
  - `auth` module: register, login, profile.
  - `trips` module: CRUD, generate itinerary, regenerate day, save itinerary edits.
  - `ai` module: prompt construction, schema parsing, retry/repair flow.
  - `weather` module: geocode + forecast summary.
  - `holidays` module: provider + fallback handling.

---

## 5) Authentication and Authorization Approach

- User auth uses **email/password** with hashed passwords (`bcryptjs`).
- On successful login/register, API issues a **JWT access token**.
- Protected endpoints use `Authorization: Bearer <token>`.
- `requireAuth` middleware validates token and attaches `req.user`.
- Frontend stores session in Zustand; on `401`, it auto-logs out and redirects to login.

---

## 6) AI Agent Design and Purpose

The AI subsystem is designed for reliable structured generation (not free-form chat).

- Purpose:
  - produce itinerary days,
  - budget breakdown,
  - hotel suggestions in strict JSON shape.

- Design:
  - strict system instructions + explicit output shape contract,
  - JSON extraction and schema validation with Zod,
  - recovery retry when output is malformed or wrapped,
  - deterministic post-processing (budget total normalization).

This design reduces UI-breaking AI output and keeps generated data editable.

---

## 7) Creative / Custom Features

- **Weather-aware itinerary prompts**: forecast context influences indoor/outdoor suggestions.
- **Destination disambiguation**: `destination + region + country` to avoid wrong-place plans (e.g., Punjab ambiguity).
- **Map-deep-linking**: each activity/hotel has direct Google Maps links.
- **Calendar + monthly holidays panel** on dashboard.
- **Profile settings** with avatar URL and bio.
- **Dark/light mode toggle** across the app.

---

## 8) Key Design Decisions and Trade-offs

- **JWT stateless auth** was chosen for simplicity and API portability; trade-off is explicit token lifecycle handling on the client.
- **Schema-first AI validation** improves robustness; trade-off is occasional retries that add latency.
- **MongoDB flexible documents** simplify storing generated structures; trade-off is fewer strict relational constraints.
- **Backend holiday proxy + fallback** improves reliability across regions; trade-off is added dependency and maintenance.

---

## 9) Known Limitations

- Currency conversion is static-rate based (not live forex).
- AI output quality depends on external model/provider behavior and quota.
- Holiday coverage varies by provider/year/country.
- No media upload pipeline yet (avatar currently URL-based).
- JWT refresh-token flow is not implemented yet (only access token).

