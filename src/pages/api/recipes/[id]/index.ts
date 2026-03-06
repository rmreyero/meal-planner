import type { APIRoute } from 'astro';
import { db, schema } from '../../../../../db/index';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../../../lib/auth';
import { json, errorResponse, parseBody } from '../../../../lib/api';

function parseId(raw: string | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export const GET: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const recipe = db.select().from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  if (!recipe) return errorResponse('Not found', 404);

  return json(recipe);
};

export const PUT: APIRoute = async ({ params, request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const existing = db.select({ id: schema.recipes.id }).from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  if (!existing) return errorResponse('Not found', 404);

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { id: _id, slug: _slug, ...fields } = body;

  const result = db.update(schema.recipes)
    .set({ ...fields, updatedAt: new Date().toISOString() })
    .where(eq(schema.recipes.id, id))
    .returning()
    .get();

  return json(result);
};
