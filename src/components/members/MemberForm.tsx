'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/Button'
import { memberSchema, type MemberFormValues } from './schema'
import { createClient } from '@/src/lib/supabase/client'
import { uploadFinanceDocument } from '@/src/lib/storage'
import { generateInstallments, calculateEndDate, type InstallmentType } from '@/src/helpers/dateHelpers'
import { calculateTotalRepayment, calculateTotalInstallmentsCount } from '@/src/helpers/financeMath'

import { PersonalInfoSection } from './form-sections/PersonalInfoSection'
import { FamilyMembersSection } from './form-sections/FamilyMembersSection'
import { FinancialDetailsSection } from './form-sections/FinancialDetailsSection'
import { GuarantorDetailsSection } from './form-sections/GuarantorDetailsSection'
import { ChecklistSection } from './form-sections/ChecklistSection'
import { DocumentUploadSection } from './form-sections/DocumentUploadSection'

type ExistingFamilyMember = MemberFormValues['family_members'][number] & { is_deleted?: boolean }
type MemberFormInitialData = Partial<MemberFormValues> & {
  id?: string
  member_family?: ExistingFamilyMember[]
}

type SavedMember = { id: string }
type MemberUpdatePayload = { family_photo_url?: string; member_signature_url?: string; guarantor_signature_url?: string }

export function MemberForm({ initialData }: { initialData?: MemberFormInitialData }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculationDriver, setCalculationDriver] = useState<'installment_amount' | 'total_installments' | 'tenure'>('total_installments')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      member_name: initialData?.member_name || '',
      status: initialData?.status || 'Active',
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
      interest_type: initialData?.interest_type || 'Flat',
      interest_rate: initialData?.interest_rate || 0,
      benefit_amount: initialData?.benefit_amount || 0,
      installment_type: initialData?.installment_type || 'Daily',
      tenure_years: initialData?.tenure_years || 0,
      tenure_months: initialData?.tenure_months || 0,
      total_installments: initialData?.total_installments || 100,
      aadhar_available: initialData?.aadhar_available || false,
      pan_available: initialData?.pan_available || false,
      family_id_available: initialData?.family_id_available || false,
      original_signed_cheques: initialData?.original_signed_cheques || 0,
      loan_agreement_available: initialData?.loan_agreement_available || false,
      promissory_note_available: initialData?.promissory_note_available || false,
      rc_or_gold_photos: initialData?.rc_or_gold_photos || false,
      family_members: initialData?.member_family?.filter((f) => !f.is_deleted) || [],
    }
  })

  const { fields: familyFields, append: appendFamily, remove: removeFamily } = useFieldArray({
    control,
    name: 'family_members'
  })

  const watchLoanAmount = watch('loan_amount')
  const watchInterestType = watch('interest_type')
  const watchInterestRate = watch('interest_rate')
  const watchInstallmentAmount = watch('installment_amount')
  const watchInstallmentStartDate = watch('installment_start_date')
  const watchInstallmentType = watch('installment_type')
  const watchTenureYears = watch('tenure_years')
  const watchTenureMonths = watch('tenure_months')
  const watchTotalInstallments = watch('total_installments')

  // Dynamically sync fields
  useEffect(() => {
    const loanAmt = Number(watchLoanAmount) || 0
    const rateAmt = Number(watchInterestRate) || 0
    const intType = watchInterestType || 'Flat'
    const instType = watchInstallmentType || 'Monthly'

    if (calculationDriver === 'tenure') {
      const y = Number(watchTenureYears) || 0
      const m = Number(watchTenureMonths) || 0
      let calculatedInst = 0
      if (instType === 'Monthly') calculatedInst = (y * 12) + m
      else if (instType === 'Weekly') calculatedInst = (y * 52) + (m * 4)
      else if (instType === 'Daily') calculatedInst = (y * 365) + (m * 30)

      if (calculatedInst > 0 && calculatedInst !== Number(watchTotalInstallments)) {
        setValue('total_installments', calculatedInst, { shouldValidate: true })
      }
    } else if (calculationDriver === 'installment_amount') {
      const instAmt = Number(watchInstallmentAmount) || 0
      if (instAmt > 0 && loanAmt > 0) {
        const calculatedN = calculateTotalInstallmentsCount(instAmt, loanAmt, rateAmt, intType, instType)
        if (calculatedN > 0 && calculatedN !== Number(watchTotalInstallments)) {
          setValue('total_installments', calculatedN, { shouldValidate: true })
        }
      }
    } else {
      const totalInst = Number(watchTotalInstallments) || 0
      if (totalInst > 0 && loanAmt > 0) {
        const totalRepayment = calculateTotalRepayment(loanAmt, rateAmt, intType, instType, totalInst)
        const calculatedAmt = Number((totalRepayment / totalInst).toFixed(2))

        if (calculatedAmt > 0 && calculatedAmt !== Number(watchInstallmentAmount)) {
          setValue('installment_amount', calculatedAmt, { shouldValidate: true })
        }
      }
    }
  }, [
    watchInstallmentAmount,
    watchTotalInstallments,
    watchTenureYears,
    watchTenureMonths,
    watchLoanAmount,
    watchInterestRate,
    watchInterestType,
    watchInstallmentType,
    calculationDriver,
    setValue
  ])

  useEffect(() => {
    if (watchInstallmentStartDate && watchTotalInstallments > 0) {
      const endDate = calculateEndDate(watchInstallmentStartDate, watchTotalInstallments, watchInstallmentType as InstallmentType)
      setValue('installment_end_date', endDate, { shouldValidate: true })
    }
  }, [watchInstallmentStartDate, watchTotalInstallments, watchInstallmentType, setValue])

  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert member
      const memberData = {
        profile_id: user.id,
        member_name: data.member_name,
        status: data.status,
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
        tenure_years: data.tenure_years,
        tenure_months: data.tenure_months,
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

      let member: SavedMember

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
      const updateData: MemberUpdatePayload = {}
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

      // Generate Installments Data
      const totalExpectedRepayment = calculateTotalRepayment(
        data.loan_amount,
        data.interest_rate,
        data.interest_type,
        data.installment_type,
        data.total_installments
      )
      const newInstallmentsData = generateInstallments(
        data.installment_start_date,
        data.total_installments,
        data.installment_type,
        data.installment_amount,
        totalExpectedRepayment
      )

      // Sync the actual total installments with how many were generated
      // (in case the loan cleared early and stopped generating '0' installments)
      memberData.total_installments = newInstallmentsData.length
      data.total_installments = newInstallmentsData.length

      if (!initialData?.id) {
        // NEW MEMBER: Insert all installments
        const installmentsToInsert = newInstallmentsData.map(inst => ({
          member_id: member.id,
          installment_no: inst.installment_no,
          due_date: inst.due_date,
          installment_amount: inst.installment_amount,
        }))

        const { error: instError } = await supabase
          .from('member_installments')
          .insert(installmentsToInsert)

        if (instError) throw instError
      } else {
        // EXISTING MEMBER: Smart update to preserve payment history
        const { data: existingInsts, error: fetchErr } = await supabase
          .from('member_installments')
          .select('id, installment_no')
          .eq('member_id', member.id)
          .eq('is_deleted', false)

        if (fetchErr) throw fetchErr

        const existingMap = new Map(existingInsts.map((i) => [i.installment_no, i.id]))
        const updatePromises = []
        const insertData = []
        const deleteIds = []

        for (const newInst of newInstallmentsData) {
          const existingId = existingMap.get(newInst.installment_no)
          if (existingId) {
            updatePromises.push(
              supabase.from('member_installments').update({
                due_date: newInst.due_date,
                installment_amount: newInst.installment_amount
              }).eq('id', existingId)
            )
          } else {
            insertData.push({
              member_id: member.id,
              installment_no: newInst.installment_no,
              due_date: newInst.due_date,
              installment_amount: newInst.installment_amount,
            })
          }
        }

        for (const [instNo, id] of Array.from(existingMap.entries())) {
          if (instNo > data.total_installments) {
            deleteIds.push(id)
          }
        }

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises)
        }
        if (insertData.length > 0) {
          await supabase.from('member_installments').insert(insertData)
        }
        if (deleteIds.length > 0) {
          await supabase.from('member_installments').update({ is_deleted: true }).in('id', deleteIds)
        }
      }

      // Sync family members for both new and existing members
      if (initialData?.id) {
        const { error: familySoftDeleteError } = await supabase
          .from('member_family')
          .update({ is_deleted: true })
          .eq('member_id', initialData.id)
          .eq('is_deleted', false)

        if (familySoftDeleteError) throw familySoftDeleteError
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

      toast.success(initialData?.id ? 'Member updated successfully' : 'Member created successfully')
      router.push('/members')

    } catch (err: unknown) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'An error occurred while saving the member')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <PersonalInfoSection register={register} errors={errors} />

      <FamilyMembersSection
        register={register}
        errors={errors}
        familyFields={familyFields}
        appendFamily={appendFamily}
        removeFamily={removeFamily}
      />

      <FinancialDetailsSection
        register={register}
        errors={errors}
        onCalculationFieldFocus={setCalculationDriver}
      />

      <GuarantorDetailsSection register={register} errors={errors} />

      <ChecklistSection register={register} errors={errors} />

      <DocumentUploadSection register={register} watch={watch} />

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
