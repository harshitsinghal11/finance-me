'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, IndianRupee, Users, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import type { MemberInstallment, ProfitInstallment } from '@/src/helpers/financeMath'
import { getDailyCashInstallments, getMonthlyProfitInstallments } from '@/src/helpers/financeMath'

interface DashboardMetricsClientProps {
  activeMembersCount: string;
  totalOutstanding: number;
  cashCollectedToday: number;
  netProfitThisMonth: number;
  allInstallments: MemberInstallment[];
}

export function DashboardMetricsClient({
  activeMembersCount,
  totalOutstanding,
  cashCollectedToday,
  netProfitThisMonth,
  allInstallments
}: DashboardMetricsClientProps) {
  const [modalType, setModalType] = useState<'cash' | 'profit' | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalType(null)
      }
    }
    if (modalType) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalType])

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Prepare data for modals
  const dailyCashList = modalType === 'cash' ? getDailyCashInstallments(allInstallments, new Date()) : []
  const monthlyProfitList = modalType === 'profit' ? getMonthlyProfitInstallments(allInstallments, currentMonth, currentYear) : []

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Active Members */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm cursor-help">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Active Members</p>
              <p className="text-2xl font-bold text-text">{activeMembersCount}</p>
            </div>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm cursor-help">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Outstanding</p>
              <p className="text-2xl font-bold text-text">₹{Math.max(0, totalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Cash Collected Today (Interactive) */}
        <div
          onClick={() => setModalType('cash')}
          className="bg-surface rounded-lg border border-border p-6 shadow-sm hover:border-brand transition-colors cursor-pointer group"
          title="Click to view details"
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-text-secondary group-hover:text-brand transition-colors">Collected Today</p>
              <p className="text-2xl font-bold text-text">₹{cashCollectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Net Profit This Month (Interactive) */}
        <div
          onClick={() => setModalType('profit')}
          className="bg-surface rounded-lg border border-border p-6 shadow-sm hover:border-brand transition-colors cursor-pointer group"
          title="Click to view details"
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-text-secondary group-hover:text-brand transition-colors">Net Profit This Month</p>
              <p className="text-2xl font-bold text-text">₹{netProfitThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Collected Modal */}
      <AnimatePresence>
        {modalType === 'cash' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface w-full max-w-3xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-xl font-bold text-text flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  Cash Collected Today
                </h3>
                <button onClick={() => setModalType(null)} className="text-text-secondary hover:text-text transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background/80 text-text-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Member Name</th>
                        <th className="px-4 py-3 font-medium text-right">Amount Paid</th>
                        <th className="px-4 py-3 font-medium text-right">Penalty Paid</th>
                        <th className="px-4 py-3 font-medium text-right">Total Cash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dailyCashList.length > 0 ? dailyCashList.map((inst, idx) => {
                        const member = Array.isArray(inst.members) ? inst.members[0] : inst.members;
                        const paid = Number(inst.amount_paid || 0);
                        const penalty = Number(inst.penalty_amount || 0);
                        return (
                          <tr key={idx} className="hover:bg-background/50 transition-colors">
                            <td className="px-4 py-3 text-text-secondary">
                              {inst.received_date ? format(new Date(inst.received_date), 'HH:mm (dd MMM)') : '-'}
                            </td>
                            <td className="px-4 py-3 text-text font-medium">{member?.member_name || 'Unknown Member'}</td>
                            <td className="px-4 py-3 text-text text-right">₹{Math.max(0, paid - penalty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-text-secondary text-right">₹{penalty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-brand font-bold text-right">₹{paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                            No cash collected today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {dailyCashList.length > 0 && (
                      <tfoot className="bg-background/50 border-t border-border font-bold">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-right text-text">Total:</td>
                          <td className="px-4 py-3 text-brand text-right">₹{cashCollectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Net Profit Modal */}
      <AnimatePresence>
        {modalType === 'profit' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface w-full max-w-4xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-xl font-bold text-text flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Net Profit This Month
                </h3>
                <button onClick={() => setModalType(null)} className="text-text-secondary hover:text-text transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background/80 text-text-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Member Name</th>
                        <th className="px-4 py-3 font-medium text-right">Principal Covered</th>
                        <th className="px-4 py-3 font-medium text-right">Interest Profit</th>
                        <th className="px-4 py-3 font-medium text-right">Penalty Profit</th>
                        <th className="px-4 py-3 font-medium text-right text-purple-600">Total Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {monthlyProfitList.length > 0 ? monthlyProfitList.map((inst, idx) => {
                        const member = Array.isArray(inst.members) ? inst.members[0] : inst.members;
                        const paid = Number(inst.amount_paid || 0);
                        const penalty = Number(inst.penalty_amount || 0);
                        const profit = inst.calculatedProfit;
                        const basePayment = Math.max(0, paid - penalty);
                        const interestProfit = Math.max(0, profit - penalty);
                        const principalCovered = Math.max(0, basePayment - interestProfit);

                        return (
                          <tr key={idx} className="hover:bg-background/50 transition-colors">
                            <td className="px-4 py-3 text-text-secondary">
                              {inst.received_date ? format(new Date(inst.received_date), 'dd MMM yyyy') : '-'}
                            </td>
                            <td className="px-4 py-3 text-text font-medium">{member?.member_name || 'Unknown Member'}</td>
                            <td className="px-4 py-3 text-text-secondary text-right">₹{principalCovered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-text text-right">₹{interestProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-text text-right">₹{penalty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-purple-600 font-bold text-right">₹{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                            No profit generated this month yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {monthlyProfitList.length > 0 && (
                      <tfoot className="bg-background/50 border-t border-border font-bold">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-right text-text">Total Net Profit:</td>
                          <td className="px-4 py-3 text-purple-600 text-right">₹{netProfitThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
