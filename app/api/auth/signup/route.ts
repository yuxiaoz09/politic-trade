import { NextRequest, NextResponse } from 'next/server'
import { createUser, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  try {
    const userId = await createUser(email, password)
    const sessionId = await createSession(userId)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('session', sessionId, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60, path: '/' })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Registration failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
