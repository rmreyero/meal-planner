import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';

export const GET: APIRoute = async () => {
  const targets = db.select().from(schema.macroTargets).all();

  // Ensure both profiles exist
  for (const type of ['training', 'rest'] as const) {
    if (!targets.find((t) => t.profileType === type)) {
      const created = db.insert(schema.macroTargets)
        .values({ profileType: type, calories: 0, protein: 0, carbs: 0, fat: 0 })
        .returning()
        .get();
      targets.push(created);
    }
  }

  return new Response(JSON.stringify(targets));
};
