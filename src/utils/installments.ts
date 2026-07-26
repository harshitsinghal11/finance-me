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
  installmentAmount: number
): GeneratedInstallment[] {
  const installments: GeneratedInstallment[] = []
  let currentDate = parseISO(startDateStr)

  for (let i = 1; i <= totalInstallments; i++) {
    installments.push({
      installment_no: i,
      due_date: formatISO(currentDate, { representation: 'date' }),
      installment_amount: installmentAmount,
    })

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
