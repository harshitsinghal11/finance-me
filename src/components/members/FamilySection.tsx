'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Users, Plus, Trash2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/Button'

const familySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  profession: z.string().optional(),
  income: z.coerce.number().default(0),
  mobile_no: z.string().optional(),
})

type FamilyFormValues = z.infer<typeof familySchema>
type FamilyMemberRecord = FamilyFormValues & { id: string }

export function FamilySection({ memberId, initialFamily }: { memberId: string, initialFamily: FamilyMemberRecord[] }) {
  const [familyMembers, setFamilyMembers] = useState(initialFamily || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof familySchema>, unknown, FamilyFormValues>({
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
      const { data: inserted, error } = await supabase
        .from('member_family')
        .insert({
          member_id: memberId,
          name: data.name,
          relation: data.relation,
          profession: data.profession,
          income: data.income,
          mobile_no: data.mobile_no
        })
        .select()
        .single()

      if (error) throw error

      setFamilyMembers([...familyMembers, inserted])
      toast.success('Family member added successfully')
      reset()
      setIsModalOpen(false)
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to add family member')
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

      setFamilyMembers(familyMembers.filter((member) => member.id !== id))
      toast.success('Family member removed')
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove family member')
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
          <Users className="h-5 w-5" /> Family Details
        </h2>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {familyMembers.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">No family members added yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex items-start justify-between rounded-md border border-border p-4">
              <div>
                <p className="font-medium text-text">{member.name}</p>
                <p className="mb-1 text-xs font-medium text-brand">{member.relation}</p>
                {member.mobile_no && <p className="text-sm text-text-secondary">Mobile: {member.mobile_no}</p>}
                {member.profession && <p className="text-sm text-text-secondary">Profession: {member.profession}</p>}
                <p className="text-sm text-text-secondary">
                  Income: {member.income == null ? '-' : `₹${member.income}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(member.id)}
                className="rounded p-1 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                title="Remove Member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-surface shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-medium text-text">Add Family Member</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Name *</label>
                <input
                  {...register('name')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text">Relation *</label>
                <input
                  {...register('relation')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                {errors.relation && <p className="mt-1 text-xs text-red-500">{errors.relation.message as string}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text">Profession</label>
                <input
                  {...register('profession')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Monthly Income</label>
                  <input
                    type="number"
                    {...register('income')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Mobile No</label>
                  <input
                    {...register('mobile_no')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
