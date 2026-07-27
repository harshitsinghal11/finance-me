'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/src/components/ui/Button'

export function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-brand mr-4 font-quicksand">Finance Me</Link>

      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          title="Logout"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline-block text-sm font-medium">Logout</span>
        </Button>
      </div>
    </header>
  )
}
