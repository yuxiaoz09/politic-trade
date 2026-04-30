'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="font-mono font-bold text-xl tracking-widest text-zinc-100 uppercase mb-1">
          POLITIC<span className="text-emerald-400">·</span>TRADE
        </div>
        <p className="text-xs font-mono text-zinc-600">Congress trade disclosure alerts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border border-zinc-800 rounded-lg p-6 bg-zinc-900/30">
        <div>
          <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        {error && <p className="text-xs font-mono text-rose-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'SIGNING IN...' : 'SIGN IN →'}
        </Button>
      </form>

      <p className="text-center text-xs font-mono text-zinc-600 mt-4">
        No account?{' '}
        <Link href="/signup" className="text-zinc-400 hover:text-zinc-200 transition-colors">Sign up</Link>
      </p>
    </div>
  )
}
