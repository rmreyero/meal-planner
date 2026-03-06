import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { db, schema } from '../../../../../db/index';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../../../lib/auth';
import { json, errorResponse } from '../../../../lib/api';

const PHOTOS_DIR = join(process.cwd(), 'data', 'photos');

export const POST: APIRoute = async ({ params, request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return errorResponse('Invalid id', 400);
  }

  const recipe = db.select({ id: schema.recipes.id, slug: schema.recipes.slug })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .get();

  if (!recipe) {
    return errorResponse('Not found', 404);
  }

  const formData = await request.formData();
  const file = formData.get('photo');

  if (!file || !(file instanceof File)) {
    return errorResponse('photo file is required', 400);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${recipe.slug}.${ext}`;

  await mkdir(PHOTOS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(PHOTOS_DIR, filename), buffer);

  db.update(schema.recipes)
    .set({ photoPath: filename, updatedAt: new Date().toISOString() })
    .where(eq(schema.recipes.id, id))
    .run();

  return json({ photoPath: filename }, 201);
};
