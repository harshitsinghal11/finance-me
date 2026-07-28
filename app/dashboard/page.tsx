import { createClient, getUser } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  calculateTotalPaid,
  calculateTotalActiveLoans,
  calculateMonthlyNetProfit,
  calculateDailyCashCollected
} from '@/src/helpers/financeMath'
import { AnimatedPage } from '@/src/components/ui/AnimatedPage'
import { SearchBar } from '@/src/components/ui/SearchBar'
import { MembersTable } from '@/src/components/members/MembersTable'
import { DueTodayWidget } from '@/src/components/dashboard/DueTodayWidget'
import { RecentMembersWidget } from '@/src/components/dashboard/RecentMembersWidget'
import { DashboardMetricsClient } from '@/src/components/dashboard/DashboardMetricsClient'
import { Plus, UsersRound } from 'lucide-react'
import type { ActiveMember } from '@/src/helpers/financeMath'

interface DashboardMemberRecord extends ActiveMember {
  id: string
  member_name: string
  mobile_no: string
  loan_date: string
  installment_amount: number | string
  total_installments: number
  status: 'Active' | 'Closed' | 'Defaulted'
  created_at?: string
}

export default async function DashboardPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const query = typeof searchParams?.query === 'string' ? searchParams.query : ''
  const status = typeof searchParams?.status === 'string' ? searchParams.status : ''
  const sort = typeof searchParams?.sort === 'string' ? searchParams.sort : ''

  const supabase = await createClient()
  const { data: { user } } = await getUser()

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

  // Run independent dashboard queries in parallel
  const [
    { count: activeMembersCount },
    { data: activeMembers },
    { data: installments }
  ] = await Promise.all([
    supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .eq('status', 'Active')
      .eq('is_deleted', false),

    supabase
      .from('members')
      .select('loan_amount, interest_rate, interest_type, installment_type, total_installments')
      .eq('profile_id', user.id)
      .eq('status', 'Active')
      .eq('is_deleted', false),

    supabase
      .from('member_installments')
      .select('amount_paid, penalty_amount, received_date, members!inner(member_name, profile_id, status, is_deleted, loan_amount, interest_rate, interest_type, installment_type, total_installments)')
      .eq('members.profile_id', user.id)
      .eq('members.status', 'Active')
      .eq('members.is_deleted', false)
      .eq('is_deleted', false)
  ])

  const totalActiveLoans = calculateTotalActiveLoans(activeMembers || [])
  const totalPaid = calculateTotalPaid(installments || [])
  const totalOutstanding = totalActiveLoans - totalPaid

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const netProfitThisMonth = calculateMonthlyNetProfit(installments || [], currentMonth, currentYear)
  const cashCollectedToday = calculateDailyCashCollected(installments || [], new Date())

  // Fetch search results if any filters/queries are active
  const isSearching = query !== '' || status !== '' || sort !== ''
  let searchResults: DashboardMemberRecord[] = []

  if (isSearching) {
    let supaQuery = supabase
      .from('members')
      .select('*')
      .eq('profile_id', user.id)
      .eq('is_deleted', false)

    if (query) {
      supaQuery = supaQuery.or(`member_name.ilike.%${query}%,mobile_no.ilike.%${query}%`)
    }

    if (status && status !== 'All') {
      supaQuery = supaQuery.eq('status', status)
    }

    if (sort === 'amount_desc') {
      supaQuery = supaQuery.order('loan_amount', { ascending: false })
    } else if (sort === 'amount_asc') {
      supaQuery = supaQuery.order('loan_amount', { ascending: true })
    } else {
      supaQuery = supaQuery.order('created_at', { ascending: false })
    }

    // Only fetch first 10 for dashboard preview
    supaQuery = supaQuery.range(0, 9)

    const { data: searchedMembers } = await supaQuery
    searchResults = searchedMembers || []
  }

  return (
    <AnimatedPage className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Dashboard</h1>
          <p className="mt-1 text-text-secondary">Welcome back, {profile.full_name}</p>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Link href="/members"
            className="flex items-center gap-2 bg-button hover:bg-button-hover text-surface px-4 py-2 rounded-md font-medium transition-colors">
            <UsersRound className="h-5 w-5" />
            View Members
          </Link>
          <Link
            href="/members/new"
            className="flex items-center gap-2 bg-button hover:bg-button-hover text-surface px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Member
          </Link>
        </div>
      </div>

      {/* Quick Actions / Search Bar */}
      <SearchBar />

      {/* Metrics Row */}
      <DashboardMetricsClient
        activeMembersCount={activeMembersCount?.toString() || '0'}
        totalOutstanding={totalOutstanding}
        cashCollectedToday={cashCollectedToday}
        netProfitThisMonth={netProfitThisMonth}
        allInstallments={installments || []}
      />

      {isSearching && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text mb-4">Search Results</h2>
          <MembersTable members={searchResults} totalPages={1} currentPage={1} />
        </div>
      )}

      {!isSearching && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="h-full">
            <DueTodayWidget />
          </div>
          <div className="h-full">
            <RecentMembersWidget />
          </div>
        </div>
      )}

    </AnimatedPage>
  )
}
