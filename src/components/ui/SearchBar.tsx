'use client'

import { Filter, ChevronDown, Check } from 'lucide-react'
import SearchInput from './SearchInput'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function SearchBar({ placeholder = "Search members by name or mobile..." }: { placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentStatus = searchParams.get('status') || 'All'
  const currentSort = searchParams.get('sort') || 'newest'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'All' || value === 'newest') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Always reset to page 1 when filtering
    params.delete('page')
    
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput placeholder={placeholder} />
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md text-text hover:bg-background transition-colors h-full"
          >
            <Filter className="h-5 w-5" />
            Filter
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50 py-2">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Status</p>
                <div className="space-y-1">
                  {['All', 'Active', 'Closed', 'Defaulted'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateParams('status', status)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-text hover:bg-background rounded-md"
                    >
                      {status}
                      {currentStatus === status && <Check className="h-4 w-4 text-brand" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-border my-2"></div>
              
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Sort By</p>
                <div className="space-y-1">
                  {[
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Loan Amount (High to Low)', value: 'amount_desc' },
                    { label: 'Loan Amount (Low to High)', value: 'amount_asc' }
                  ].map((sort) => (
                    <button
                      key={sort.value}
                      onClick={() => updateParams('sort', sort.value)}
                      className="w-full flex items-start justify-between gap-2 px-2 py-1.5 text-left text-sm text-text hover:bg-background rounded-md"
                    >
                      <span className="flex-1">{sort.label}</span>
                      {currentSort === sort.value && <Check className="h-4 w-4 shrink-0 mt-0.5 text-brand" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
