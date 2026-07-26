# Development Phases for Finance-Me

This document outlines the step-by-step development process based on the `PROJECT_SPEC.md`.

## Phase 1: Initial Setup & Configuration
- **Install Dependencies:**
  - UI/UX: `lucide-react` (icons), `sonner` (toast notifications), `framer-motion` (animations), `clsx`, `tailwind-merge` (for Shadcn UI).
  - Forms: `react-hook-form`, `zod` (validation).
  - Utils: `date-fns` (date manipulation).
  - Backend/Auth: `@supabase/supabase-js`, `@supabase/ssr`.
- **Folder Structure:** Setup `src/components`, `src/lib`, `src/types`, `src/hooks`.
- **Supabase Setup:** Configure Supabase browser and server clients in `src/lib/supabase`.
- **Environment Variables:** Define `.env.local` for Supabase URL and Anon Key.

## Phase 2: Database Setup (Supabase)
- **Execute SQL:** Run the `docs/database.sql` script in the Supabase SQL Editor.
- **Verify Tables:** Ensure `profiles`, `members`, `member_family`, and `member_installments` exist.
- **Verify Policies (RLS):** Ensure Row Level Security is active so users can only access their own data.
- **Storage Buckets:** Create a Supabase Storage bucket named `finance_documents` for uploading family photos and signatures, and set its RLS policies.

## Phase 3: Authentication & Login
- **Google OAuth Setup:** Configure Google Cloud Console credentials and paste the Client ID and Secret into Supabase Auth providers.
- **Login Page:** Build the `/login` UI.
- **Auth Callback:** Implement the `/auth/callback` route for Supabase OAuth redirection.
- **Route Protection:** Implement `middleware.ts` to protect dashboard routes, redirecting unauthenticated users to `/login`.

## Phase 4: Dashboard & Global UI
- **Global Layout:** Setup a persistent Sidebar/Navbar for authenticated routes.
- **User Profile & Logout:** Add user avatar and logout functionality in the navbar.
- **Dashboard Overview:** Implement a responsive dashboard with a search bar, filters, and an "Add Member" button.
- **Dark Mode:** Implement theme switching (Light/Dark).

## Phase 5: Member Management (CRUD)
- **Add Member Form:** Create a multi-step or comprehensive form using `react-hook-form` + `zod` for strict validation.
- **File Uploads:** Implement logic to upload photos/signatures to Supabase Storage and store the resulting URLs.
- **Auto-generate Installments Logic:** Write the utility function that calculates dates (Daily/Weekly/Monthly) and automatically generates installment records when a member is saved.
- **Member List:** Fetch and display the list of active members (excluding soft-deleted ones) with pagination/scrolling.
- **Member Details Page:** Build a dedicated view (`/members/[id]`) showing all member information.
- **Update/Delete:** Implement edit functionality and the "Soft Delete" mechanism (`is_deleted = true`).

## Phase 6: Installment & Family Management
- **Family Details:** Implement UI to view, add, or remove family members attached to a primary member.
- **Installment Table View:** Display an interactive data table for installments within the Member Details page.
- **Update Installments:** Add logic to mark an installment as `Paid`, `Partial`, or `Overdue`.
- **Partial Payments:** Implement logic to record `amount_paid` and automatically determine if the status is `Partial`.
- **Penalties:** Allow manual entry of `penalty_amount` per installment.

## Phase 7: UI Polish & Finalization
- **Animations:** Use `framer-motion` for smooth page transitions, modal popups, and expanding lists.
- **Feedback:** Ensure every CRUD operation fires a `sonner` toast (Success/Error).
- **Testing:** Perform end-to-end testing of the complete flow from Login to Member Creation to Installment Payment.
