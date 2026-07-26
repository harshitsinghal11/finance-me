'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/Button'
import { memberSchema, type MemberFormValues } from './schema'
import { createClient } from '@/src/lib/supabase/client'
import { uploadFinanceDocument } from '@/src/lib/storage'
import { generateInstallments, calculateEndDate } from '@/src/helpers/dateHelpers'
import { calculateTotalRepayment, calculateTotalInstallmentsCount } from '@/src/helpers/financeMath'

import { PersonalInfoSection } from './form-sections/PersonalInfoSection'
import { FamilyMembersSection } from './form-sections/FamilyMembersSection'
import { FinancialDetailsSection } from './form-sections/FinancialDetailsSection'
import { GuarantorDetailsSection } from './form-sections/GuarantorDetailsSection'
import { ChecklistSection } from './form-sections/ChecklistSection'
import { DocumentUploadSection } from './form-sections/DocumentUploadSection'

export function MemberForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calcMode, setCalcMode] = useState<'amount' | 'installments'>('amount')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema) as any,
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
  const watchInstallmentStartDate = watch('installment_start_date')
  const watchInstallmentType = watch('installment_type')
  const watchTotalInstallments = watch('total_installments')

  useEffect(() => {
    const loan = Number(watchLoanAmount) || 0
    const rate = Number(watchInterestRate) || 0
    const instAmt = Number(watchInstallmentAmount) || 0
    const totalInst = Number(watchTotalInstallments) || 0

    if (loan > 0) {
      const totalRepayment = calculateTotalRepayment(loan, rate)
      
      if (calcMode === 'amount' && instAmt > 0) {
        const calculatedInst = calculateTotalInstallmentsCount(totalRepayment, instAmt)
        if (calculatedInst !== totalInst) {
          setValue('total_installments', calculatedInst, { shouldValidate: true })
        }
      } else if (calcMode === 'installments' && totalInst > 0) {
        const calculatedAmt = Math.ceil(totalRepayment / totalInst)
        if (calculatedAmt !== instAmt) {
          setValue('installment_amount', calculatedAmt, { shouldValidate: true })
        }
      }
    }
  }, [watchLoanAmount, watchInterestRate, watchInstallmentAmount, watchTotalInstallments, calcMode, setValue])

  useEffect(() => {
    if (watchInstallmentStartDate && watchTotalInstallments > 0) {
      const endDate = calculateEndDate(watchInstallmentStartDate, watchTotalInstallments, watchInstallmentType as any)
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
        mobile_no: data.mobile_no,
        residence_address: data.residence_address,
        permanent_address: data.permanent_address,
        company_name: data.company_name,
        company_address: data.company_address,
        vehicle_details: data.vehicle_details,
        total_family_members: data.total_family_members,

        loan_amount: data.loan_amount,
        loan_date: data.loan_date,
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

      // Generate Installments Data
      const totalExpectedRepayment = calculateTotalRepayment(data.loan_amount, data.interest_rate)
      const newInstallmentsData = generateInstallments(
        data.installment_start_date,
        data.total_installments,
        data.installment_type,
        data.installment_amount,
        totalExpectedRepayment
      )

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

        const existingMap = new Map(existingInsts.map(i => [i.installment_no, i.id]))
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

      toast.success(initialData?.id ? 'Member updated successfully' : 'Member created successfully')
      router.push('/members')

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'An error occurred while saving the member')
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

      <FinancialDetailsSection register={register} errors={errors} setCalcMode={setCalcMode} />

      <GuarantorDetailsSection register={register} errors={errors} />

      <ChecklistSection register={register} errors={errors} />

      <DocumentUploadSection register={register} />

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
