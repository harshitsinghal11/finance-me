# 02 TRD

## Tech Stack
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase SSR and Supabase JS
- React Hook Form
- Zod
- Framer Motion
- date-fns
- Sonner
- Lucide React

## System Architecture
- Frontend:
  Next.js App Router pages under `app/`.
- Shared UI and feature components:
  `src/components/`.
- Domain helpers:
  `src/helpers/financeMath.ts` and `src/helpers/dateHelpers.ts`.
- Backend services:
  Supabase Auth, PostgreSQL tables, Row Level Security, and Storage.
- Route protection:
  `proxy.ts` checks auth state and redirects unauthenticated users.

## Authentication Strategy
- Sign-in uses Supabase Google OAuth from `app/auth/login/page.tsx`.
- OAuth callback exchanges the auth code for a session in `app/auth/callback/route.ts`.
- After login, the app checks whether a `profiles` row exists:
  existing users go to `/dashboard`, first-time users go to `/setup`.
- Server-side auth access uses `src/lib/supabase/server.ts`.
- Client-side auth actions use `src/lib/supabase/client.ts`.

## Third-party Integrations
- Supabase Auth for login and session handling.
- Supabase PostgreSQL for application data.
- Supabase Storage bucket `finance_documents` for image uploads.
- Google OAuth as the configured auth provider.

## Deployment Overview
- No deployment configuration files are committed in the repository.
- Based on the stack, this is a standard Next.js application intended to run with environment variables for Supabase.
- Required environment variables found in code:
  `NEXT_PUBLIC_SUPABASE_URL`
  `NEXT_PUBLIC_ANON_KEY`
