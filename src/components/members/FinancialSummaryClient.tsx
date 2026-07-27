'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, X } from 'lucide-react'
import { format } from 'date-fns'

interface FinancialSummaryClientProps {
  member: any;
  totalExpected: number;
  totalPaid: number;
  totalPenalties: number;
  outstandingBalance: number;
}

export function FinancialSummaryClient({
  member,
  totalExpected,
  totalPaid,
  totalPenalties,
  outstandingBalance
}: FinancialSummaryClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      }
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  return (
    <>
      {/* General Card (Basic Info) */}
      <div
        className="bg-surface border border-border rounded-lg p-6 relative shadow-sm">
        <h2 className="text-lg font-semibold text-brand mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Financial Details
        </h2>

        <dl className="space-y-4 text-sm">
          <div className="grid grid-cols-3">
            <dt className="text-text-secondary font-medium">Loan Amount</dt>
            <dd className="col-span-2 text-text font-bold">₹{Number(member.loan_amount).toLocaleString()}</dd>
          </div>

          <div className="grid grid-cols-3">
            <dt className="text-text-secondary font-medium">Installment</dt>
            <dd className="col-span-2 text-text">₹{Number(member.installment_amount).toLocaleString()} ({member.installment_type})</dd>
          </div>

          <div className="grid grid-cols-3">
            <dt className="text-text-secondary font-medium">Total Paid</dt>
            <dd className="col-span-2 text-green-600 dark:text-green-700 font-medium">₹{totalPaid.toLocaleString()}</dd>
          </div>

          <div className="grid grid-cols-3 pt-3 border-t border-border">
            <dt className="text-text-secondary font-bold">Outstanding</dt>
            <dd className="col-span-2 text-red-600 dark:text-green-800 font-bold">₹{Math.max(0, outstandingBalance).toLocaleString()}</dd>
          </div>
        </dl>

        <p className="text-xs text-brand mt-4 flex justify-end cursor-pointer" onClick={() => setIsModalOpen(true)}>
          View full financial breakdown &rarr;
        </p>

        {/* Popup Modal (All Fields) */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                  <h3 className="text-xl font-bold text-text flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-brand" />
                    Comprehensive Financial Breakdown
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                    {/* Section 1: Core Loan */}
                    <div>
                      <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Core Loan Terms</h4>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Loan Amount</dt>
                          <dd className="text-text font-bold">₹{Number(member.loan_amount).toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Loan Date</dt>
                          <dd className="text-text">{member.loan_date ? format(new Date(member.loan_date), 'dd MMM yyyy') : 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Interest Type</dt>
                          <dd className="text-text">{member.interest_type || 'Flat'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Interest Rate</dt>
                          <dd className="text-text">{member.interest_rate}%</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">File Charge</dt>
                          <dd className="text-text">₹{Number(member.file_charge || 0).toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Benefit Amount</dt>
                          <dd className="text-text">₹{Number(member.benefit_amount || 0).toLocaleString()}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Section 2: Repayment Schedule */}
                    <div>
                      <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Repayment Schedule</h4>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Installment</dt>
                          <dd className="text-text">₹{Number(member.installment_amount).toLocaleString()} ({member.installment_type})</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Total Installments</dt>
                          <dd className="text-text">{member.total_installments}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Tenure</dt>
                          <dd className="text-text">
                            {member.tenure_years || 0} Years, {member.tenure_months || 0} Months
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Start Date</dt>
                          <dd className="text-text">{format(new Date(member.installment_start_date), 'dd MMM yyyy')}</dd>
                        </div>
                        {member.installment_end_date && (
                          <div className="flex justify-between">
                            <dt className="text-text-secondary">End Date</dt>
                            <dd className="text-text">{format(new Date(member.installment_end_date), 'dd MMM yyyy')}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Section 3: Balances */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Current Balances</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-background rounded p-3 text-center border border-border">
                        <p className="text-xs text-text-secondary mb-1">Total Expected</p>
                        <p className="text-sm font-bold text-text">₹{totalExpected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="bg-background rounded p-3 text-center border border-green-200 dark:border-green-900">
                        <p className="text-xs text-text-secondary mb-1">Total Paid</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-500">₹{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="bg-background rounded p-3 text-center border border-red-200 dark:border-red-900">
                        <p className="text-xs text-text-secondary mb-1">Total Penalties</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">₹{totalPenalties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="bg-red-600 dark:bg-red-700 rounded p-3 text-center border border-red-700 shadow-sm">
                        <p className="text-xs text-red-100 font-medium mb-1 uppercase tracking-wider">Outstanding</p>
                        <p className="text-lg font-bold text-white">₹{Math.max(0, outstandingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
