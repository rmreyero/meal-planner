import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/auth';
import { json, errorResponse, parseBody, parseId } from '../../../../lib/api';
import { downloadPhoto } from '../../../../lib/photo';
import { getRecipeById, updateRecipe } from '../../../../services/recipes';

export const GET: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const recipe = getRecipeById(id);
  if (!recipe) return errorResponse('Not found', 404);

  return json(recipe);
};

export const PUT: APIRoute = async ({ params, request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const existing = getRecipeById(id);
  if (!existing) return errorResponse('Not found', 404);

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { id: _id, slug: _slug, photoUrl, ...fields } = body;

  if (photoUrl && typeof photoUrl === 'string') {
    const filename = await downloadPhoto(photoUrl, existing.slug);
    if (filename) {
      (fields as Record<string, unknown>).photoPath = filename;
    }
  }

  const result = updateRecipe(id, fields);
  return json(result);
};
