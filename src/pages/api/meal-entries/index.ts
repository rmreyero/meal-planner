import type { APIRoute } from 'astro';
import { json, errorResponse, parseBody } from '../../../lib/api';
import { createMealEntry } from '../../../services/meal-entries';

export const POST: APIRoute = async ({ request }) => {
  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { mealPlanId, dayOfWeek, slotLabel, slotOrder, recipeId, portionWeight } = body;

  if (!mealPlanId || dayOfWeek == null || slotOrder == null || !recipeId) {
    return errorResponse('mealPlanId, dayOfWeek, slotOrder, recipeId required', 400);
  }

  const result = createMealEntry({
    mealPlanId: mealPlanId as number,
    dayOfWeek: dayOfWeek as number,
    slotLabel: (slotLabel as string) || null,
    slotOrder: slotOrder as number,
    recipeId: recipeId as number,
    portionWeight: (portionWeight as number) || null,
  });

  if (!result.ok) {
    const status = result.error === 'PLAN_NOT_FOUND' ? 404 : 404;
    return errorResponse(result.message, status);
  }

  return json(result.data, 201);
};
