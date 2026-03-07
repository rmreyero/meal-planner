import { db, schema } from '@db/index';
import { like, and, sql, eq } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { ok, err, type Result } from './types';
import type { Recipe } from '@db/schema';

export function listRecipes(opts?: { tag?: string; search?: string }): Recipe[] {
  const conditions = [];
  if (opts?.search) {
    conditions.push(like(schema.recipes.name, `%${opts.search}%`));
  }
  if (opts?.tag) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${schema.recipes.tags}) WHERE json_each.value = ${opts.tag})`
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(schema.recipes).where(where).all();
}

export function listRecipeSummaries() {
  return db.select({
    id: schema.recipes.id,
    slug: schema.recipes.slug,
    name: schema.recipes.name,
    tags: schema.recipes.tags,
    baseCalories: schema.recipes.baseCalories,
    baseProtein: schema.recipes.baseProtein,
    isFavorite: schema.recipes.isFavorite,
    photoPath: schema.recipes.photoPath,
    totalTime: schema.recipes.totalTime,
    difficulty: schema.recipes.difficulty,
  }).from(schema.recipes).all();
}

export function listRecipePickerItems() {
  return db.select({
    id: schema.recipes.id,
    name: schema.recipes.name,
    slug: schema.recipes.slug,
    baseCalories: schema.recipes.baseCalories,
    baseProtein: schema.recipes.baseProtein,
  }).from(schema.recipes).all();
}

export function getRecipeById(id: number): Recipe | undefined {
  return db.select().from(schema.recipes).where(eq(schema.recipes.id, id)).get();
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return db.select().from(schema.recipes).where(eq(schema.recipes.slug, slug)).get();
}

export function createRecipe(data: Record<string, unknown>): Result<Recipe, 'DUPLICATE'> {
  const { name, ...rest } = data;
  const slug = slugify(name as string);

  const existing = db.select({ id: schema.recipes.id })
    .from(schema.recipes)
    .where(sql`${schema.recipes.slug} = ${slug}`)
    .get();

  if (existing) {
    return err('DUPLICATE', 'Recipe with this name already exists');
  }

  const result = db.insert(schema.recipes)
    .values({ ...rest, name: name as string, slug } as typeof schema.recipes.$inferInsert)
    .returning()
    .get();

  return ok(result);
}

export function updateRecipe(id: number, fields: Record<string, unknown>): Recipe | undefined {
  const existing = db.select({ id: schema.recipes.id })
    .from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  if (!existing) return undefined;

  return db.update(schema.recipes)
    .set({ ...fields, updatedAt: new Date().toISOString() })
    .where(eq(schema.recipes.id, id))
    .returning()
    .get();
}

export function toggleFavorite(id: number): { isFavorite: boolean } | undefined {
  const recipe = db.select({ isFavorite: schema.recipes.isFavorite })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .get();

  if (!recipe) return undefined;

  const newValue = !recipe.isFavorite;
  db.update(schema.recipes)
    .set({ isFavorite: newValue })
    .where(eq(schema.recipes.id, id))
    .run();

  return { isFavorite: newValue };
}

export function setRecipePhoto(id: number, filename: string): boolean {
  const existing = db.select({ id: schema.recipes.id })
    .from(schema.recipes).where(eq(schema.recipes.id, id)).get();
  if (!existing) return false;

  db.update(schema.recipes)
    .set({ photoPath: filename, updatedAt: new Date().toISOString() })
    .where(eq(schema.recipes.id, id))
    .run();

  return true;
}
