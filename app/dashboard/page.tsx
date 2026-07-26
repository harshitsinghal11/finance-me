import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, CreditCard, Wallet, Plus, Search, Filter } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/setup')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Dashboard</h1>
          <p className="mt-1 text-text-secondary">Welcome back, {profile.full_name}</p>
        </div>
        
        <Link 
          href="/dashboard/members/new"
          className="flex items-center gap-2 bg-button hover:bg-button-hover text-surface px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Member
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Active Members', value: '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Active Loans', value: '₹0.00', icon: CreditCard, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'Pending Installments', value: '0', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((metric) => (
          <div key={metric.label} className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-md ${metric.bg}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
                <p className="text-2xl font-bold text-text">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Search Bar */}
      <div className="bg-surface rounded-lg border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search members by name or mobile..." 
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md text-text hover:bg-background transition-colors">
            <Filter className="h-5 w-5" />
            Filter
          </button>
        </div>
      </div>
    </div>
  )
}
