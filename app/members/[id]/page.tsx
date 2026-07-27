import { createClient } from '@/src/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, Clock, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'
import { FamilySection } from '@/src/components/members/FamilySection'
import { InstallmentTable } from '@/src/components/members/InstallmentTable'
import { DeleteMemberButton } from '@/src/components/members/DeleteMemberButton'
import { MemberStatusBadge } from '@/src/components/members/MemberStatusBadge'
import { FinancialSummaryClient } from '@/src/components/members/FinancialSummaryClient'
import { calculateTotalPaid, calculateTotalPenalties, calculateOutstandingBalance, calculateTotalRepayment } from '@/src/helpers/financeMath'

export default async function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', resolvedParams.id)
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
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-brand mb-4 flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Details
          </h2>
          <dl className="space-y-4 text-sm">

            <div className="grid grid-cols-3">
              <dt className="text-text-secondary font-medium">Mobile No</dt>
              <dd className="col-span-2 text-text flex items-center gap-2"><Phone className="h-4 w-4" /> {member.mobile_no}</dd>
            </div>

            <div className="grid grid-cols-3">
              <dt className="text-text-secondary font-medium">Residence Address</dt>
              <dd className="col-span-2 text-text flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {member.residence_address || 'N/A'}</dd>
            </div>

            <div className="grid grid-cols-3">
              <dt className="text-text-secondary font-medium">Company</dt>
              <dd className="col-span-2 text-text">{member.company_name || 'N/A'}</dd>
            </div>

            <div className="grid grid-cols-3">
              <dt className="text-text-secondary font-medium">Company Address</dt>
              <dd className="col-span-2 text-text">{member.company_address || 'N/A'}</dd>
            </div>

            <div className="grid grid-cols-3">
              <dt className="text-text-secondary font-medium">Vehicle Details</dt>
              <dd className="col-span-2 text-text">{member.vehicle_details || 'N/A'}</dd>
            </div>

          </dl>

          {member.family_photo_url && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Family Photo</p>
              <div className="relative h-32 w-32 rounded-md overflow-hidden border border-border">
                <Image src={member.family_photo_url} alt="Family" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>

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
