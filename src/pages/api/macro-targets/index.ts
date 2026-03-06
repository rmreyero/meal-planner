import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { json } from '../../../lib/api';

export const GET: APIRoute = async () => {
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

  return json(targets);
};
