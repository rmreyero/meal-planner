import type { APIRoute } from 'astro';
import { db, schema } from '../../../../../db/index';
import { eq } from 'drizzle-orm';
import { json, errorResponse } from '../../../../lib/api';

export const PATCH: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return errorResponse('Invalid id', 400);
  }

  const recipe = db.select({ isFavorite: schema.recipes.isFavorite })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .get();

  if (!recipe) {
    return errorResponse('Not found', 404);
  }

  const newValue = !recipe.isFavorite;
  db.update(schema.recipes)
    .set({ isFavorite: newValue })
    .where(eq(schema.recipes.id, id))
    .run();

  return json({ isFavorite: newValue });
};
