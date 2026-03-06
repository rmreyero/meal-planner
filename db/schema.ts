import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export interface IngredientGroup {
  group?: string;
  items: string[];
}

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  servings: text('servings'),
  prepTime: text('prep_time'),
  cookTime: text('cook_time'),
  totalTime: text('total_time'),
  difficulty: text('difficulty'),
  ingredients: text('ingredients', { mode: 'json' }).notNull().$type<IngredientGroup[]>(),
  instructions: text('instructions', { mode: 'json' }).notNull().$type<string[]>(),
  notes: text('notes', { mode: 'json' }).$type<string[]>(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  sourceUrl: text('source_url'),
  sourceName: text('source_name'),
  basePortionWeight: integer('base_portion_weight'),
  baseCalories: real('base_calories'),
  baseProtein: real('base_protein'),
  baseCarbs: real('base_carbs'),
  baseFat: real('base_fat'),
  photoPath: text('photo_path'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const macroTargets = sqliteTable('macro_targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileType: text('profile_type').notNull(),
  calories: real('calories'),
  protein: real('protein'),
  carbs: real('carbs'),
  fat: real('fat'),
});

export const mealPlans = sqliteTable('meal_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weekStart: text('week_start').notNull().unique(),
});

export const mealEntries = sqliteTable('meal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mealPlanId: integer('meal_plan_id').notNull().references(() => mealPlans.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  slotLabel: text('slot_label'),
  slotOrder: integer('slot_order').notNull(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id),
  portionWeight: integer('portion_weight'),
  isTrainingDay: integer('is_training_day', { mode: 'boolean' }).default(false),
});

export type Recipe = InferSelectModel<typeof recipes>;
export type NewRecipe = InferInsertModel<typeof recipes>;
export type MacroTarget = InferSelectModel<typeof macroTargets>;
export type MealPlan = InferSelectModel<typeof mealPlans>;
export type MealEntry = InferSelectModel<typeof mealEntries>;
