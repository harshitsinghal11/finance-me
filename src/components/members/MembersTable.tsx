'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'
import Pagination from '@/src/components/ui/Pagination'

interface MembersTableProps {
  members: Array<{
    id: string
    member_name: string
    mobile_no: string
    loan_amount: number | string
    loan_date: string
    installment_amount: number | string
    total_installments: number
    status: 'Active' | 'Closed' | 'Defaulted'
  }>
  totalPages: number
  currentPage: number
}

export function MembersTable({ members, totalPages, currentPage }: MembersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/50 text-text-secondary">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Mobile</th>
              <th className="px-6 py-4 font-medium">Loan Amount</th>
              <th className="px-6 py-4 font-medium">Loan Date</th>
              <th className="px-6 py-4 font-medium">Installment Amount</th>
              <th className="px-6 py-4 font-medium">Total Installments</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members?.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-background/50">
                <td className="px-6 py-4 font-medium text-text">{member.member_name}</td>
                <td className="px-6 py-4 text-text-secondary">{member.mobile_no}</td>
                <td className="px-6 py-4 text-text">₹{member.loan_amount}</td>
                <td className="px-6 py-4 text-text-secondary">{format(new Date(member.loan_date), 'dd MMM yyyy')}</td>
                <td className="px-6 py-4 text-text">₹{member.installment_amount}</td>
                <td className="px-6 py-4 text-text">{member.total_installments}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex min-w-[90px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                      member.status === 'Active'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : member.status === 'Closed'
                          ? 'border-slate-200 bg-slate-100 text-slate-700'
                          : member.status === 'Defaulted'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/members/${member.id}`}
                    className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand/80"
                  >
                    <Eye className="h-4 w-4" /> View
                  </Link>
                </td>
              </tr>
            ))}
            {(!members || members.length === 0) && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                  No members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        )}
      </div>
    </div>
  )
}
