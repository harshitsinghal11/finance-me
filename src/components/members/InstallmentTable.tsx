'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Clock, Loader2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/Button'
import { format } from 'date-fns'

const updateSchema = z.object({
  amount_paid: z.coerce.number().min(0),
  penalty_amount: z.coerce.number().min(0).default(0),
  received_date: z.string().optional().or(z.literal('')),
  status: z.enum(['Pending', 'Paid', 'Partial', 'Overdue']),
  remarks: z.string().optional()
})

type UpdateFormValues = z.infer<typeof updateSchema>
type InstallmentRecord = {
  id: string
  installment_no: number
  due_date: string
  received_date?: string | null
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue'
  installment_amount: number | string
  amount_paid?: number | string | null
  penalty_amount?: number | string | null
  remarks?: string | null
}

export function InstallmentTable({ memberId, initialInstallments }: { memberId: string, initialInstallments: InstallmentRecord[] }) {
  const [installments, setInstallments] = useState<InstallmentRecord[]>(initialInstallments || [])
  const [editingInst, setEditingInst] = useState<InstallmentRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<z.input<typeof updateSchema>, unknown, UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      amount_paid: 0,
      penalty_amount: 0,
      received_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
      remarks: ''
    }
  })

  const openEditModal = (inst: InstallmentRecord) => {
    setEditingInst(inst)
    reset({
      amount_paid: inst.amount_paid || 0,
      penalty_amount: inst.penalty_amount || 0,
      received_date: inst.received_date ? format(new Date(inst.received_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      status: inst.status || 'Pending',
      remarks: inst.remarks || ''
    })
  }

  const calculateStatus = () => {
    if (!editingInst) return

    const expected = Number(editingInst.installment_amount) + Number(getValues('penalty_amount') || 0)
    const paid = Number(getValues('amount_paid') || 0)

    if (paid >= expected) {
      setValue('status', 'Paid')
    } else if (paid > 0) {
      setValue('status', 'Partial')
    } else {
      setValue('status', 'Pending')
    }
  }

  const onSubmit = async (data: UpdateFormValues) => {
    if (!editingInst) return

    const expected = Number(editingInst.installment_amount) + Number(data.penalty_amount || 0)
    const paid = Number(data.amount_paid || 0)
    const outstanding = expected - paid

    if (data.status === 'Paid' && outstanding > 0.01) {
      toast.error('Cannot mark as Paid. Outstanding amount must be 0.')
      return
    }

    if (outstanding <= 0 && data.status !== 'Paid') {
      data.status = 'Paid'
    }

    setIsSubmitting(true)

    try {
      const { data: updated, error } = await supabase
        .from('member_installments')
        .update({
          amount_paid: data.amount_paid,
          penalty_amount: data.penalty_amount,
          received_date: data.received_date || null,
          status: data.status,
          remarks: data.remarks
        })
        .eq('id', editingInst.id)
        .select()
        .single()

      if (error) throw error

      const updatedList = installments.map((installment) => installment.id === updated.id ? updated : installment)
      setInstallments(updatedList)

      const allPaid = updatedList.every((installment) => installment.status === 'Paid')

      if (allPaid) {
        const { error: memberError } = await supabase
          .from('members')
          .update({ status: 'Closed' })
          .eq('id', memberId)

        if (memberError) {
          toast.error(`Failed to auto-close member: ${memberError.message}`)
        } else {
          toast.success('All installments paid. Member marked as Closed.')
        }
      } else {
        toast.success('Installment updated successfully')
      }

      setEditingInst(null)
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to update installment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
          <Clock className="h-5 w-5" /> Installment Schedule
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/50 text-text-secondary">
            <tr>
              <th className="px-6 py-4 font-medium">No.</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium">Expected</th>
              <th className="px-6 py-4 font-medium">Penalty</th>
              <th className="px-6 py-4 font-medium">Paid</th>
              <th className="px-6 py-4 font-medium">Remaining</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Received On</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {installments.map((inst) => {
              const remaining = Math.max(
                0,
                (Number(inst.installment_amount) + Number(inst.penalty_amount || 0)) - Number(inst.amount_paid || 0)
              )

              return (
                <tr key={inst.id} className="transition-colors hover:bg-background/50">
                  <td className="px-6 py-4 font-medium text-text">#{inst.installment_no}</td>
                  <td className="px-6 py-4 text-text-secondary">{format(new Date(inst.due_date), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 font-medium text-text">₹{inst.installment_amount}</td>
                  <td className="px-6 py-4 text-text-secondary">₹{inst.penalty_amount || 0}</td>
                  <td className="px-6 py-4 font-medium text-text">₹{inst.amount_paid || 0}</td>
                  <td className="px-6 py-4 font-medium text-text-secondary">
                    {inst.status === 'Paid' || !inst.amount_paid ? '-' : `₹${remaining}`}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex min-w-[90px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                        inst.status === 'Paid'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : inst.status === 'Overdue'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : inst.status === 'Partial'
                              ? 'border-orange-200 bg-orange-50 text-orange-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {inst.received_date ? format(new Date(inst.received_date), 'dd MMM yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(inst)}
                      className="inline-flex items-center justify-center rounded p-2 text-text-secondary transition-colors hover:bg-brand/10 hover:text-brand"
                      title="Update Installment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {installments.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-text-secondary">
                  No installments generated.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-medium text-text">Update Installment #{editingInst.installment_no}</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4 rounded-md border border-border bg-background/50 p-3 text-sm">
                <div>
                  <p className="text-text-secondary">Due Date</p>
                  <p className="font-medium text-text">{format(new Date(editingInst.due_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Expected Amount</p>
                  <p className="font-medium text-text">₹{editingInst.installment_amount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Amount Paid *</label>
                  <input
                    type="number"
                    {...register('amount_paid')}
                    onBlur={calculateStatus}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  {errors.amount_paid && <p className="mt-1 text-xs text-red-500">{errors.amount_paid.message as string}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Penalty Amount</label>
                  <input
                    type="number"
                    {...register('penalty_amount')}
                    onBlur={calculateStatus}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  {errors.penalty_amount && <p className="mt-1 text-xs text-red-500">{errors.penalty_amount.message as string}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Status *</label>
                  <select
                    {...register('status', {
                      onChange: (e) => {
                        if (e.target.value === 'Paid') {
                          const expected = Number(editingInst.installment_amount) + Number(getValues('penalty_amount') || 0)
                          setValue('amount_paid', expected)
                        } else if (e.target.value === 'Pending') {
                          setValue('amount_paid', 0)
                        }
                      }
                    })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Received Date</label>
                  <input
                    type="date"
                    {...register('received_date')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text">Remarks</label>
                <input
                  {...register('remarks')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Optional note"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="secondary" onClick={() => setEditingInst(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
