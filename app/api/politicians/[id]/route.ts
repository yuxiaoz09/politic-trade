import { NextRequest, NextResponse } from 'next/server'
import { getPoliticianById } from '@/lib/db/queries/politicians'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const politician = await getPoliticianById(id)
  if (!politician) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(politician)
}
