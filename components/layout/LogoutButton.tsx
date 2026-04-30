'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      SIGN OUT
    </button>
  )
}
