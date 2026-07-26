import { UseFormRegister } from 'react-hook-form'
import { MemberFormValues } from '../schema'

interface DocumentUploadSectionProps {
  register: UseFormRegister<MemberFormValues>
}

export function DocumentUploadSection({ register }: DocumentUploadSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-text mb-4">Upload Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Family Photo</label>
          <input type="file" accept="image/*" {...register('family_photo')} className="w-full text-sm text-text-secondary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Member Signature</label>
          <input type="file" accept="image/*" {...register('member_signature')} className="w-full text-sm text-text-secondary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Guarantor Signature</label>
          <input type="file" accept="image/*" {...register('guarantor_signature')} className="w-full text-sm text-text-secondary" />
        </div>
      </div>
    </div>
  )
}
