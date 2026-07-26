'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, LogOut } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 text-text-secondary hover:bg-brand/10 hover:text-brand transition-colors"
          title="Toggle theme"
        >
          {mounted && (
            theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="h-6 w-px bg-border" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline-block text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  )
}
