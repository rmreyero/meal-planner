import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { like, and, sql, eq } from 'drizzle-orm';
import { requireAuth } from '../../../lib/auth';
import { slugify } from '../../../lib/slug';
import { json, errorResponse, parseBody } from '../../../lib/api';
import { downloadPhoto } from '../../../lib/photo';

export const GET: APIRoute = async ({ url }) => {
  const tag = url.searchParams.get('tag');
  const search = url.searchParams.get('search');

  const conditions = [];
  if (search) {
    conditions.push(like(schema.recipes.name, `%${search}%`));
  }
  if (tag) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${schema.recipes.tags}) WHERE json_each.value = ${tag})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const recipes = db.select().from(schema.recipes).where(where).all();

  return json(recipes);
};

export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { name, photoUrl, ...rest } = body;

  if (!name || typeof name !== 'string') {
    return errorResponse('name is required', 400);
  }

  const slug = slugify(name);

  const existing = db.select({ id: schema.recipes.id })
    .from(schema.recipes)
    .where(sql`${schema.recipes.slug} = ${slug}`)
    .get();

  if (existing) {
    return errorResponse('Recipe with this name already exists', 409);
  }

  const result = db.insert(schema.recipes)
    .values({ ...rest, name, slug } as typeof schema.recipes.$inferInsert)
    .returning()
    .get();

  if (photoUrl && typeof photoUrl === 'string') {
    const filename = await downloadPhoto(photoUrl, slug);
    if (filename) {
      db.update(schema.recipes)
        .set({ photoPath: filename })
        .where(eq(schema.recipes.id, result.id))
        .run();
      result.photoPath = filename;
    }
  }

  return json(result, 201);
};
