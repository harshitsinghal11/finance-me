import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { MemberFormValues } from '../schema'
import { InputField, CheckboxField } from './FieldComponents'

interface ChecklistSectionProps {
  register: UseFormRegister<MemberFormValues>
  errors: FieldErrors<MemberFormValues>
}

export function ChecklistSection({ register, errors }: ChecklistSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-text mb-4">Documents & Checklist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <CheckboxField label="Aadhar Available" name="aadhar_available" register={register} />
        <CheckboxField label="PAN Available" name="pan_available" register={register} />
        <CheckboxField label="Family ID Available" name="family_id_available" register={register} />
        <CheckboxField label="Loan Agreement Available" name="loan_agreement_available" register={register} />
        <CheckboxField label="Promissory Note Available" name="promissory_note_available" register={register} />
        <CheckboxField label="Loan Transaction Proof" name="loan_transaction_proof" register={register} />
        <CheckboxField label="RC / Gold Photos" name="rc_or_gold_photos" register={register} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Original Signed Cheques (Count)" name="original_signed_cheques" type="number" register={register} errors={errors} />
        <InputField label="WhatsApp Mobile" name="whatsapp_mobile" type="tel" maxLength={10} register={register} errors={errors} />
        <InputField label="Email Address" name="email" type="email" register={register} errors={errors} />
        <InputField label="Email Password" name="email_password" register={register} errors={errors} />
      </div>

      <div className="mt-4">
        <InputField label="Remarks / Notes" name="remarks" register={register} errors={errors} />
      </div>
    </div>
  )
}
