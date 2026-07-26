import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export async function DueTodayWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get today's date in YYYY-MM-DD format (local time)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today

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
      <div className="bg-surface rounded-lg border border-border shadow-sm p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text">All Caught Up!</h3>
        <p className="text-sm text-text-secondary mt-1">No collections due today.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h3 className="font-semibold text-text flex items-center gap-2">
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
            const isOverdue = new Date(inst.due_date) < new Date(new Date().setHours(0, 0, 0, 0));
            // Type assertion because Supabase types might infer an array for joins depending on schema generation
            const member = (Array.isArray(inst.members) ? inst.members[0] : inst.members) as any;

            return (
              <li key={inst.id} className="p-4 hover:bg-background/50 transition-colors group">
                <Link href={`/members/${member.id}`} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-text group-hover:text-brand transition-colors">
                      {member.member_name}
                    </span>
                    <span className="text-xs text-text-secondary mt-0.5">
                      Inst #{inst.installment_no} • {member.mobile_no}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-text">₹{inst.installment_amount}</span>
                    <span className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-text-secondary'}`}>
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
