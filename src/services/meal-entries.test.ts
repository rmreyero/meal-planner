import { describe, it, expect } from 'vitest';
import { db, schema } from '../../db/index';
import { createMealEntry, updateMealEntry, deleteMealEntry } from './meal-entries';

function seedPlanAndRecipe() {
  const recipe = db.insert(schema.recipes).values({
    name: 'Test Recipe',
    slug: 'test-recipe',
    category: 'principal',
    ingredients: [{ items: ['1 item'] }],
    instructions: ['Step 1'],
  }).returning().get();

  const plan = db.insert(schema.mealPlans).values({ weekStart: '2025-01-06' }).returning().get();

  return { recipe, plan };
}

describe('meal-entries', () => {
  it('creates a meal entry with valid references', () => {
    const { recipe, plan } = seedPlanAndRecipe();
    const result = createMealEntry({
      mealPlanId: plan.id,
      dayOfWeek: 0,
      slotOrder: 0,
      recipeId: recipe.id,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipeId).toBe(recipe.id);
      expect(result.data.mealPlanId).toBe(plan.id);
    }
  });

  it('rejects entry with invalid plan', () => {
    const { recipe } = seedPlanAndRecipe();
    const result = createMealEntry({
      mealPlanId: 999,
      dayOfWeek: 0,
      slotOrder: 0,
      recipeId: recipe.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('PLAN_NOT_FOUND');
  });

  it('rejects entry with invalid recipe', () => {
    const { plan } = seedPlanAndRecipe();
    const result = createMealEntry({
      mealPlanId: plan.id,
      dayOfWeek: 0,
      slotOrder: 0,
      recipeId: 999,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('RECIPE_NOT_FOUND');
  });

  it('updates a meal entry', () => {
    const { recipe, plan } = seedPlanAndRecipe();
    const created = createMealEntry({
      mealPlanId: plan.id,
      dayOfWeek: 0,
      slotOrder: 0,
      recipeId: recipe.id,
    });
    if (!created.ok) throw new Error('should not fail');
    const updated = updateMealEntry(created.data.id, { portionWeight: 200 });
    expect(updated?.portionWeight).toBe(200);
  });

  it('returns undefined when updating non-existent entry', () => {
    expect(updateMealEntry(999, { portionWeight: 200 })).toBeUndefined();
  });

  it('deletes a meal entry', () => {
    const { recipe, plan } = seedPlanAndRecipe();
    const created = createMealEntry({
      mealPlanId: plan.id,
      dayOfWeek: 0,
      slotOrder: 0,
      recipeId: recipe.id,
    });
    if (!created.ok) throw new Error('should not fail');
    expect(deleteMealEntry(created.data.id)).toBe(true);
    expect(deleteMealEntry(created.data.id)).toBe(false);
  });
});
