import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await seedDatabase()
  return NextResponse.json({ ok: true, ...result })
}
