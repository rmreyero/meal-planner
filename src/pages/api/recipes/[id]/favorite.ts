import type { APIRoute } from 'astro';
import { json, errorResponse } from '@/lib/api';
import { toggleFavorite } from '@/services/recipes';

export const PATCH: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return errorResponse('Invalid id', 400);
  }

  const result = toggleFavorite(id);
  if (!result) return errorResponse('Not found', 404);

  return json(result);
};
