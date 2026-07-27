# 01 PRD

## Project Vision
Finance Me is a web application for running a small loan or micro-finance operation with digital member records, repayment schedules, payment tracking, and summary metrics.

## Problem Statement
The codebase is built around replacing scattered or manual loan tracking with:
- centralized member records
- generated installment schedules
- payment and penalty tracking
- dashboard-level visibility into active loans, collections, and profit

## Goals & Objectives
- Let authenticated users create and manage borrower records.
- Generate installment schedules from loan configuration.
- Track payment status, received date, and penalty amount per installment.
- Show operational summaries on a dashboard.
- Preserve deleted data through soft deletion for members and installments.

## Target Audience
- A finance operator or small lending business owner using a single authenticated profile.

## User Roles & Permissions
- Authenticated user:
  Can create a profile, manage only their own members, family records, installments, and uploaded files through Supabase-backed access control.

## Core Features
- Google sign-in and first-time profile setup.
- Dashboard with:
  active member count, total outstanding, collected today, and net profit this month.
- Member listing with search, filter, sort, and pagination.
- Member create and edit form with validation.
- Automatic installment generation from loan inputs.
- Member detail page with:
  personal details, financial summary, family members, and installment table.
- Installment update flow with paid, partial, pending, and overdue states.
- Manual member status updates.
- Soft delete for members.
- Image uploads for family photo, member signature, and guarantor signature.
- Global help modal.

## Functional Requirements
- The app must require authentication for protected routes.
- The app must redirect first-time users without a `profiles` row to `/setup`.
- A member record must store personal, loan, guarantor, and checklist data.
- Creating a member must generate installment rows in `member_installments`.
- Editing a member must recalculate installment rows while preserving existing installment records where possible.
- Family members must be attachable during create/edit and from the member detail page.
- Updating an installment must allow amount paid, penalty, received date, status, and remarks.
- When all installments are marked paid, the member is auto-updated to `Closed`.

## Non-Functional Requirements
- TypeScript is used across the app.
- Form validation is handled with Zod and React Hook Form.
- Server and browser Supabase clients are separated.
- Data isolation is enforced with Supabase Row Level Security.
- UI includes animated transitions and modal interactions using Framer Motion.

## Business Rules
- Member statuses are `Active`, `Closed`, and `Defaulted`.
- Installment statuses are `Pending`, `Paid`, `Partial`, and `Overdue`.
- Deleted members are hidden by `is_deleted = true` instead of being removed.
- Installment schedules stop early if the generated repayment amount is fully covered before the requested count.
- An installment cannot be marked `Paid` while an outstanding amount remains.
- Full repayment across all installments automatically closes the member.

## Assumptions
- One signed-in user manages one finance profile.
- Currency handling is intended for INR based on UI labels.
- Google OAuth is the only implemented sign-in method.

## Constraints
- The repository only shows Supabase as the backend and auth provider.
- No multi-role authorization model is implemented in code.
- No API layer beyond Next.js routes and direct Supabase access is present.

## Future Enhancements
- No explicit future roadmap is implemented in code beyond the current feature set.
