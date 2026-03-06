import type { APIRoute } from 'astro';
import { db, schema } from '../../../../../db/index';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../../../lib/auth';

function parseId(raw: string | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export const GET: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (!id) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 });

  const recipe = db.select().from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  if (!recipe) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  return new Response(JSON.stringify(recipe));
};

export const PUT: APIRoute = async ({ params, request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const id = parseId(params.id);
  if (!id) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 });

  const existing = db.select({ id: schema.recipes.id }).from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const body = await request.json();
  // Prevent changing id/slug directly
  const { id: _id, slug: _slug, ...fields } = body;

  const result = db.update(schema.recipes)
    .set({ ...fields, updatedAt: new Date().toISOString() })
    .where(eq(schema.recipes.id, id))
    .returning()
    .get();

  return new Response(JSON.stringify(result));
};
