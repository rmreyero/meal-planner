import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/auth';
import { json, errorResponse, parseBody } from '@/lib/api';
import { downloadPhoto } from '@/lib/photo';
import { listRecipes, createRecipe, setRecipePhoto } from '@/services/recipes';

export const GET: APIRoute = async ({ url }) => {
  const tag = url.searchParams.get('tag') ?? undefined;
  const search = url.searchParams.get('search') ?? undefined;
  return json(listRecipes({ tag, search }));
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

  const result = createRecipe({ ...rest, name });
  if (!result.ok) return errorResponse(result.message, 409);

  if (photoUrl && typeof photoUrl === 'string') {
    const filename = await downloadPhoto(photoUrl, result.data.slug);
    if (filename) {
      setRecipePhoto(result.data.id, filename);
      result.data.photoPath = filename;
    }
  }

  return json(result.data, 201);
};
