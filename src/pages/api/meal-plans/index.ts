import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db/index';
import { eq } from 'drizzle-orm';
import { json, errorResponse } from '../../../lib/api';

export const GET: APIRoute = async ({ url }) => {
  const week = url.searchParams.get('week');
  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return errorResponse('week param required (YYYY-MM-DD)', 400);
  }

  let plan = db.select().from(schema.mealPlans).where(eq(schema.mealPlans.weekStart, week)).get();

  if (!plan) {
    plan = db.insert(schema.mealPlans).values({ weekStart: week }).returning().get();
  }

  const entries = db.select({
    id: schema.mealEntries.id,
    dayOfWeek: schema.mealEntries.dayOfWeek,
    slotLabel: schema.mealEntries.slotLabel,
    slotOrder: schema.mealEntries.slotOrder,
    recipeId: schema.mealEntries.recipeId,
    portionWeight: schema.mealEntries.portionWeight,
    isTrainingDay: schema.mealEntries.isTrainingDay,
    recipeName: schema.recipes.name,
    recipeSlug: schema.recipes.slug,
    basePortionWeight: schema.recipes.basePortionWeight,
    baseCalories: schema.recipes.baseCalories,
    baseProtein: schema.recipes.baseProtein,
    baseCarbs: schema.recipes.baseCarbs,
    baseFat: schema.recipes.baseFat,
  })
    .from(schema.mealEntries)
    .innerJoin(schema.recipes, eq(schema.mealEntries.recipeId, schema.recipes.id))
    .where(eq(schema.mealEntries.mealPlanId, plan.id))
    .all();

  return json({ ...plan, entries });
};
