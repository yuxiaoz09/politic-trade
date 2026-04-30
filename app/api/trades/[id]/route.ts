import { NextRequest, NextResponse } from 'next/server'
import { getTradeById } from '@/lib/db/queries/trades'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const row = await getTradeById(id)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}
