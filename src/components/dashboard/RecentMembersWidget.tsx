import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
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
      <div className="bg-surface rounded-lg border border-border shadow-sm p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-text">No Members Yet</h3>
        <p className="text-sm text-text-secondary mt-1">Add your first member to see them here.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <h3 className="font-semibold text-text flex items-center gap-2">
          <Clock className="h-4 w-4 text-text-secondary" />
          Recently Added Members
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-border">
          {recentMembers.map((member) => (
            <li key={member.id} className="p-4 hover:bg-background/50 transition-colors group">
              <Link href={`/members/${member.id}`} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-text group-hover:text-brand transition-colors">
                    {member.member_name}
                  </span>
                  <span className="text-xs text-text-secondary mt-0.5">
                    Added {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-text">₹{member.loan_amount}</span>
                  <span className={`text-xs mt-0.5 font-medium px-2 py-0.5 rounded-full border
                    ${member.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                      member.status === "Closed" ? "bg-slate-100 text-slate-700 border-slate-200" :
                        member.status === "Defaulted" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"}
                  `}>
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
