import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { MemberFormValues } from '../schema'
import { InputField } from './FieldComponents'

interface PersonalInfoSectionProps {
  register: UseFormRegister<MemberFormValues>
  errors: FieldErrors<MemberFormValues>
}

export function PersonalInfoSection({ register, errors }: PersonalInfoSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-text mb-4">Personal Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Member Name *" name="member_name" allowNumbers={false} register={register} errors={errors} />
        <InputField label="Mobile Number *" name="mobile_no" type="tel" maxLength={10} register={register} errors={errors} />
        <InputField label="Residence Address" name="residence_address" register={register} errors={errors} />
        <InputField label="Permanent Address" name="permanent_address" register={register} errors={errors} />
        <InputField label="Company Name" name="company_name" register={register} errors={errors} />
        <InputField label="Company Address" name="company_address" register={register} errors={errors} />
        <InputField label="Vehicle Details" name="vehicle_details" register={register} errors={errors} />
        <InputField label="Total Family Members" name="total_family_members" type="number" register={register} errors={errors} />
      </div>
    </div>
  )
}
