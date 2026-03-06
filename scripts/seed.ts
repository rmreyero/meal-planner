import { readFileSync } from 'fs';
import { db, schema } from '../db/index';

interface SeedRecipe {
  name: string;
  category: string;
  servings: string | null;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  difficulty: string | null;
  ingredients: { group?: string; items: string[] }[];
  instructions: string[];
  notes: string[];
  tags: string[];
  sourceUrl: string | null;
  sourceName: string | null;
  basePortionWeight: number | null;
  baseCalories: number | null;
  baseProtein: number | null;
  baseCarbs: number | null;
  baseFat: number | null;
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const seedData: SeedRecipe[] = JSON.parse(readFileSync('db/seed.json', 'utf-8'));

console.log(`Loaded ${seedData.length} recipes from seed.json`);

db.delete(schema.recipes).run();

for (const recipe of seedData) {
  db.insert(schema.recipes).values({
    ...recipe,
    slug: slugify(recipe.name),
  }).run();
}

db.delete(schema.macroTargets).run();
db.insert(schema.macroTargets).values([
  { profileType: 'training', calories: 2500, protein: 180, carbs: 280, fat: 80 },
  { profileType: 'rest', calories: 2000, protein: 160, carbs: 200, fat: 70 },
]).run();

const all = db.select().from(schema.recipes).all();
console.log(`Seeded ${all.length} recipes into DB`);
for (const r of all) {
  console.log(`  - ${r.slug} [${r.category}] — ${r.baseCalories} kcal / ${r.basePortionWeight}g`);
}
console.log('Seeded 2 macro target profiles (training + rest)');
