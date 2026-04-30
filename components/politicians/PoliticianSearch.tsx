'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/Input'

export function PoliticianSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  return (
    <Input
      defaultValue={searchParams.get('search') ?? ''}
      placeholder="Search politicians..."
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value) params.set('search', e.target.value)
        else params.delete('search')
        startTransition(() => router.push(`${pathname}?${params.toString()}`))
      }}
      className={`max-w-sm ${isPending ? 'opacity-60' : ''}`}
    />
  )
}
