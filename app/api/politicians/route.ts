import { NextRequest, NextResponse } from 'next/server'
import { getPoliticians } from '@/lib/db/queries/politicians'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') ?? undefined
  const rows = await getPoliticians(search)
  return NextResponse.json(rows)
}
