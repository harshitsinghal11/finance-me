import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export async function RecentMembersWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: recentMembers } = await supabase
    .from('members')
    .select('id, member_name, mobile_no, created_at, loan_amount, status')
    .eq('profile_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!recentMembers || recentMembers.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-text">No Members Yet</h3>
        <p className="mt-1 text-sm text-text-secondary">Add your first member to see them here.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-background/50 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-text">
          <Clock className="h-4 w-4 text-text-secondary" />
          Recently Added Members
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-border">
          {recentMembers.map((member) => (
            <li key={member.id} className="group p-4 transition-colors hover:bg-background/50">
              <Link href={`/members/${member.id}`} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-text transition-colors group-hover:text-brand">
                    {member.member_name}
                  </span>
                  <span className="mt-0.5 text-xs text-text-secondary">
                    Added {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-text">₹{member.loan_amount}</span>
                  <span className={`mt-0.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    member.status === 'Active'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : member.status === 'Closed'
                        ? 'border-slate-200 bg-slate-100 text-slate-700'
                        : member.status === 'Defaulted'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-gray-100 text-gray-700'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
