'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, Loader2 } from 'lucide-react'

type Status = 'Active' | 'Closed' | 'Defaulted'

export function MemberStatusBadge({ id, currentStatus }: { id: string, currentStatus: Status }) {
  const [status, setStatus] = useState<Status>(currentStatus)
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (newStatus: Status) => {
    setIsOpen(false)
    if (newStatus === status) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setStatus(newStatus)
      toast.success(`Member marked as ${newStatus}`)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (s: Status) => {
    switch (s) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200'

      case 'Closed':
        return 'bg-slate-100 text-slate-700 border border-slate-200'

      case 'Defaulted':
        return 'bg-rose-100 text-rose-800 border border-rose-200'

      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const getStatusIcon = (s: Status, className: string = "h-4 w-4") => {
    switch (s) {
      case 'Active': return <CheckCircle2 className={className} />
      case 'Closed': return <CheckCircle2 className={className} />
      case 'Defaulted': return <AlertCircle className={className} />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all hover:opacity-80 shadow-sm disabled:opacity-50 ${getStatusColor(status)}`}
      >
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : getStatusIcon(status)}
        {status}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-40 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="p-1 space-y-1">
                {(['Active', 'Closed', 'Defaulted'] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdate(s)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${s === status ? 'bg-surface border border-border shadow-sm font-medium text-brand' : 'text-text-secondary hover:bg-background hover:text-text'}`}
                  >
                    {getStatusIcon(s)} {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
