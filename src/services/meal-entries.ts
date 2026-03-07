import { db, schema } from '@db/index';
import { eq } from 'drizzle-orm';
import { ok, err, type Result } from './types';
import type { MealEntry } from '@db/schema';

interface CreateMealEntryData {
  mealPlanId: number;
  dayOfWeek: number;
  slotLabel?: string | null;
  slotOrder: number;
  recipeId: number;
  portionWeight?: number | null;
}

export function createMealEntry(data: CreateMealEntryData): Result<MealEntry, 'PLAN_NOT_FOUND' | 'RECIPE_NOT_FOUND'> {
  const plan = db.select({ id: schema.mealPlans.id })
    .from(schema.mealPlans)
    .where(eq(schema.mealPlans.id, data.mealPlanId))
    .get();
  if (!plan) return err('PLAN_NOT_FOUND', 'Meal plan not found');

  const recipe = db.select({ id: schema.recipes.id })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, data.recipeId))
    .get();
  if (!recipe) return err('RECIPE_NOT_FOUND', 'Recipe not found');

  const entry = db.insert(schema.mealEntries)
    .values({
      mealPlanId: data.mealPlanId,
      dayOfWeek: data.dayOfWeek,
      slotLabel: data.slotLabel ?? null,
      slotOrder: data.slotOrder,
      recipeId: data.recipeId,
      portionWeight: data.portionWeight ?? null,
    })
    .returning()
    .get();

  return ok(entry);
}

export function updateMealEntry(id: number, fields: Record<string, unknown>): MealEntry | undefined {
  const existing = db.select({ id: schema.mealEntries.id })
    .from(schema.mealEntries)
    .where(eq(schema.mealEntries.id, id))
    .get();
  if (!existing) return undefined;

  return db.update(schema.mealEntries)
    .set(fields)
    .where(eq(schema.mealEntries.id, id))
    .returning()
    .get();
}

export function deleteMealEntry(id: number): boolean {
  const existing = db.select({ id: schema.mealEntries.id })
    .from(schema.mealEntries)
    .where(eq(schema.mealEntries.id, id))
    .get();
  if (!existing) return false;

  db.delete(schema.mealEntries).where(eq(schema.mealEntries.id, id)).run();
  return true;
}
