'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Users, Plus, Trash2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const familySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  profession: z.string().optional(),
  income: z.coerce.number().default(0),
  mobile_no: z.string().optional(),
})

type FamilyFormValues = z.infer<typeof familySchema>

export function FamilySection({ memberId, initialFamily }: { memberId: string, initialFamily: any[] }) {
  const [familyMembers, setFamilyMembers] = useState(initialFamily || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof familySchema>, any, FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: '',
      relation: '',
      profession: '',
      income: 0,
      mobile_no: '',
    }
  })

  const onSubmit = async (data: FamilyFormValues) => {
    setIsSubmitting(true)
    try {
      const newFamilyData = {
        member_id: memberId,
        name: data.name,
        relation: data.relation,
        profession: data.profession,
        income: data.income,
        mobile_no: data.mobile_no
      }

      const { data: inserted, error } = await supabase
        .from('member_family')
        .insert(newFamilyData)
        .select()
        .single()

      if (error) throw error

      setFamilyMembers([...familyMembers, inserted])
      toast.success('Family member added successfully')
      reset()
      setIsModalOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to add family member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return
    
    try {
      const { error } = await supabase
        .from('member_family')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) throw error

      setFamilyMembers(familyMembers.filter((m: any) => m.id !== id))
      toast.success('Family member removed')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to remove family member')
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand flex items-center gap-2">
          <Users className="h-5 w-5" /> Family Details
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-sm bg-button text-surface px-3 py-1.5 rounded-md hover:bg-button-hover transition-colors font-medium"
        >
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {familyMembers.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-4">No family members added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="border border-border rounded-md p-4 flex justify-between items-start">
              <div>
                <p className="font-medium text-text">{member.name}</p>
                <p className="text-xs text-brand font-medium mb-1">{member.relation}</p>
                {member.mobile_no && <p className="text-sm text-text-secondary">Mobile: {member.mobile_no}</p>}
                {member.profession && <p className="text-sm text-text-secondary">Profession: {member.profession}</p>}
                {member.income > 0 && <p className="text-sm text-text-secondary">Income: ₹{member.income}</p>}
              </div>
              <button 
                onClick={() => handleDelete(member.id)}
                className="text-text-secondary hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Family Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-text">Add Family Member</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Name *</label>
                <input
                  {...register('name')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Relation *</label>
                <input
                  {...register('relation')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Profession</label>
                <input
                  {...register('profession')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Monthly Income</label>
                  <input
                    type="number"
                    {...register('income')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Mobile No</label>
                  <input
                    {...register('mobile_no')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-md text-text hover:bg-surface-hover font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-button text-surface rounded-md hover:bg-button-hover font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
