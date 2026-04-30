import { NextRequest, NextResponse } from 'next/server'
import { loginUser, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  try {
    const user = await loginUser(email, password)
    const sessionId = await createSession(user.id)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('session', sessionId, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60, path: '/' })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Login failed'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
