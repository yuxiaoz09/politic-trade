import { NextRequest, NextResponse } from 'next/server'
import { runIngestion } from '@/lib/ingestion/index'
import { deliverAlerts } from '@/lib/alerts'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { newTrades } = await runIngestion()
  if (newTrades.length > 0) {
    await deliverAlerts(newTrades)
  }

  return NextResponse.json({ ok: true, newTrades: newTrades.length })
}
