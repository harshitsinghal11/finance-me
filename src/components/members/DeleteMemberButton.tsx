'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'

export function DeleteMemberButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) throw error

      toast.success('Member deleted successfully')
      router.push('/members')
    } catch (error: unknown) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete member')
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      onClick={handleDelete}
      disabled={isDeleting}
      variant="danger"
    >
      {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
