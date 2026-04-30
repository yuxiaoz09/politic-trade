import { NextRequest, NextResponse } from 'next/server'
import { getTrades } from '@/lib/db/queries/trades'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10)
  const result = await getTrades({ politician: id, page, limit: 50 })
  return NextResponse.json(result)
}
