# Finance-Me

> Single Source of Truth (SSOT)
>
> Version: 0.1
> Last Updated: 26 July 2026
> Status: Planning

---

# 1. Project Overview

Finance-Me is a web application for finance businesses to manage their members and installment records digitally.

The client logs into the application using their Google account. After authentication, they can manage members, record installment information, search members, update, delete, add and modify records through an intuitive dashboard.

---

# 2. Project Goal

Replace manual record keeping with a secure cloud-based system that allows:

- Managing members
- Tracking installments
- Tracking penalties
- Viewing member information
- Editing records anytime
- Secure login

---

# 3. Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Supabase

## Authentication

- Google OAuth
- Supabase Authentication

## Database

- PostgreSQL (Supabase)

## Hosting

- Vercel

---

# 4. User Roles

Currently only one role exists.

## Client

Can

- Login
- Logout
- View Dashboard
- Add Member
- Edit Member
- Delete Member
- Modify Member
- Search Members
- Filter Members
- View Member Details
- Add Installments
- Edit Installments
- Delete Installments
- Modify Installments

---

# 5. Authentication

Authentication Provider

- Google OAuth

Authentication Service

- Supabase Auth

# 6. Flow

1. Client Open Website → Login with Google 
2. Basic Profile Setup form will open → Fill and submit\
3. Data updated in profile table in supabase
4. Dashboard will open
5. After This user can Add, Modify and Remove member Details, installments.
6. After Logging Out → User will be redirected to the login pagew

---

# 7. Features

## Dashboard

Contains
- Search Bar
- Filters
- Add Member Button
- Members List

---

## Member Management

Client can
- Add Member
- Edit Member
- Delete Member
- View Member

---

## Installment Management

Every member has their own installment records.

Client can
- Add Installment
- Edit Installment
- Delete Installment
- Update Penalty
- Update Due Date
- Update Status

---

# 8. Tables

## Table 1 - profiles

Purpose

Stores application-specific information for authenticated users.

Each profile corresponds to exactly one user in `auth.users`.

Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key (Same as auth.users.id) |
| full_name | Text | User Full Name |
| email | Text | Google Email |
| avatar_url | Text | Google Profile Image |
| created_at | Timestamp | Created Time |
| updated_at | Timestamp | Updated Time |

---

## Table 2 - members

Purpose

Stores the primary details of every member.

Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| profile_id | UUID | References profiles.id |
| member_name | Text | Member Name |
| mobile_no | Text | Mobile Number |
| status | Enum | Active / Closed / Defaulted |
| family_photo_url | Text | Family Photo (Supabase Storage) |
| residence_address | Text | Residence Address |
| permanent_address | Text | Permanent Address |
| company_name | Text | Company Name |
| company_address | Text | Company Address |
| vehicle_details | Text | Vehicle Details |
| total_family_members | Integer | Family Count |
| loan_amount | Decimal | Loan Amount |
| loan_date | Date | Loan Date |
| file_charge | Decimal | File Charge |
| benefit_amount | Decimal | Benefit Amount |
| installment_amount | Decimal | Installment Amount |
| installment_type | Enum | Daily / Weekly / Monthly |
| total_installments | Integer | Total Installments |
| installment_start_date | Date | Installment Start |
| installment_end_date | Date | Installment End |
| member_signature_url | Text | Member Signature (Supabase Storage) |
| guarantor_name | Text | Guarantor Name |
| guarantor_mobile | Text | Guarantor Mobile |
| guarantor_signature_url | Text | Guarantor Signature (Supabase Storage) |
| aadhar_available | Boolean | Available |
| pan_available | Boolean | Available |
| family_id_available | Boolean | Available |
| original_signed_cheques | Integer | Number of Cheques |
| whatsapp_mobile | Text | WhatsApp Number |
| loan_agreement_available | Boolean | Available |
| promissory_note_available | Boolean | Available |
| email | Text | Member Email |
| email_password | Text | Optional (Not Recommended) |
| loan_transaction_proof | Boolean | Available |
| rc_or_gold_photos | Boolean | Available |
| remarks | Text | Additional Notes |
| is_deleted | Boolean | Soft Delete Flag |
| created_at | Timestamp | Created Time |
| updated_at | Timestamp | Updated Time |

---

## Table 3 - member_family

Purpose

Stores the family details of a member.

Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| member_id | UUID | References members.id |
| name | Text | Family Member Name |
| relation | Text | Relation |
| profession | Text | Profession |
| income | Decimal | Income |
| mobile_no | Text | Mobile Number |

---

## Table 4 - member_installments

Purpose

Stores installment history for each member.

Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| member_id | UUID | References members.id |
| installment_no | Integer | Installment Number |
| due_date | Date | Due Date |
| received_date | Date | Date Received |
| status | Enum | Pending / Paid / Partial / Overdue |
| installment_amount | Decimal | Installment Amount |
| amount_paid | Decimal | Amount Paid |
| penalty_amount | Decimal | Penalty Amount |
| cheque_received | Boolean | Cheque Received |
| remarks | Text | Additional Notes |
| is_deleted | Boolean | Soft Delete Flag |
| created_at | Timestamp | Created Time |

# 9. Table Relationships

```
Supabase Auth

auth.users
     │
     │ 1 : 1
     ▼
profiles
     │
     │ 1 : N
     ▼
members
     │
     ├──────────────┐
     │              │
     │ 1 : N        │ 1 : N
     ▼              ▼
member_family   member_installments
```

Relationship Summary

- One authenticated Google account has one profile.
- One profile can manage many members.
- One member can have many family members.
- One member can have many installment records.
- Every family record belongs to one member.
- Every installment record belongs to one member.

# 10. Business Rules

- Only authenticated users can access the dashboard.
- Every member must belong to exactly one profile.
- A member can have zero or more family members.
- A member can have zero or more installment records.
- **Soft Deletes**: Deleting a member marks them as `is_deleted = true`. All their related family members and installment records are also soft-deleted (`is_deleted = true`).
- Users cannot access data belonging to another profile.
- Search operates only on the current user's members.
- Installments are always linked to a single member.
- Family records cannot exist without a member.
- **Auto-generation of Installments**: When a new member is added, the system will auto-generate all rows in `member_installments` based on `installment_start_date`, `installment_type` (Daily/Weekly/Monthly), and `total_installments`.

---

# 11. Financial Math Logic

This section outlines the financial formulas and business logic used for loans and installments.

- **Total Payable Amount**: `installment_amount * total_installments`
- **Loan Net Disbursed**: `loan_amount - file_charge + benefit_amount` (Update this formula according to your specific requirements)
- **Installment Generation Logic**:
  - Daily: Due dates are generated adding 1 day successively to `installment_start_date`.
  - Weekly: Due dates are generated adding 7 days successively to `installment_start_date`.
  - Monthly: Due dates are generated adding 1 month successively to `installment_start_date`.
- **Partial Payments**: If `amount_paid` < `installment_amount`, the status becomes `Partial`. The remaining balance might be added to the penalty or rolled over to the next installment.
- **Penalty Logic**: (Manual entry for now. Future automation to be decided).

---

# 12. CRUD Operations

## Members

Create

Read

Update

Delete (Soft Delete)

---

## Installments

Create (Auto-generated on Member creation)

Read

Update

Delete (Soft Delete)

---

# 13. Security

Authentication

- Google OAuth

Authorization

- Row Level Security (RLS)

Policy

Users can only access their own data.

---

# 14. Future Improvements

- Payment History
- Dashboard Analytics
- Export to Excel
- Export PDF
- Notifications
- WhatsApp Reminder
- SMS Reminder
- Member Documents
- Dark Mode

---

# 15. Pending Decisions

- Final database schema (Updated)
- Final UI Design
- Filter options: Filter members by `status` (Active/Closed) and `installment_type` (Daily/Weekly). Filter installments by `status` (Pending/Overdue/Partial).
- Search fields: Search members by `member_name`, `mobile_no`, and `guarantor_name`.
- Installment status values: `Pending`, `Paid`, `Partial`, `Overdue`.
- Penalty calculation logic: Manual entry for version 1.0.

---