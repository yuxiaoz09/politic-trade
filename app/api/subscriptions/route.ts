import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createSubscription, getUserSubscriptions } from '@/lib/db/queries/subscriptions'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const subs = await getUserSubscriptions(user.id)
  return NextResponse.json(subs)
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, filterValue, channel } = await req.json()
  if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })

  try {
    const id = await createSubscription({ userId: user.id, type, filterValue, channel })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create subscription'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
