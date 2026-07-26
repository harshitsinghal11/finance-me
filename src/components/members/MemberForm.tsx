'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { memberSchema, type MemberFormValues } from './schema'
import { createClient } from '@/src/lib/supabase/client'
import { uploadFinanceDocument } from '@/src/lib/storage'
import { generateInstallments } from '@/src/utils/installments'

export function MemberForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof memberSchema>, any, MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      total_family_members: 0,
      file_charge: 0,
      benefit_amount: 0,
      installment_type: 'Daily',
      total_installments: 100,
      aadhar_available: false,
      pan_available: false,
      family_id_available: false,
      original_signed_cheques: 0,
      loan_agreement_available: false,
      promissory_note_available: false,
      loan_transaction_proof: false,
      rc_or_gold_photos: false,
    }
  })

  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert member
      const memberData = {
        profile_id: user.id,
        member_name: data.member_name,
        mobile_no: data.mobile_no,
        residence_address: data.residence_address,
        permanent_address: data.permanent_address,
        company_name: data.company_name,
        company_address: data.company_address,
        vehicle_details: data.vehicle_details,
        total_family_members: data.total_family_members,

        loan_amount: data.loan_amount,
        loan_date: data.loan_date,
        file_charge: data.file_charge,
        benefit_amount: data.benefit_amount,
        installment_amount: data.installment_amount,
        installment_type: data.installment_type,
        total_installments: data.total_installments,
        installment_start_date: data.installment_start_date,

        guarantor_name: data.guarantor_name,
        guarantor_mobile: data.guarantor_mobile,

        aadhar_available: data.aadhar_available,
        pan_available: data.pan_available,
        family_id_available: data.family_id_available,
        original_signed_cheques: data.original_signed_cheques,
        whatsapp_mobile: data.whatsapp_mobile,
        loan_agreement_available: data.loan_agreement_available,
        promissory_note_available: data.promissory_note_available,
        email: data.email,
        email_password: data.email_password,
        loan_transaction_proof: data.loan_transaction_proof,
        rc_or_gold_photos: data.rc_or_gold_photos,
        remarks: data.remarks,
      }

      const { data: member, error: insertError } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single()

      if (insertError) throw insertError

      // Handle Files
      const updateData: any = {}
      if (data.family_photo?.[0]) {
        updateData.family_photo_url = await uploadFinanceDocument(data.family_photo[0], member.id, 'family_photo')
      }
      if (data.member_signature?.[0]) {
        updateData.member_signature_url = await uploadFinanceDocument(data.member_signature[0], member.id, 'member_signature')
      }
      if (data.guarantor_signature?.[0]) {
        updateData.guarantor_signature_url = await uploadFinanceDocument(data.guarantor_signature[0], member.id, 'guarantor_signature')
      }

      if (Object.keys(updateData).length > 0) {
        await supabase.from('members').update(updateData).eq('id', member.id)
      }

      // Generate Installments
      const installmentsToInsert = generateInstallments(
        data.installment_start_date,
        data.total_installments,
        data.installment_type,
        data.installment_amount
      ).map(inst => ({
        member_id: member.id,
        installment_no: inst.installment_no,
        due_date: inst.due_date,
        installment_amount: inst.installment_amount,
      }))

      const { error: instError } = await supabase
        .from('member_installments')
        .insert(installmentsToInsert)

      if (instError) throw instError

      router.push('/dashboard/members')

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred while saving the member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const InputField = ({ label, name, type = 'text' }: { label: string, name: keyof MemberFormValues, type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-text mb-1">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</p>}
    </div>
  )

  const CheckboxField = ({ label, name }: { label: string, name: keyof MemberFormValues }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...register(name)}
        className="rounded border-border text-brand focus:ring-brand"
      />
      <span className="text-sm font-medium text-text">{label}</span>
    </label>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md">
          {errorMsg}
        </div>
      )}

      {/* Personal Details */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Member Name *" name="member_name" />
          <InputField label="Mobile Number *" name="mobile_no" />
          <InputField label="Residence Address" name="residence_address" />
          <InputField label="Permanent Address" name="permanent_address" />
          <InputField label="Total Family Members" name="total_family_members" type="number" />
        </div>
      </div>

      {/* Financial Details */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Loan Amount *" name="loan_amount" type="number" />
          <InputField label="Loan Date *" name="loan_date" type="date" />
          <InputField label="File Charge" name="file_charge" type="number" />

          <InputField label="Benefit Amount" name="benefit_amount" type="number" />
          <InputField label="Installment Amount *" name="installment_amount" type="number" />

          <div>
            <label className="block text-sm font-medium text-text mb-1">Installment Type *</label>
            <select
              {...register('installment_type')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <InputField label="Total Installments *" name="total_installments" type="number" />
          <InputField label="Installment Start Date *" name="installment_start_date" type="date" />
        </div>
      </div>

      {/* Guarantor Details */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Guarantor Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Guarantor Name" name="guarantor_name" />
          <InputField label="Guarantor Mobile" name="guarantor_mobile" />
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Documents & Checklist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <CheckboxField label="Aadhar Available" name="aadhar_available" />
          <CheckboxField label="PAN Available" name="pan_available" />
          <CheckboxField label="Family ID Available" name="family_id_available" />
          <CheckboxField label="Loan Agreement Available" name="loan_agreement_available" />
          <CheckboxField label="Promissory Note Available" name="promissory_note_available" />
          <CheckboxField label="Loan Transaction Proof" name="loan_transaction_proof" />
          <CheckboxField label="RC / Gold Photos" name="rc_or_gold_photos" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Original Signed Cheques (Count)" name="original_signed_cheques" type="number" />
          <InputField label="Email Address" name="email" type="email" />
        </div>
      </div>

      {/* File Uploads */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Upload Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Family Photo</label>
            <input type="file" accept="image/*" {...register('family_photo')} className="w-full text-sm text-text-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Member Signature</label>
            <input type="file" accept="image/*" {...register('member_signature')} className="w-full text-sm text-text-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Guarantor Signature</label>
            <input type="file" accept="image/*" {...register('guarantor_signature')} className="w-full text-sm text-text-secondary" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-border rounded-md text-text hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-button text-surface font-medium rounded-md hover:bg-button-hover disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Member'}
        </button>
      </div>
    </form>
  )
}
