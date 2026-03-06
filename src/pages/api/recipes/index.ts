import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { like, and, sql } from 'drizzle-orm';
import { requireAuth } from '../../../lib/auth';
import { slugify } from '../../../lib/slug';

export const GET: APIRoute = async ({ url }) => {
  const tag = url.searchParams.get('tag');
  const search = url.searchParams.get('search');

  const conditions = [];
  if (search) {
    conditions.push(like(schema.recipes.name, `%${search}%`));
  }
  if (tag) {
    // JSON array contains value — SQLite json_each approach
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${schema.recipes.tags}) WHERE json_each.value = ${tag})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const recipes = db.select().from(schema.recipes).where(where).all();

  return new Response(JSON.stringify(recipes), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, ...rest } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 });
  }

  const slug = slugify(name);

  const existing = db.select({ id: schema.recipes.id })
    .from(schema.recipes)
    .where(sql`${schema.recipes.slug} = ${slug}`)
    .get();

  if (existing) {
    return new Response(JSON.stringify({ error: 'Recipe with this name already exists' }), { status: 409 });
  }

  const result = db.insert(schema.recipes)
    .values({ ...rest, name, slug })
    .returning()
    .get();

  return new Response(JSON.stringify(result), { status: 201 });
};
