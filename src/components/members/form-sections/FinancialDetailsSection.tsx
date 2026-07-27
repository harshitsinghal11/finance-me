import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { MemberFormValues } from '../schema'
import { InputField } from './FieldComponents'

interface FinancialDetailsSectionProps {
  register: UseFormRegister<MemberFormValues>
  errors: FieldErrors<MemberFormValues>
  onCalculationFieldFocus: (field: 'installment_amount' | 'total_installments' | 'tenure') => void
}

export function FinancialDetailsSection({ register, errors, onCalculationFieldFocus }: FinancialDetailsSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-text">Financial Details</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Loan Amount *" name="loan_amount" type="number" register={register} errors={errors} />
        <InputField label="Loan Date *" name="loan_date" type="date" register={register} errors={errors} />
        <InputField label="File Charge" name="file_charge" type="number" register={register} errors={errors} />

        <div>
          <label className="block text-sm font-medium text-text mb-1">Interest Type *</label>
          <select
            {...register('interest_type')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="Flat">Flat</option>
            <option value="Compound">Compound</option>
          </select>
        </div>

        <InputField label="Interest Rate (%)" name="interest_rate" type="number" register={register} errors={errors} />

        <InputField label="Benefit Amount" name="benefit_amount" type="number" register={register} errors={errors} />

        <div>
          <InputField label="Installment Amount *" name="installment_amount" type="number" register={register} errors={errors} onFocus={() => onCalculationFieldFocus('installment_amount')} />
        </div>

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

        <InputField label="Tenure (Years)" name="tenure_years" type="number" register={register} errors={errors} onFocus={() => onCalculationFieldFocus('tenure')} />
        <InputField label="Tenure (Months)" name="tenure_months" type="number" register={register} errors={errors} onFocus={() => onCalculationFieldFocus('tenure')} />
        <div>
          <InputField label="Total Installments *" name="total_installments" type="number" register={register} errors={errors} onFocus={() => onCalculationFieldFocus('total_installments')} />
        </div>

        <InputField label="Installment Start Date *" name="installment_start_date" type="date" register={register} errors={errors} />
        <InputField label="Installment End Date" name="installment_end_date" type="date" register={register} errors={errors} />
      </div>
    </div>
  )
}
