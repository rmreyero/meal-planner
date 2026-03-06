import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { mealPlanId, dayOfWeek, slotLabel, slotOrder, recipeId, portionWeight } = body;

  if (!mealPlanId || dayOfWeek == null || slotOrder == null || !recipeId) {
    return new Response(JSON.stringify({ error: 'mealPlanId, dayOfWeek, slotOrder, recipeId required' }), { status: 400 });
  }

  const plan = db.select({ id: schema.mealPlans.id }).from(schema.mealPlans).where(eq(schema.mealPlans.id, mealPlanId)).get();
  if (!plan) return new Response(JSON.stringify({ error: 'Meal plan not found' }), { status: 404 });

  const recipe = db.select({ id: schema.recipes.id }).from(schema.recipes).where(eq(schema.recipes.id, recipeId)).get();
  if (!recipe) return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });

  const entry = db.insert(schema.mealEntries)
    .values({ mealPlanId, dayOfWeek, slotLabel: slotLabel || null, slotOrder, recipeId, portionWeight: portionWeight || null })
    .returning()
    .get();

  return new Response(JSON.stringify(entry), { status: 201 });
};
