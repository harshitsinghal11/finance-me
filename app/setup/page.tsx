'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetupProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name)
      }
    }
    fetchUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url
    })

    if (!error) {
      router.push('/dashboard')
    } else {
      console.error('Error creating profile:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-[family-name:var(--font-quicksand)]">
      <div className="w-full max-w-md rounded-2xl bg-surface p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border transition-all">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="h-14 w-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">Complete Your Profile</h1>
          <p className="text-sm font-medium text-text-secondary">
            Please confirm your details to continue to the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Full Name</label>
            <input 
              type="text" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors font-medium shadow-sm"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !fullName}
            className="w-full group flex items-center justify-center gap-3 bg-brand border border-brand text-white hover:bg-brand/90 transition-all duration-200 h-12 rounded-xl font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Save and Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
