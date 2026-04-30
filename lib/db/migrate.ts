import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './index'
import path from 'path'

await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
console.log('Migrations applied.')
