'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, Phone, MapPin, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PersonalSummaryClientProps {
  member: {
    mobile_no: string;
    residence_address?: string | null;
    company_name?: string | null;
    company_address?: string | null;
    vehicle_details?: string | null;
    family_photo_url?: string | null;
  };
}

export function PersonalSummaryClient({ member }: PersonalSummaryClientProps) {
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

  const detailsList = (
    <dl className="space-y-4 text-sm w-full">
      <div className="grid grid-cols-3 gap-2">
        <dt className="text-text-secondary font-medium">Mobile No</dt>
        <dd className="col-span-2 text-text flex items-center gap-2"><Phone className="h-4 w-4" /> {member.mobile_no}</dd>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <dt className="text-text-secondary font-medium">Residence</dt>
        <dd className="col-span-2 text-text flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {member.residence_address || 'N/A'}</dd>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <dt className="text-text-secondary font-medium">Company</dt>
        <dd className="col-span-2 text-text">{member.company_name || 'N/A'}</dd>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <dt className="text-text-secondary font-medium">Company Addr</dt>
        <dd className="col-span-2 text-text">{member.company_address || 'N/A'}</dd>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <dt className="text-text-secondary font-medium">Vehicle</dt>
        <dd className="col-span-2 text-text">{member.vehicle_details || 'N/A'}</dd>
      </div>
    </dl>
  )

  return (
    <>
      <div className="bg-surface border border-border rounded-lg p-6 flex flex-col h-full">
        <h2 className="text-lg font-semibold text-brand mb-4 flex items-center gap-2 shrink-0">
          <User className="h-5 w-5" /> Personal Details
        </h2>

        <div className="flex-1 flex flex-col justify-center">
          {detailsList}
        </div>

        {member.family_photo_url && (
          <p className="mt-4 flex font-bold cursor-pointer justify-end text-sm text-brand" onClick={() => setIsModalOpen(true)}>
            View full personal details &rarr;
          </p>
        )}
      </div>

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
                  <User className="h-5 w-5 text-brand" />
                  Full Personal Details
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-secondary transition-colors hover:text-text">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {member.family_photo_url && (
                    <div className="shrink-0">
                      <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-md overflow-hidden border border-border shadow-sm">
                        <Image src={member.family_photo_url} alt="Family" fill sizes="(max-width: 640px) 256px, 320px" className="object-cover" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                      Contact & Details
                    </h4>
                    {detailsList}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
