import type { APIRoute } from 'astro';
import { json, errorResponse, parseBody } from '@/lib/api';
import { upsertTarget } from '@/services/macro-targets';

const VALID_TYPES = ['training', 'rest'];

export const PUT: APIRoute = async ({ params, request }) => {
  const { profileType } = params;
  if (!profileType || !VALID_TYPES.includes(profileType)) {
    return errorResponse('Invalid profileType (training|rest)', 400);
  }

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { calories, protein, carbs, fat } = body;

  const result = upsertTarget(profileType, {
    calories: calories as number,
    protein: protein as number,
    carbs: carbs as number,
    fat: fat as number,
  });

  return json(result);
};
