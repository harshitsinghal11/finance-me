import { createClient } from './supabase/client'
import { v4 as uuidv4 } from 'uuid'

export async function uploadFinanceDocument(
  file: File, 
  memberId: string, 
  documentType: 'family_photo' | 'member_signature' | 'guarantor_signature' | string
): Promise<string | null> {
  if (!file) return null

  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${memberId}/${documentType}_${uuidv4()}.${fileExt}`
  
  const { error } = await supabase.storage
    .from('finance_documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading file:', error)
    throw error
  }

  const { data: publicUrlData } = supabase.storage
    .from('finance_documents')
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}
