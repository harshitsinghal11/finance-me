import { UseFormRegister, FieldErrors, UseFieldArrayRemove, UseFieldArrayAppend } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { MemberFormValues } from '../schema'

interface FamilyMembersSectionProps {
  register: UseFormRegister<MemberFormValues>
  errors: FieldErrors<MemberFormValues>
  familyFields: Record<'id', string>[]
  appendFamily: UseFieldArrayAppend<MemberFormValues, 'family_members'>
  removeFamily: UseFieldArrayRemove
}

export function FamilyMembersSection({ register, errors, familyFields, appendFamily, removeFamily }: FamilyMembersSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text">Family Members</h2>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => appendFamily({ name: '', relation: '', profession: '', income: 0, mobile_no: '' })}
        >
          <Plus className="h-4 w-4" /> Add Family Member
        </Button>
      </div>
        
      {familyFields.length === 0 ? (
        <p className="text-sm text-text-secondary py-2">No family members added yet.</p>
      ) : (
        <div className="space-y-4">
          {familyFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-border rounded-md items-start relative pt-8 md:pt-4">
              <button
                type="button"
                onClick={() => removeFamily(index)}
                className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1"
                title="Remove Family Member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-text mb-1">Name *</label>
                <input 
                  {...register(`family_members.${index}.name` as const)} 
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '') }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" 
                />
                {errors.family_members?.[index]?.name && <p className="text-red-500 text-xs mt-1">{errors.family_members[index]?.name?.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Relation *</label>
                <input 
                  {...register(`family_members.${index}.relation` as const)} 
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '') }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" 
                />
                {errors.family_members?.[index]?.relation && <p className="text-red-500 text-xs mt-1">{errors.family_members[index]?.relation?.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Profession</label>
                <input {...register(`family_members.${index}.profession` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Income</label>
                <input type="number" {...register(`family_members.${index}.income` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Mobile</label>
                <input 
                  type="tel" 
                  maxLength={10} 
                  {...register(`family_members.${index}.mobile_no` as const)} 
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
