import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { MemberFormValues } from '../schema'

interface InputFieldProps {
  label: string
  name: keyof MemberFormValues
  type?: string
  readOnly?: boolean
  maxLength?: number
  allowNumbers?: boolean
  register: UseFormRegister<MemberFormValues>
  errors: FieldErrors<MemberFormValues>
  onFocus?: () => void
}

export const InputField = ({ label, name, type = 'text', readOnly = false, maxLength, allowNumbers = true, register, errors, onFocus }: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <input
      type={type}
      readOnly={readOnly}
      maxLength={maxLength}
      {...register(name)}
      onFocus={onFocus}
      onInput={(e) => {
        if (type === 'tel') {
          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
        } else if (allowNumbers === false) {
          e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '')
        }
      }}
      className={`w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${readOnly ? 'opacity-75 cursor-not-allowed bg-surface-hover' : ''}`}
    />
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</p>}
  </div>
)

interface CheckboxFieldProps {
  label: string
  name: keyof MemberFormValues
  register: UseFormRegister<MemberFormValues>
}

export const CheckboxField = ({ label, name, register }: CheckboxFieldProps) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      {...register(name)}
      className="rounded border-border text-brand focus:ring-brand"
    />
    <span className="text-sm font-medium text-text">{label}</span>
  </label>
)
