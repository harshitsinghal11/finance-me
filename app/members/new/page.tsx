import { MemberForm } from '@/src/components/members/MemberForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewMemberPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/members" 
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
        <h1 className="text-3xl font-bold text-brand">Add New Member</h1>
        <p className="mt-1 text-text-secondary">Fill in all details to onboard a new member and generate their installments automatically.</p>
      </div>

      <MemberForm />
    </div>
  )
}
