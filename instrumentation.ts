export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Run DB migrations on startup
    const { migrate } = await import('drizzle-orm/libsql/migrator')
    const { db } = await import('./lib/db/index')
    const path = await import('path')
    try {
      await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
      console.log('[startup] DB migrations applied')
    } catch (e) {
      console.error('[startup] Migration error:', e)
    }

    // Only run the polling scheduler in a persistent process (local dev / self-hosted)
    // On Vercel serverless, use the /api/internal/ingest cron endpoint instead
    const isVercel = !!process.env.VERCEL
    if (!isVercel) {
      const { startScheduler } = await import('./lib/scheduler')
      startScheduler()
    }
  }
}
