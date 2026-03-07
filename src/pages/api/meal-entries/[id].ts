import type { APIRoute } from 'astro';
import { json, errorResponse, parseBody, parseId } from '../../../lib/api';
import { updateMealEntry, deleteMealEntry } from '../../../services/meal-entries';

export const PUT: APIRoute = async ({ params, request }) => {
  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { slotLabel, slotOrder, portionWeight, isTrainingDay } = body;

  const updates: Record<string, unknown> = {};
  if (slotLabel !== undefined) updates.slotLabel = slotLabel;
  if (slotOrder !== undefined) updates.slotOrder = slotOrder;
  if (portionWeight !== undefined) updates.portionWeight = portionWeight;
  if (isTrainingDay !== undefined) updates.isTrainingDay = isTrainingDay;

  const result = updateMealEntry(id, updates);
  if (!result) return errorResponse('Not found', 404);

  return json(result);
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (!id) return errorResponse('Invalid id', 400);

  const deleted = deleteMealEntry(id);
  if (!deleted) return errorResponse('Not found', 404);

  return new Response(null, { status: 204 });
};
