import { z } from 'zod'

export const memberSchema = z.object({
  member_name: z.string().min(1, 'Name is required'),
  mobile_no: z.string().min(10, 'Mobile number must be at least 10 digits'),
  residence_address: z.string().optional(),
  permanent_address: z.string().optional(),
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  vehicle_details: z.string().optional(),
  total_family_members: z.coerce.number().min(0).default(0),

  loan_amount: z.coerce.number().min(1, 'Loan amount is required'),
  loan_date: z.string().min(1, 'Loan date is required'),
  interest_type: z.enum(['Flat', 'Reducing']).default('Flat'),
  interest_rate: z.coerce.number().default(0),
  file_charge: z.coerce.number().default(0),
  benefit_amount: z.coerce.number().default(0),
  installment_amount: z.coerce.number().min(1, 'Installment amount is required'),
  installment_type: z.enum(['Daily', 'Weekly', 'Monthly']),
  total_installments: z.coerce.number().min(1, 'Total installments is required'),
  installment_start_date: z.string().min(1, 'Start date is required'),
  installment_end_date: z.string().optional(),

  guarantor_name: z.string().optional(),
  guarantor_mobile: z.string().optional(),

  aadhar_available: z.boolean().default(false),
  pan_available: z.boolean().default(false),
  family_id_available: z.boolean().default(false),
  original_signed_cheques: z.coerce.number().default(0),
  whatsapp_mobile: z.string().optional(),
  loan_agreement_available: z.boolean().default(false),
  promissory_note_available: z.boolean().default(false),
  email: z.string().email().optional().or(z.literal('')),
  email_password: z.string().optional(),
  loan_transaction_proof: z.boolean().default(false),
  rc_or_gold_photos: z.boolean().default(false),
  remarks: z.string().optional(),

  // These will be FileLists in the browser
  family_photo: z.any().optional(),
  member_signature: z.any().optional(),
  guarantor_signature: z.any().optional(),

  family_members: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    relation: z.string().min(1, 'Relation is required'),
    profession: z.string().optional(),
    income: z.coerce.number().default(0),
    mobile_no: z.string().optional(),
  })).default([]),
})

export type MemberFormValues = z.infer<typeof memberSchema>
