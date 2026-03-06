import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';
import { json, errorResponse, parseBody } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const body = await parseBody(request);
  if (!body) return errorResponse('Invalid JSON body', 400);

  const { mealPlanId, dayOfWeek, slotLabel, slotOrder, recipeId, portionWeight } = body;

  if (!mealPlanId || dayOfWeek == null || slotOrder == null || !recipeId) {
    return errorResponse('mealPlanId, dayOfWeek, slotOrder, recipeId required', 400);
  }

  const plan = db.select({ id: schema.mealPlans.id }).from(schema.mealPlans).where(eq(schema.mealPlans.id, mealPlanId as number)).get();
  if (!plan) return errorResponse('Meal plan not found', 404);

  const recipe = db.select({ id: schema.recipes.id }).from(schema.recipes).where(eq(schema.recipes.id, recipeId as number)).get();
  if (!recipe) return errorResponse('Recipe not found', 404);

  const entry = db.insert(schema.mealEntries)
    .values({
      mealPlanId: mealPlanId as number,
      dayOfWeek: dayOfWeek as number,
      slotLabel: (slotLabel as string) || null,
      slotOrder: slotOrder as number,
      recipeId: recipeId as number,
      portionWeight: (portionWeight as number) || null,
    })
    .returning()
    .get();

  return json(entry, 201);
};
