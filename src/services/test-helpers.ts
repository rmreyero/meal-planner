import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../db/schema';

export async function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  const { pushSQLiteSchema } = await import('drizzle-kit/api');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { statementsToExecute } = await pushSQLiteSchema(schema, db as any);
  for (const stmt of statementsToExecute) {
    sqlite.exec(stmt);
  }
  return db;
}
