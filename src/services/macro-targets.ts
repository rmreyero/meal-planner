import { db, schema } from '@db/index';
import { eq } from 'drizzle-orm';
import type { MacroTarget } from '@db/schema';

export function getAllTargets(): MacroTarget[] {
  const targets = db.select().from(schema.macroTargets).all();

  for (const type of ['training', 'rest'] as const) {
    if (!targets.find((t) => t.profileType === type)) {
      const created = db.insert(schema.macroTargets)
        .values({ profileType: type, calories: 0, protein: 0, carbs: 0, fat: 0 })
        .returning()
        .get();
      targets.push(created);
    }
  }

  return targets;
}

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function upsertTarget(profileType: string, data: MacroData): MacroTarget {
  const existing = db.select({ id: schema.macroTargets.id })
    .from(schema.macroTargets)
    .where(eq(schema.macroTargets.profileType, profileType))
    .get();

  if (existing) {
    return db.update(schema.macroTargets)
      .set(data)
      .where(eq(schema.macroTargets.id, existing.id))
      .returning()
      .get();
  }

  return db.insert(schema.macroTargets)
    .values({ profileType, ...data })
    .returning()
    .get();
}
