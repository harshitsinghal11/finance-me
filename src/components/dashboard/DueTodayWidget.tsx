import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'
import { AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface DueInstallmentMember {
  id: string
  member_name: string
  mobile_no: string
}

export async function DueTodayWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const { data: dueInstallments } = await supabase
    .from('member_installments')
    .select(`
      id,
      installment_no,
      installment_amount,
      due_date,
      status,
      members!inner (
        id,
        member_name,
        mobile_no,
        profile_id,
        is_deleted,
        status
      )
    `)
    .eq('members.profile_id', user.id)
    .eq('members.is_deleted', false)
    .eq('members.status', 'Active')
    .eq('is_deleted', false)
    .in('status', ['Pending', 'Partial'])
    .lte('due_date', today.toISOString())
    .order('due_date', { ascending: true })
    .limit(5)

  if (!dueInstallments || dueInstallments.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-background/50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-text">
            <AlertCircle className="h-4 w-4" />
            Due Today & Overdue
          </h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-emerald-900">All Caught Up!</h3>
          <p className="mt-1 text-sm text-text-secondary">No collections due today.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-background/50 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-text">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Due Today & Overdue
        </h3>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          Action Required
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-border">
          {dueInstallments.map((inst) => {
            const isOverdue = new Date(inst.due_date) < new Date(new Date().setHours(0, 0, 0, 0))
            const member = (Array.isArray(inst.members) ? inst.members[0] : inst.members) as DueInstallmentMember

            return (
              <li key={inst.id} className="group p-4 transition-colors hover:bg-background/50">
                <Link href={`/members/${member.id}`} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-text transition-colors group-hover:text-brand">
                      {member.member_name}
                    </span>
                    <span className="mt-0.5 text-xs text-text-secondary">
                      Inst #{inst.installment_no} | {member.mobile_no}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-text">₹{Number(inst.installment_amount).toLocaleString('en-IN')}</span>
                    <span className={`mt-0.5 text-xs ${isOverdue ? 'font-medium text-red-500' : 'text-text-secondary'}`}>
                      {isOverdue ? 'Overdue' : 'Due Today'} ({format(new Date(inst.due_date), 'dd MMM')})
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
