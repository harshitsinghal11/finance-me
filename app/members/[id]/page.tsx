import { createClient, getUser } from '@/src/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, MapPin, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { FamilySection } from '@/src/components/members/FamilySection'
import { InstallmentTable } from '@/src/components/members/InstallmentTable'
import { DeleteMemberButton } from '@/src/components/members/DeleteMemberButton'
import { MemberStatusBadge } from '@/src/components/members/MemberStatusBadge'
import { FinancialSummaryClient } from '@/src/components/members/FinancialSummaryClient'
import { PersonalSummaryClient } from '@/src/components/members/PersonalSummaryClient'
import { calculateTotalPaid, calculateTotalPenalties, calculateOutstandingBalance, calculateTotalRepayment } from '@/src/helpers/financeMath'

export default async function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) {
    redirect('/')
  }

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('profile_id', user.id)
    .single()

  if (!member || member.is_deleted) {
    notFound()
  }

  const { data: installments } = await supabase
    .from('member_installments')
    .select('*')
    .eq('member_id', member.id)
    .eq('is_deleted', false)
    .order('installment_no', { ascending: true })

  const totalPaid = calculateTotalPaid(installments || [])
  const totalPenalties = calculateTotalPenalties(installments || [])
  const totalExpected = calculateTotalRepayment(
    member.loan_amount,
    member.interest_rate,
    member.interest_type,
    member.installment_type,
    member.total_installments
  )
  const outstandingBalance = calculateOutstandingBalance(totalExpected, totalPaid, totalPenalties)

  const { data: family } = await supabase
    .from('member_family')
    .select('*')
    .eq('member_id', member.id)
    .eq('is_deleted', false)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">{member.member_name}</h1>
            <MemberStatusBadge id={member.id} currentStatus={member.status} />
          </div>
          <div className="flex gap-3">
            <Link href={`/members/${member.id}/edit`} className="px-4 py-2 border border-border rounded-md text-text font-medium ">
              Edit Member
            </Link>
            <DeleteMemberButton id={member.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Personal Info Card */}
        <PersonalSummaryClient member={member} />

        {/* Financial Info Card */}
        <FinancialSummaryClient
          member={member}
          totalExpected={totalExpected}
          totalPaid={totalPaid}
          totalPenalties={totalPenalties}
          outstandingBalance={outstandingBalance}

        />
      </div>

      <FamilySection memberId={member.id} initialFamily={family || []} />

      <InstallmentTable memberId={member.id} initialInstallments={installments || []} />
    </div>
  )
}
