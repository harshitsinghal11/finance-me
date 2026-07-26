'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/src/components/ui/Button'
import { memberSchema, type MemberFormValues } from './schema'
import { createClient } from '@/src/lib/supabase/client'
import { uploadFinanceDocument } from '@/src/lib/storage'
import { generateInstallments } from '@/src/utils/installments'

export function MemberForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<z.input<typeof memberSchema>, any, MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      member_name: initialData?.member_name || '',
      mobile_no: initialData?.mobile_no || '',
      residence_address: initialData?.residence_address || '',
      permanent_address: initialData?.permanent_address || '',
      company_name: initialData?.company_name || '',
      company_address: initialData?.company_address || '',
      vehicle_details: initialData?.vehicle_details || '',
      loan_amount: initialData?.loan_amount || '',
      loan_date: initialData?.loan_date || '',
      installment_amount: initialData?.installment_amount || '',
      installment_start_date: initialData?.installment_start_date || '',
      installment_end_date: initialData?.installment_end_date || '',
      guarantor_name: initialData?.guarantor_name || '',
      guarantor_mobile: initialData?.guarantor_mobile || '',
      whatsapp_mobile: initialData?.whatsapp_mobile || '',
      email: initialData?.email || '',
      email_password: initialData?.email_password || '',
      remarks: initialData?.remarks || '',
      total_family_members: initialData?.total_family_members || 0,
      file_charge: initialData?.file_charge || 0,
      interest_rate: initialData?.interest_rate || 0,
      interest_type: initialData?.interest_type || 'Flat',
      benefit_amount: initialData?.benefit_amount || 0,
      installment_type: initialData?.installment_type || 'Daily',
      total_installments: initialData?.total_installments || 100,
      aadhar_available: initialData?.aadhar_available || false,
      pan_available: initialData?.pan_available || false,
      family_id_available: initialData?.family_id_available || false,
      original_signed_cheques: initialData?.original_signed_cheques || 0,
      loan_agreement_available: initialData?.loan_agreement_available || false,
      promissory_note_available: initialData?.promissory_note_available || false,
      rc_or_gold_photos: initialData?.rc_or_gold_photos || false,
      family_members: initialData?.member_family?.filter((f: any) => !f.is_deleted) || [],
    }
  })

  const { fields: familyFields, append: appendFamily, remove: removeFamily } = useFieldArray({
    control,
    name: 'family_members'
  })

  const watchLoanAmount = watch('loan_amount')
  const watchInterestRate = watch('interest_rate')
  const watchInstallmentAmount = watch('installment_amount')

  useEffect(() => {
    const loan = Number(watchLoanAmount) || 0
    const rate = Number(watchInterestRate) || 0
    const instAmt = Number(watchInstallmentAmount) || 0

    if (loan > 0 && instAmt > 0) {
      const totalRepayment = loan + (loan * (rate / 100))
      const totalInst = Math.ceil(totalRepayment / instAmt)
      setValue('total_installments', totalInst, { shouldValidate: true })
    }
  }, [watchLoanAmount, watchInterestRate, watchInstallmentAmount, setValue])

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
        interest_type: data.interest_type,
        interest_rate: data.interest_rate,
        file_charge: data.file_charge,
        benefit_amount: data.benefit_amount,
        installment_amount: data.installment_amount,
        installment_type: data.installment_type,
        total_installments: data.total_installments,
        installment_start_date: data.installment_start_date,
        installment_end_date: data.installment_end_date || null,

        guarantor_name: data.guarantor_name,
        guarantor_mobile: data.guarantor_mobile,

        aadhar_available: data.aadhar_available,
        pan_available: data.pan_available,
        family_id_available: data.family_id_available,
        original_signed_cheques: data.original_signed_cheques,
        whatsapp_mobile: data.whatsapp_mobile,
        loan_agreement_available: data.loan_agreement_available,
        promissory_note_available: data.promissory_note_available,
        email: data.email || null,
        email_password: data.email_password,
        loan_transaction_proof: data.loan_transaction_proof,
        rc_or_gold_photos: data.rc_or_gold_photos,
        remarks: data.remarks,
      }

      let member: any;

      if (initialData?.id) {
        // Update
        const { error: updateError } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', initialData.id)

        if (updateError) throw updateError
        member = { id: initialData.id, ...memberData }
      } else {
        // Insert
        const { data, error: insertError } = await supabase
          .from('members')
          .insert(memberData)
          .select()
          .single()

        if (insertError) throw insertError
        member = data
      }

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

      // Generate Installments only if it's a new member
      if (!initialData?.id) {
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
      }

      // Sync family members for both new and existing members
      if (initialData?.id) {
        // Delete existing active family members
        await supabase.from('member_family').delete().eq('member_id', initialData.id)
      }

      if (data.family_members && data.family_members.length > 0) {
        const familyDataToInsert = data.family_members.map(fm => ({
          member_id: member.id,
          name: fm.name,
          relation: fm.relation,
          profession: fm.profession,
          income: fm.income,
          mobile_no: fm.mobile_no,
        }))
        const { error: familyError } = await supabase.from('member_family').insert(familyDataToInsert)
        if (familyError) throw familyError
      }

      router.push('/members')

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred while saving the member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const InputField = ({ label, name, type = 'text', readOnly = false }: { label: string, name: keyof MemberFormValues, type?: string, readOnly?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-text mb-1">{label}</label>
      <input
        type={type}
        readOnly={readOnly}
        {...register(name)}
        className={`w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${readOnly ? 'opacity-75 cursor-not-allowed bg-surface-hover' : ''}`}
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
          <InputField label="Company Name" name="company_name" />
          <InputField label="Company Address" name="company_address" />
          <InputField label="Vehicle Details" name="vehicle_details" />
          <InputField label="Total Family Members" name="total_family_members" type="number" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">Family Members</h2>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => appendFamily({ name: '', relation: '', profession: '', income: 0, mobile_no: '' })}
          >
            <Plus className="h-4 w-4" /> Add Family Member
          </Button>
        </div>
          
          {familyFields.length === 0 ? (
            <p className="text-sm text-text-secondary py-2">No family members added yet.</p>
          ) : (
            <div className="space-y-4">
              {familyFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-border rounded-md items-start relative pt-8 md:pt-4">
                  <button
                    type="button"
                    onClick={() => removeFamily(index)}
                    className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1"
                    title="Remove Family Member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-text mb-1">Name *</label>
                    <input {...register(`family_members.${index}.name` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
                    {errors.family_members?.[index]?.name && <p className="text-red-500 text-xs mt-1">{errors.family_members[index]?.name?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text mb-1">Relation *</label>
                    <input {...register(`family_members.${index}.relation` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
                    {errors.family_members?.[index]?.relation && <p className="text-red-500 text-xs mt-1">{errors.family_members[index]?.relation?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text mb-1">Profession</label>
                    <input {...register(`family_members.${index}.profession` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text mb-1">Income</label>
                    <input type="number" {...register(`family_members.${index}.income` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text mb-1">Mobile</label>
                    <input {...register(`family_members.${index}.mobile_no` as const)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text text-sm focus:ring-brand" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Financial Details */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Loan Amount *" name="loan_amount" type="number" />
          <InputField label="Loan Date *" name="loan_date" type="date" />
          <InputField label="File Charge" name="file_charge" type="number" />

          <InputField label="Interest Rate (%)" name="interest_rate" type="number" />
          <div>
            <label className="block text-sm font-medium text-text mb-1">Interest Type</label>
            <select
              {...register('interest_type')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="Flat">Flat</option>
              <option value="Reducing">Reducing</option>
            </select>
          </div>
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

          <InputField label="Total Installments *" name="total_installments" type="number" readOnly={true} />
          <InputField label="Installment Start Date *" name="installment_start_date" type="date" />
          <InputField label="Installment End Date" name="installment_end_date" type="date" />
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
          <InputField label="WhatsApp Mobile" name="whatsapp_mobile" />
          <InputField label="Email Address" name="email" type="email" />
          <InputField label="Email Password" name="email_password" />
        </div>

        <div className="mt-4">
          <InputField label="Remarks / Notes" name="remarks" />
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
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Member'}
        </Button>
      </div>
    </form>
  )
}
