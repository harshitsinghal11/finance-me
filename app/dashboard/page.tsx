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

  // Fetch Dashboard Metrics
  const { count: activeMembersCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('status', 'Active')
    .eq('is_deleted', false)

  const { data: activeMembers } = await supabase
    .from('members')
    .select('loan_amount')
    .eq('profile_id', user.id)
    .eq('status', 'Active')
    .eq('is_deleted', false)

  const totalActiveLoans = activeMembers?.reduce((sum, member) => sum + Number(member.loan_amount), 0) || 0

  const { count: pendingInstallmentsCount } = await supabase
    .from('member_installments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pending')
    .eq('is_deleted', false)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Dashboard</h1>
          <p className="mt-1 text-text-secondary">Welcome back, {profile.full_name}</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Link href="/members" className="text-text-secondary hover:text-brand font-medium transition-colors">View Members</Link>
          <Link
            href="/members/new"
            className="flex items-center gap-2 bg-button hover:bg-button-hover text-surface px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Member
          </Link>
        </div>

      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Active Members', value: activeMembersCount?.toString() || '0' },
          { label: 'Total Active Loans', value: `₹${totalActiveLoans.toLocaleString()}` },
          { label: 'Pending Installments', value: pendingInstallmentsCount?.toString() || '0' },
        ].map((metric) => (
          <div key={metric.label} className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4">
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
