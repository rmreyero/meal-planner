import { vi, beforeEach } from 'vitest';
import * as schema from '@db/schema';
import { createTestDb } from '@/services/test-helpers';

let db: Awaited<ReturnType<typeof createTestDb>>;

vi.mock('@db/index', () => ({
  get db() { return db; },
  schema,
}));

beforeEach(async () => {
  db = await createTestDb();
});
