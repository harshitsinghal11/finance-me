import { createClient } from '@/src/lib/supabase/server'
import Link from 'next/link'
import { Plus, House } from 'lucide-react'
import { redirect } from 'next/navigation'
import { SearchBar } from '@/src/components/ui/SearchBar'
import { MembersTable } from '@/src/components/members/MembersTable'
import { AnimatedPage } from '@/src/components/ui/AnimatedPage'

export default async function MembersPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const status = searchParams?.status || '';
  const sort = searchParams?.sort || '';
  const itemsPerPage = 10;

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  let supaQuery = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .eq('profile_id', user.id)
    .eq('is_deleted', false)
    .range(from, to)

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

  const { data: members, count } = await supaQuery
  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  return (
    <AnimatedPage className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand">Member Details</h1>
          <p className="mt-1 text-text-secondary">Manage all your active loan members.</p>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Link href="/dashboard"
            className="flex items-center gap-2 bg-button hover:bg-button-hover text-surface px-4 py-2 rounded-md font-medium transition-colors">
            <House className="h-5 w-5" />
            Dashboard
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

      <SearchBar placeholder="Search members by name or mobile..." />

      <MembersTable members={members || []} totalPages={totalPages} currentPage={currentPage} />
    </AnimatedPage>
  )
}
