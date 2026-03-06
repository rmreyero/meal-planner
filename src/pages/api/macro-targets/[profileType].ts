import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';
import { json, errorResponse, parseBody } from '../../../lib/api';

const VALID_TYPES = ['training', 'rest'];

export const PUT: APIRoute = async ({ params, request }) => {
  const { profileType } = params;
  if (!profileType || !VALID_TYPES.includes(profileType)) {
    return errorResponse('Invalid profileType (training|rest)', 400);
  }

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { calories, protein, carbs, fat } = body;

  const existing = db.select({ id: schema.macroTargets.id })
    .from(schema.macroTargets)
    .where(eq(schema.macroTargets.profileType, profileType))
    .get();

  let result;
  if (existing) {
    result = db.update(schema.macroTargets)
      .set({ calories: calories as number, protein: protein as number, carbs: carbs as number, fat: fat as number })
      .where(eq(schema.macroTargets.id, existing.id))
      .returning()
      .get();
  } else {
    result = db.insert(schema.macroTargets)
      .values({ profileType, calories: calories as number, protein: protein as number, carbs: carbs as number, fat: fat as number })
      .returning()
      .get();
  }

  return json(result);
};
