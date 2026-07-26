import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { MemberFormValues } from '../schema'
import { InputField } from './FieldComponents'

interface GuarantorDetailsSectionProps {
  register: UseFormRegister<MemberFormValues>
  errors: FieldErrors<MemberFormValues>
}

export function GuarantorDetailsSection({ register, errors }: GuarantorDetailsSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-text mb-4">Guarantor Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Guarantor Name" name="guarantor_name" allowNumbers={false} register={register} errors={errors} />
        <InputField label="Guarantor Mobile" name="guarantor_mobile" type="tel" maxLength={10} register={register} errors={errors} />
      </div>
    </div>
  )
}
