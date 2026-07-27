import { createClient } from '@/src/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MemberForm } from '@/src/components/members/MemberForm'

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: member } = await supabase
    .from('members')
    .select(`
      *,
      member_family (*)
    `)
    .eq('id', resolvedParams.id)
    .eq('profile_id', user.id)
    .single()

  if (!member || member.is_deleted) {
    notFound()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand">Edit Member</h1>
        <p className="mt-1 text-text-secondary">Update details for {member.member_name}</p>
      </div>

      <MemberForm initialData={member} />
    </div>
  )
}
