'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1') // Reset page on new search
    
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      />
    </div>
  )
}
