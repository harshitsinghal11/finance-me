# 05 Data Architecture

## Database Schema
### `profiles`
- `id` UUID primary key linked to `auth.users(id)`
- `full_name`
- `email`
- `avatar_url`
- `created_at`
- `updated_at`

### `members`
- Core identity fields:
  `member_name`, `mobile_no`, `status`
- Address and company fields:
  `residence_address`, `permanent_address`, `company_name`, `company_address`, `vehicle_details`
- Financial fields:
  `loan_amount`, `loan_date`, `interest_type`, `interest_rate`, `file_charge`, `benefit_amount`, `installment_amount`, `installment_type`, `tenure_years`, `tenure_months`, `total_installments`, `installment_start_date`, `installment_end_date`
- Guarantor and document fields:
  `member_signature_url`, `guarantor_name`, `guarantor_mobile`, `guarantor_signature_url`, checklist booleans, `email`, `email_password`, `remarks`
- Lifecycle fields:
  `is_deleted`, `created_at`, `updated_at`

### `member_family`
- `id`
- `member_id`
- `name`
- `relation`
- `profession`
- `income`
- `mobile_no`
- `is_deleted`

### `member_installments`
- `id`
- `member_id`
- `installment_no`
- `due_date`
- `received_date`
- `status`
- `installment_amount`
- `amount_paid`
- `penalty_amount`
- `cheque_received`
- `remarks`
- `is_deleted`
- `created_at`

## Relationships
- `profiles.id -> auth.users.id`
- `members.profile_id -> profiles.id`
- `member_family.member_id -> members.id`
- `member_installments.member_id -> members.id`

## Indexes
- `idx_members_profile_id`
- `idx_members_status`
- `idx_members_is_deleted`
- `idx_member_family_member_id`
- `idx_member_installments_member_id`
- `idx_member_installments_status`

## Storage Buckets
- `finance_documents`
  Used for family photo, member signature, and guarantor signature uploads.

## RLS Policies
- `profiles`
  users can select, insert, and update only their own row.
- `members`
  users can select, insert, update, and delete only rows where `profile_id = auth.uid()`.
- `member_family`
  access is allowed only when the related member belongs to the authenticated profile.
- `member_installments`
  access is allowed only when the related member belongs to the authenticated profile.

## Database Functions
- `update_modified_column()`
  Trigger function used to maintain `updated_at`.

## Triggers
- `update_profiles_modtime`
- `update_members_modtime`

## API Models
### Member create/edit input
The form schema in `src/components/members/schema.ts` includes:
- member identity and contact fields
- loan and installment configuration
- guarantor details
- document and checklist flags
- uploaded files
- nested `family_members`

### Installment update input
The installment update modal accepts:
- `amount_paid`
- `penalty_amount`
- `received_date`
- `status`
- `remarks`
