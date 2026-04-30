import { NextRequest, NextResponse } from 'next/server'
import { getTrades } from '@/lib/db/queries/trades'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const filters = {
    chamber: searchParams.get('chamber') ?? undefined,
    politician: searchParams.get('politician') ?? undefined,
    ticker: searchParams.get('ticker') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1', 10),
    limit: Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100),
  }

  const result = await getTrades(filters)
  return NextResponse.json(result)
}
