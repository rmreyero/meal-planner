import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';

const VALID_TYPES = ['training', 'rest'];

export const PUT: APIRoute = async ({ params, request }) => {
  const { profileType } = params;
  if (!profileType || !VALID_TYPES.includes(profileType)) {
    return new Response(JSON.stringify({ error: 'Invalid profileType (training|rest)' }), { status: 400 });
  }

  const body = await request.json();
  const { calories, protein, carbs, fat } = body;

  // Upsert: update if exists, create if not
  const existing = db.select({ id: schema.macroTargets.id })
    .from(schema.macroTargets)
    .where(eq(schema.macroTargets.profileType, profileType))
    .get();

  let result;
  if (existing) {
    result = db.update(schema.macroTargets)
      .set({ calories, protein, carbs, fat })
      .where(eq(schema.macroTargets.id, existing.id))
      .returning()
      .get();
  } else {
    result = db.insert(schema.macroTargets)
      .values({ profileType, calories, protein, carbs, fat })
      .returning()
      .get();
  }

  return new Response(JSON.stringify(result));
};
