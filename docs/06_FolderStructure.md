# 06 Folder Structure

## Top-level
- `app/`
  Next.js App Router pages, layouts, global styles, and auth callback route.
- `src/components/`
  shared UI, dashboard components, and member feature components.
- `src/helpers/`
  loan math and installment date generation helpers.
- `src/lib/`
  Supabase client wrappers and storage upload helper.
- `docs/`
  SQL schema and project documentation.
- `public/`
  static assets.

## Route Structure
- `app/auth/login/page.tsx`
- `app/auth/callback/route.ts`
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`
- `app/members/page.tsx`
- `app/members/new/page.tsx`
- `app/members/[id]/page.tsx`
- `app/members/[id]/edit/page.tsx`
- `app/setup/page.tsx`

## Component Structure
- `src/components/dashboard/`
  dashboard metrics and summary widgets.
- `src/components/members/`
  member pages, tables, forms, status, family, and installment management.
- `src/components/members/form-sections/`
  sectioned building blocks for the member form.
- `src/components/ui/`
  generic button, animation, search, pagination, and skeleton components.
