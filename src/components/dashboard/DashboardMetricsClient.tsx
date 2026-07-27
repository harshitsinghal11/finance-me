'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import type { MemberInstallment } from '@/src/helpers/financeMath'
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
  const dailyCashList = modalType === 'cash' ? getDailyCashInstallments(allInstallments, new Date()) : []
  const monthlyProfitList = modalType === 'profit' ? getMonthlyProfitInstallments(allInstallments, currentMonth, currentYear) : []

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Active Members</p>
          <p className="text-2xl font-bold text-text">{activeMembersCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Total Outstanding</p>
          <p className="text-2xl font-bold text-text">
            ₹{Math.max(0, totalOutstanding).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div
          onClick={() => setModalType('cash')}
          className="select-none group cursor-pointer rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors hover:border-brand"
          title="Click to view details"
        >
          <p className="text-sm font-medium text-text-secondary transition-colors group-hover:text-brand">Collected Today</p>
          <p className="text-2xl font-bold text-text">
            ₹{cashCollectedToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div
          onClick={() => setModalType('profit')}
          className="select-none  group cursor-pointer rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors hover:border-brand"
          title="Click to view details"
        >
          <p className="text-sm font-medium text-text-secondary transition-colors group-hover:text-brand flex-nowrap">Net Profit This Month</p>
          <p className="text-2xl font-bold text-text">
            ₹{netProfitThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      {/* Cash Model */}
      <AnimatePresence>
        {modalType === 'cash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-surface shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border bg-background/50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-xl font-bold text-text">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  Cash Collected Today
                </h3>
                <button onClick={() => setModalType(null)} className="text-text-secondary transition-colors hover:text-text">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background/80 text-text-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Member Name</th>
                        <th className="px-4 py-3 text-right font-medium">Amount Paid</th>
                        <th className="px-4 py-3 text-right font-medium">Penalty Paid</th>
                        <th className="px-4 py-3 text-right font-medium">Total Cash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dailyCashList.length > 0 ? dailyCashList.map((inst, idx) => {
                        const member = Array.isArray(inst.members) ? inst.members[0] : inst.members
                        const paid = Number(inst.amount_paid || 0)
                        const penalty = Number(inst.penalty_amount || 0)

                        return (
                          <tr key={idx} className="transition-colors hover:bg-background/50">
                            <td className="px-4 py-3 text-text-secondary">
                              {inst.received_date ? format(new Date(inst.received_date), 'HH:mm (dd MMM)') : '-'}
                            </td>
                            <td className="px-4 py-3 font-medium text-text">{member?.member_name || 'Unknown Member'}</td>
                            <td className="px-4 py-3 text-right text-text">
                              ₹{Math.max(0, paid - penalty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right text-text-secondary">
                              ₹{penalty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-brand">
                              ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
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
                      <tfoot className="border-t border-border bg-background/50 font-bold">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-right text-text">Total:</td>
                          <td className="px-4 py-3 text-right text-brand">
                            ₹{cashCollectedToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
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

      {/* Net Profit Model */}
      <AnimatePresence>
        {modalType === 'profit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-surface shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border bg-background/50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-xl font-bold text-text">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Net Profit This Month
                </h3>
                <button onClick={() => setModalType(null)} className="text-text-secondary transition-colors hover:text-text">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background/80 text-text-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Member Name</th>
                        <th className="px-4 py-3 text-right font-medium">Principal Covered</th>
                        <th className="px-4 py-3 text-right font-medium">Interest Profit</th>
                        <th className="px-4 py-3 text-right font-medium">Penalty Profit</th>
                        <th className="px-4 py-3 text-right font-medium ">Total Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {monthlyProfitList.length > 0 ? monthlyProfitList.map((inst, idx) => {
                        const member = Array.isArray(inst.members) ? inst.members[0] : inst.members
                        const paid = Number(inst.amount_paid || 0)
                        const penalty = Number(inst.penalty_amount || 0)
                        const profit = inst.calculatedProfit
                        const basePayment = Math.max(0, paid - penalty)
                        const interestProfit = Math.max(0, profit - penalty)
                        const principalCovered = Math.max(0, basePayment - interestProfit)

                        return (
                          <tr key={idx} className="transition-colors hover:bg-background/50">
                            <td className="px-4 py-3 text-text-secondary">
                              {inst.received_date ? format(new Date(inst.received_date), 'dd MMM yyyy') : '-'}
                            </td>
                            <td className="px-4 py-3 font-medium text-text">{member?.member_name || 'Unknown Member'}</td>
                            <td className="px-4 py-3 text-right text-text-secondary">
                              ₹{principalCovered.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right text-text">
                              ₹{interestProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right text-text">
                              ₹{penalty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-purple-600">
                              ₹{profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
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
                      <tfoot className="border-t border-border bg-background/50 font-bold">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-right text-text">Total Net Profit:</td>
                          <td className="px-4 py-3 text-right text-purple-600">
                            ₹{netProfitThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
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
