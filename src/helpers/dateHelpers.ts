import { addDays, addWeeks, addMonths, parseISO, formatISO } from 'date-fns'

export type InstallmentType = 'Daily' | 'Weekly' | 'Monthly'

export interface GeneratedInstallment {
  installment_no: number
  due_date: string
  installment_amount: number
}

export function generateInstallments(
  startDateStr: string,
  totalInstallments: number,
  installmentType: InstallmentType,
  installmentAmount: number,
  totalExpectedRepayment: number
): GeneratedInstallment[] {
  const installments: GeneratedInstallment[] = []
  let currentDate = parseISO(startDateStr)
  let remainingAmount = totalExpectedRepayment

  for (let i = 1; i <= totalInstallments; i++) {
    const amountForThisInstallment = Math.min(installmentAmount, remainingAmount)

    installments.push({
      installment_no: i,
      due_date: formatISO(currentDate, { representation: 'date' }),
      installment_amount: amountForThisInstallment,
    })

    remainingAmount -= amountForThisInstallment

    if (installmentType === 'Daily') {
      currentDate = addDays(currentDate, 1)
    } else if (installmentType === 'Weekly') {
      currentDate = addWeeks(currentDate, 1)
    } else if (installmentType === 'Monthly') {
      currentDate = addMonths(currentDate, 1)
    }
  }

  return installments
}

export function calculateEndDate(
  startDateStr: string,
  totalInstallments: number,
  installmentType: InstallmentType
): string {
  if (!startDateStr || totalInstallments <= 0) return startDateStr || ''
  
  let currentDate = parseISO(startDateStr)
  const periodsToAdd = totalInstallments - 1
  
  if (periodsToAdd <= 0) return startDateStr
  
  if (installmentType === 'Daily') {
    currentDate = addDays(currentDate, periodsToAdd)
  } else if (installmentType === 'Weekly') {
    currentDate = addWeeks(currentDate, periodsToAdd)
  } else if (installmentType === 'Monthly') {
    currentDate = addMonths(currentDate, periodsToAdd)
  }
  
  return formatISO(currentDate, { representation: 'date' })
}
