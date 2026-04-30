import { runIngestion } from './ingestion/index'
import { deliverAlerts } from './alerts'

const INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

let started = false

export function startScheduler() {
  if (started) return
  started = true

  console.log('[scheduler] Starting — first run in 10s, then every 30 minutes')

  // Initial run shortly after boot
  setTimeout(async () => {
    await tick()
  }, 10_000)

  setInterval(async () => {
    await tick()
  }, INTERVAL_MS)
}

async function tick() {
  try {
    const { newTrades } = await runIngestion()
    if (newTrades.length > 0) {
      await deliverAlerts(newTrades)
    }
  } catch (e) {
    console.error('[scheduler] tick error:', e)
  }
}
