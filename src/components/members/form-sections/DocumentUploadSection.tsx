import { UseFormRegister, UseFormWatch } from 'react-hook-form'
import { MemberFormValues } from '../schema'
import { Button } from '@/src/components/ui/Button'
import { Upload } from 'lucide-react'
import { useRef } from 'react'

interface DocumentUploadSectionProps {
  register: UseFormRegister<MemberFormValues>
  watch: UseFormWatch<MemberFormValues>
}

const CustomFileUpload = ({
  label,
  name,
  register,
  watch
}: {
  label: string,
  name: keyof MemberFormValues,
  register: UseFormRegister<MemberFormValues>,
  watch: UseFormWatch<MemberFormValues>
}) => {
  const fileList = watch(name) as FileList | undefined
  const fileName = fileList && fileList.length > 0 ? fileList[0].name : "No file chosen"

  const { ref, ...rest } = register(name)
  const hiddenInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div>
      <label className="block text-sm font-medium text-text mb-2">{label}</label>
      <div className="flex flex-col items-start gap-3 border border-border rounded-lg p-4 bg-surface shadow-sm">
        <p className="text-sm text-text-secondary truncate max-w-full">
          {fileName}
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => hiddenInputRef.current?.click()}
          className="flex items-center gap-2 text-sm w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" /> Browse...
        </Button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          {...rest}
          ref={(e) => {
            ref(e)
            hiddenInputRef.current = e
          }}
        />
      </div>
    </div>
  )
}

export function DocumentUploadSection({ register, watch }: DocumentUploadSectionProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-text mb-4">Upload Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CustomFileUpload label="Family Photo" name="family_photo" register={register} watch={watch} />
        <CustomFileUpload label="Member Signature" name="member_signature" register={register} watch={watch} />
        <CustomFileUpload label="Guarantor Signature" name="guarantor_signature" register={register} watch={watch} />
      </div>
    </div>
  )
}
