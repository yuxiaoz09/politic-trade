import { NextRequest, NextResponse } from 'next/server'
import { runIngestion } from '@/lib/ingestion/index'
import { deliverAlerts } from '@/lib/alerts'

// Called daily by Vercel Cron — protected by CRON_SECRET (set automatically by Vercel)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In production, Vercel injects Authorization: Bearer <CRON_SECRET>
  // In dev/manual trigger, accept INTERNAL_API_SECRET as fallback
  const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`
  const isManual = authHeader === `Bearer ${process.env.INTERNAL_API_SECRET}`

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron] Starting daily ingestion run')
  const start = Date.now()

  try {
    const { newTrades } = await runIngestion()
    if (newTrades.length > 0) {
      await deliverAlerts(newTrades)
    }
    const elapsed = Date.now() - start
    console.log(`[cron] Done in ${elapsed}ms — ${newTrades.length} new trades`)
    return NextResponse.json({ ok: true, newTrades: newTrades.length, elapsedMs: elapsed })
  } catch (e) {
    console.error('[cron] Fatal error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
