export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Run DB migrations on startup
    const { migrate } = await import('drizzle-orm/libsql/migrator')
    const { db } = await import('./lib/db/index')
    const path = await import('path')
    try {
      migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
      console.log('[startup] DB migrations applied')
    } catch (e) {
      console.error('[startup] Migration error:', e)
    }

    // Start the polling scheduler
    const { startScheduler } = await import('./lib/scheduler')
    startScheduler()
  }
}
