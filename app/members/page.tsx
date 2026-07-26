import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Members</h1>
          <p className="mt-1 text-text-secondary">Manage all your active loan members.</p>
        </div>

        <Link
          href="/members/new"
          className="flex items-center gap-2 bg-button hover:bg-button-hover text-surface px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Member
        </Link>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Mobile</th>
                <th className="px-6 py-4 font-medium">Loan Amount</th>
                <th className="px-6 py-4 font-medium">Loan Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members?.map((member) => (
                <tr key={member.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text">{member.member_name}</td>
                  <td className="px-6 py-4 text-text-secondary">{member.mobile_no}</td>
                  <td className="px-6 py-4 text-text">₹{member.loan_amount}</td>
                  <td className="px-6 py-4 text-text-secondary">{format(new Date(member.loan_date), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium
                      ${member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${member.status === 'Closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                      ${member.status === 'Defaulted' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                    `}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/members/${member.id}`}
                      className="inline-flex items-center gap-1 text-brand hover:text-brand/80 font-medium"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {(!members || members.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    No members found. Click &quot;Add Member&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
