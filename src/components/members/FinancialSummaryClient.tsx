'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, X } from 'lucide-react'
import { format } from 'date-fns'

interface FinancialSummaryClientProps {
  member: {
    loan_amount: number | string;
    installment_amount: number | string;
    installment_type: string;
    loan_date?: string | null;
    interest_type?: string | null;
    interest_rate?: number | string | null;
    file_charge?: number | string | null;
    benefit_amount?: number | string | null;
    total_installments: number;
    tenure_years?: number | string | null;
    tenure_months?: number | string | null;
    installment_start_date: string;
    installment_end_date?: string | null;
    member_signature_url?: string | null;
    guarantor_signature_url?: string | null;
  };
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
      <div className="relative rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-brand">
          <CreditCard className="h-5 w-5" /> Financial Details
        </h2>

        <dl className="space-y-4 text-sm">
          <div className="grid grid-cols-3">
            <dt className="font-medium text-text-secondary">Loan Amount</dt>
            <dd className="col-span-2 font-bold text-text">₹{Number(member.loan_amount).toLocaleString('en-IN')}</dd>
          </div>

          <div className="grid grid-cols-3">
            <dt className="font-medium text-text-secondary">Installment</dt>
            <dd className="col-span-2 text-text">
              ₹{Number(member.installment_amount).toLocaleString('en-IN')} ({member.installment_type})
            </dd>
          </div>

          <div className="grid grid-cols-3">
            <dt className="font-medium text-text-secondary">Total Paid</dt>
            <dd className="col-span-2 font-medium text-green-600 dark:text-green-700">
              ₹{totalPaid.toLocaleString('en-IN')}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="font-medium text-text-secondary">Total Penalties</dt>
            <dd className="col-span-2 font-medium text-red-600 dark:text-red-400">
              ₹{totalPenalties.toLocaleString('en-IN')}
            </dd>
          </div>


          <div className="grid grid-cols-3 border-t border-border pt-3">
            <dt className="font-bold text-text-secondary">Outstanding</dt>
            <dd className="col-span-2 font-bold text-red-600 dark:text-green-800">
              ₹{Math.max(0, outstandingBalance).toLocaleString('en-IN')}
            </dd>
          </div>
        </dl>



        <p className="mt-4 flex font-bold cursor-pointer justify-end text-sm text-brand" onClick={() => setIsModalOpen(true)}>
          View full financial breakdown &rarr;
        </p>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-surface shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-border bg-background/50 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-text">
                    <CreditCard className="h-5 w-5 text-brand" />
                    Comprehensive Financial Breakdown
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-secondary transition-colors hover:text-text">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="overflow-y-auto p-6">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                        Core Loan Terms
                      </h4>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Loan Amount</dt>
                          <dd className="font-bold text-text">₹{Number(member.loan_amount).toLocaleString('en-IN')}</dd>
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
                          <dd className="text-text">₹{Number(member.file_charge || 0).toLocaleString('en-IN')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Benefit Amount</dt>
                          <dd className="text-text">₹{Number(member.benefit_amount || 0).toLocaleString('en-IN')}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                        Repayment Schedule
                      </h4>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-text-secondary">Installment</dt>
                          <dd className="text-text">
                            ₹{Number(member.installment_amount).toLocaleString('en-IN')} ({member.installment_type})
                          </dd>
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
                  {(member.member_signature_url || member.guarantor_signature_url) && (
                    <div className="pt-6">
                      <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                        Signatures
                      </h4>
                      <div className="flex flex-wrap gap-6">
                        {member.member_signature_url && (
                          <div>
                            <p className="text-xs font-medium text-text-secondary mb-2">Member Signature</p>
                            <div className="relative h-24 w-48 rounded-md border border-border bg-background overflow-hidden">
                              <img src={member.member_signature_url} alt="Member Signature" className="object-contain w-full h-full" />
                            </div>
                          </div>
                        )}
                        {member.guarantor_signature_url && (
                          <div>
                            <p className="text-xs font-medium text-text-secondary mb-2">Guarantor Signature</p>
                            <div className="relative h-24 w-48 rounded-md border border-border bg-background overflow-hidden">
                              <img src={member.guarantor_signature_url} alt="Guarantor Signature" className="object-contain w-full h-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-6">
                    <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                      Current Balances
                    </h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded border border-border bg-background p-3 text-center">
                        <p className="mb-1 text-xs text-text-secondary">Total Expected</p>
                        <p className="text-sm font-bold text-text">
                          ₹{totalExpected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="rounded border border-green-200 bg-background p-3 text-center dark:border-green-900">
                        <p className="mb-1 text-xs text-text-secondary">Total Paid</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-500">
                          ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      {totalPenalties >= 0 && (
                        <div className="rounded border border-red-200 bg-background p-3 text-center dark:border-red-900">
                          <p className="mb-1 text-xs text-text-secondary">Total Penalties</p>
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">
                            ₹{totalPenalties.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      )}


                      <div className="rounded border border-red-700 bg-red-600 p-3 text-center shadow-sm dark:bg-red-700">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-red-100">Outstanding</p>
                        <p className="text-lg font-bold text-white">
                          ₹{Math.max(0, outstandingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
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
