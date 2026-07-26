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

export function InstallmentTable({ memberId, initialInstallments }: { memberId: string, initialInstallments: any[] }) {
  const [installments, setInstallments] = useState(initialInstallments || [])
  const [editingInst, setEditingInst] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<z.input<typeof updateSchema>, any, UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      amount_paid: 0,
      penalty_amount: 0,
      received_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
      remarks: ''
    }
  })

  // Watch for amount changes to auto-suggest status
  const watchAmountPaid = watch('amount_paid')
  const watchPenalty = watch('penalty_amount')

  const openEditModal = (inst: any) => {
    setEditingInst(inst)
    reset({
      amount_paid: inst.amount_paid || 0,
      penalty_amount: inst.penalty_amount || 0,
      received_date: inst.received_date ? format(new Date(inst.received_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      status: inst.status || 'Pending',
      remarks: inst.remarks || ''
    })
  }

  // Auto-calculate status based on input
  const calculateStatus = () => {
    if (!editingInst) return
    const expected = Number(editingInst.installment_amount) + Number(watchPenalty || 0)
    const paid = Number(watchAmountPaid || 0)

    if (paid >= expected) {
      setValue('status', 'Paid')
    } else if (paid > 0) {
      setValue('status', 'Partial')
    } else if (paid === 0) {
      setValue('status', 'Pending')
    }
  }

  const onSubmit = async (data: UpdateFormValues) => {
    if (!editingInst) return

    const expected = Number(editingInst.installment_amount) + Number(data.penalty_amount || 0)
    const paid = Number(data.amount_paid || 0)
    const outstanding = expected - paid

    if (data.status === 'Paid' && outstanding > 0) {
      toast.error('Cannot mark as Paid. Outstanding amount must be 0.')
      return
    }
    
    // Auto-correct to Paid if they paid in full but didn't change the status
    if (outstanding <= 0 && data.status !== 'Paid') {
      data.status = 'Paid'
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        amount_paid: data.amount_paid,
        penalty_amount: data.penalty_amount,
        received_date: data.received_date || null,
        status: data.status,
        remarks: data.remarks
      }

      const { data: updated, error } = await supabase
        .from('member_installments')
        .update(updateData)
        .eq('id', editingInst.id)
        .select()
        .single()

      if (error) throw error

      const updatedList = installments.map(i => i.id === updated.id ? updated : i)
      setInstallments(updatedList)
      
      const allPaid = updatedList.every(i => i.status === 'Paid')
      if (allPaid) {
        const { error: memberError } = await supabase
          .from('members')
          .update({ status: 'Closed' })
          .eq('id', memberId)
          
        if (memberError) {
          toast.error('Failed to auto-close member: ' + memberError.message)
        } else {
          toast.success('All installments paid! Member marked as Closed.')
        }
      } else {
        toast.success('Installment updated successfully')
      }
      setEditingInst(null)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to update installment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden mt-6">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand flex items-center gap-2">
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
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Received On</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {installments.map((inst) => (
              <tr key={inst.id} className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 font-medium text-text">#{inst.installment_no}</td>
                <td className="px-6 py-4 text-text-secondary">{format(new Date(inst.due_date), 'dd MMM yyyy')}</td>
                <td className="px-6 py-4 text-text font-medium">₹{inst.installment_amount}</td>
                <td className="px-6 py-4 text-text-secondary">₹{inst.penalty_amount || 0}</td>
                <td className="px-6 py-4 text-text font-medium">₹{inst.amount_paid || 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border
      ${inst.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : inst.status === "Closed"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : inst.status === "Defaulted"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                      }
    `}
                  >
                    {inst.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-secondary">{inst.received_date ? format(new Date(inst.received_date), 'dd MMM yyyy') : '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEditModal(inst)}
                    className="inline-flex items-center justify-center p-2 text-text-secondary hover:text-brand hover:bg-brand/10 rounded transition-colors"
                    title="Update Installment"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {installments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-text-secondary">
                  No installments generated.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Installment Modal */}
      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-medium text-text">Update Installment #{editingInst.installment_no}</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4 bg-background/50 p-3 rounded-md border border-border text-sm">
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
                  <label className="block text-sm font-medium text-text mb-1">Amount Paid *</label>
                  <input
                    type="number"
                    {...register('amount_paid')}
                    onBlur={calculateStatus}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  {errors.amount_paid && <p className="text-red-500 text-xs mt-1">{errors.amount_paid.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Penalty Amount</label>
                  <input
                    type="number"
                    {...register('penalty_amount')}
                    onBlur={calculateStatus}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  {errors.penalty_amount && <p className="text-red-500 text-xs mt-1">{errors.penalty_amount.message as string}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Status *</label>
                  <select
                    {...register('status')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Received Date</label>
                  <input
                    type="date"
                    {...register('received_date')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Remarks</label>
                <input
                  {...register('remarks')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Optional note"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingInst(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
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
