# Finance-Me Polish & Refactor Plan

This document outlines the step-by-step technical plan to clean up, refactor, and finalize the core functionality of the Finance-Me application before we apply UI polish like Framer Motion animations and Sonner toasts.

## 1. Wire up the Search Bar (Members List)
**Goal:** Make the static search input in `app/members/page.tsx` functional.
**Approach:**
- Use Next.js client-side hooks (`useRouter`, `usePathname`, `useSearchParams`).
- Convert the static `<input>` into a client component or extract it into a separate `SearchInput` component.
- On input change (with debouncing, e.g., using `use-debounce`), update the URL search parameters (e.g., `?query=harshit`).
- In `app/members/page.tsx` (Server Component), read `searchParams.query`.
- Update the Supabase query to include an `.ilike('member_name', \`%${query}%\`)` clause so it filters server-side.

## 2. Pagination / Infinite Scroll
**Goal:** Handle large datasets gracefully without fetching all members at once.
**Approach:**
- **Server-Side Pagination:** Update the Supabase query in `app/members/page.tsx` to use `.range(from, to)`.
- **URL State:** Track the current page in the URL (e.g., `?page=2`).
- **UI:** Add simple "Previous" and "Next" buttons below the table, or a standard pagination control.
- *Alternative:* Implement Infinite Scroll by converting the table body to a Client Component that uses `useSWRInfinite` or React Query, though standard URL pagination is easier to build cleanly first.

## 3. Refactor the Giant Form (`MemberForm.tsx`)
**Goal:** Break down the massive ~20KB form into manageable, maintainable pieces.
**Approach:**
- Split `MemberForm.tsx` into logical sections:
  - `PersonalInfoSection.tsx`: Name, mobile, email, address, etc.
  - `LoanDetailsSection.tsx`: Loan amount, interest rate, frequency, etc.
  - `DocumentUploadSection.tsx`: File upload logic for photos/signatures.
- Keep the `useForm` hook in the parent `MemberForm.tsx` and pass the `control` and `register` objects down to the child components.
- **Why?** This makes the code readable and sets us up perfectly to animate each section sliding in sequentially using Framer Motion later.

## 4. Loading States
**Goal:** Prevent the user from staring at a blank screen or stale UI during server fetches.
**Approach:**
- Create `loading.tsx` files inside `app/members/` and `app/dashboard/`.
- Inside `loading.tsx`, return skeleton loaders (gray pulsing rectangles) that match the layout of the table or dashboard cards.
- Add React `Suspense` boundaries around slow server components if needed.

## 5. Dashboard Aggregations
**Goal:** Make `/dashboard` display accurate, real-time statistics.
**Approach:**
- Write server-side queries in `app/dashboard/page.tsx` to calculate:
  - Total Active Members (count query).
  - Total Outstanding Loan Amount (sum of active loans minus paid installments).
  - Total Defaulted Members.
  - Revenue/Collected this month.
- Ensure these stats are calculated safely (RLS aware) using Supabase aggregations.

## 6. Installment Logic Polish
**Goal:** Ensure auto-generation of installments and penalty calculations are bulletproof.
**Approach:**
- Audit the utility function that generates the schedule (Daily/Weekly/Monthly).
- Ensure edge cases (like leap years or end-of-month dates) are handled correctly using `date-fns`.
- Ensure that when a payment is marked as "Partial", the remaining balance rolls over properly or is flagged.
- Add tests or manual verification scripts for this logic before trusting it in production.

---

### Phase 7: UI Polish (To be done AFTER the above)
Once the above cleanup is complete and the application is structurally sound:
- [ ] Add `sonner` toasts to every successful/failed mutation (Add member, Delete member, Payment logged).
- [ ] Add `framer-motion` page transitions (`layout.tsx`).
- [ ] Add staggered list animations for the members table.
- [ ] Add smooth expand/collapse animations for family sections and tables.
