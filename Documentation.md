# Finance-Me: Complete Technical Documentation

> Single Source of Truth (SSOT)
> Version: 1.0
> Status: Production Ready

---

## 1. Project Overview
Finance-Me is a modern, high-performance web application designed for finance businesses to manage members, loan records, and installment collections digitally. 
It replaces manual record-keeping with a secure, cloud-based system that allows tracking members, installments, penalties, and net profits through an intuitive and highly animated dashboard.

---

## 2. Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS v4, Framer Motion (for fluid animations), Lucide React (Icons), React Hook Form & Zod.
- **Backend/Database:** Supabase (PostgreSQL with Row Level Security).
- **Authentication:** Supabase Auth (Google OAuth).
- **Hosting:** Vercel (recommended).

---

## 3. Core Features & Architecture

### Dashboard & Analytics
- Displays aggregated financial metrics: Total Active Members, Total Outstanding, Total Cash Collected, and Total Net Profit.
- **Interactive Modals:** Clicking on "Cash Collected" or "Net Profit" opens beautifully animated overlay modals (via `Framer Motion`) showing a detailed tabular breakdown of individual payments, avoiding dashboard clutter.
- **Global Help Dialog:** Accessible via a floating action button or `Shift + ?` shortcut, providing dynamic system documentation.

### Member Management & Status
- Comprehensive Member form to add/edit profiles with robust Zod validation.
- **Dynamic Status Badge:** Members can be instantly marked as `Active`, `Closed`, or `Defaulted` directly from their profile page using an animated dropdown badge, executing a rapid server-side update.
- **Soft Deletion:** Deleting a member marks `is_deleted = true` to preserve historical integrity instead of permanently destroying financial records.
- **Interactive Financial Summary:** The member profile features a clean top-level financial card that expands into a full-screen, detailed financial breakdown modal upon click.

### Advanced Financial Mathematics
Centralized in `financeMath.ts`, the application handles complex, high-precision float calculations:
- **Flat Interest:** Calculated on the entire principal amount for the total duration.
- **Compound Interest:** Automatically scales based on exact **Tenure** (Years and Months).
- **Dynamic Installment Generation:** The system automatically schedules `Daily`, `Weekly`, or `Monthly` installments based on the loan date, tenure, and exact repayment formulas.
- **Dynamic Form Synchronization:** Real-time, bidirectional syncing between Installment Amount, Total Installments, and Tenure. Modifying any parameter instantly calculates the others with mathematical precision.
- **Net Profit Tracking:** Isolates actual revenue (Interest + Penalties - File Charges/Benefits) separate from the principal return.

### Document Management
- Integrated Supabase Storage buckets for uploading Family Photos, Member Signatures, and Guarantor Signatures.
- Minimalist, highly-styled custom file upload buttons replacing standard browser inputs.

---

## 4. Database Schema

The system uses `PostgreSQL` via Supabase with strict Row Level Security (RLS) ensuring clients can only access their own data.

### Tables
1. **profiles:** Links `auth.users` to the client's business profile.
2. **members:** The core entity. Contains all personal, business, and financial parameters (Loan Amount, Interest Rate, Tenure, Status).
3. **member_installments:** Auto-generated schedule of payments. Tracks `amount_paid`, `penalty_amount`, and payment `status` (Pending/Paid/Partial/Overdue).
4. **member_family:** Tracks dependents and family details of the member.

### Custom Types (Enums)
- `member_status`: Active, Closed, Defaulted
- `installment_type`: Daily, Weekly, Monthly
- `installment_status`: Pending, Paid, Partial, Overdue

---

## 5. Security & Authentication
- Supabase Row Level Security (RLS) is strictly enforced. Every table includes a `profile_id` or `member_id` foreign key that is checked against `auth.uid()` at the database level.
- Users cannot read, write, or modify data belonging to another profile.
