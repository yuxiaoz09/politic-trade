import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.match(/session=([^;]+)/)
  if (match) await deleteSession(match[1])
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', '', { maxAge: 0, path: '/' })
  return res
}
