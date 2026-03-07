import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { requireAuth } from '@/lib/auth';
import { json, errorResponse } from '@/lib/api';
import { getRecipeById, setRecipePhoto } from '@/services/recipes';

const PHOTOS_DIR = join(process.cwd(), 'data', 'photos');

export const POST: APIRoute = async ({ params, request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return errorResponse('Invalid id', 400);
  }

  const recipe = getRecipeById(id);
  if (!recipe) return errorResponse('Not found', 404);

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

  setRecipePhoto(id, filename);

  return json({ photoPath: filename }, 201);
};
