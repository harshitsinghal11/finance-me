# 03 App Flow

## Application Overview
The application starts at the login page, authenticates with Google through Supabase, ensures a profile exists, and then exposes dashboard and member management workflows.

## Navigation Structure
- `/`
  login page
- `/auth/callback`
  OAuth callback route
- `/setup`
  first-time profile creation
- `/dashboard`
  summary metrics, due today widget, recent members, and dashboard search
- `/members`
  searchable and paginated member listing
- `/members/new`
  member creation form
- `/members/[id]`
  member details, family records, and installment schedule
- `/members/[id]/edit`
  member editing form

## Role Based Flows
### Authenticated user flow
1. Sign in with Google.
2. If no profile exists, complete `/setup`.
3. Open dashboard.
4. Navigate to members list or create a new member.
5. Open a member profile to manage status, family records, and installments.

## Feature Workflows
### Login and profile setup
1. User clicks Google sign-in.
2. Supabase redirects to Google and returns to `/auth/callback`.
3. Callback exchanges the code for a session.
4. The app checks `profiles`.
5. User is routed to `/dashboard` or `/setup`.

### New member creation
1. User fills personal, financial, guarantor, checklist, and document sections.
2. Form validation runs with Zod.
3. Member row is inserted into `members`.
4. Optional files are uploaded to Supabase Storage.
5. Installments are generated and inserted into `member_installments`.
6. Family members are inserted into `member_family`.
7. User is redirected to `/members`.

### Member editing
1. Existing member data and related family records are loaded.
2. User updates fields in the same form used for create.
3. Member row is updated.
4. Installments are recalculated:
   matching installment numbers are updated, new rows are inserted, excess rows are soft-deleted.
5. Existing family rows are deleted and replaced with the submitted list.

### Installment update
1. User opens the modal from the installment table.
2. User edits amount paid, penalty, status, received date, and remarks.
3. Status is auto-adjusted based on payment amount.
4. Installment row is updated.
5. If all installments are paid, the member status is updated to `Closed`.

### Member status management
1. User opens the status badge dropdown on the member details page.
2. User selects `Active`, `Closed`, or `Defaulted`.
3. Member row is updated immediately.

### Member deletion
1. User confirms deletion.
2. `members.is_deleted` is set to `true`.
3. User is redirected back to the members list.

## Data Flow
- Server components fetch protected data with the server Supabase client.
- Client components perform mutations directly against Supabase.
- Dashboard metrics are calculated in helper functions from queried installment and member data.
- Search, filter, sort, and pagination state are stored in URL search params.

## Error Handling Flow
- Unauthenticated access is redirected to `/` by `proxy.ts`.
- Missing profile after login redirects to `/setup`.
- Missing or deleted members render `notFound()`.
- Client-side mutations show toast feedback for success and failure.
- Form validation errors are shown inline through React Hook Form.

## Edge Cases
- Installment count calculation returns `0` when an installment amount does not cover periodic interest.
- Generated installment schedules can stop before the requested count if the remaining balance reaches zero.
- Editing a member can change the number of installment rows.
- Full payment with incorrect manual status is auto-corrected to `Paid`.
- Deleting family members from the detail page uses soft delete, while editing a member replaces family rows with hard deletes and reinserts.
