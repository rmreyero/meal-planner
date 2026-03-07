import { describe, it, expect } from 'vitest';
import { createRecipe, listRecipes, getRecipeById, getRecipeBySlug, toggleFavorite, updateRecipe } from './recipes';

const validRecipe = {
  name: 'Pollo al horno',
  category: 'principal',
  ingredients: [{ items: ['1 pollo'] }],
  instructions: ['Hornear'],
};

describe('recipes', () => {
  it('creates a recipe with auto-generated slug', () => {
    const result = createRecipe(validRecipe);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.slug).toBe('pollo-al-horno');
      expect(result.data.name).toBe('Pollo al horno');
    }
  });

  it('rejects duplicate recipe names', () => {
    createRecipe(validRecipe);
    const result = createRecipe(validRecipe);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('DUPLICATE');
    }
  });

  it('lists all recipes', () => {
    createRecipe(validRecipe);
    createRecipe({ ...validRecipe, name: 'Arroz con pollo' });
    expect(listRecipes()).toHaveLength(2);
  });

  it('filters by search term', () => {
    createRecipe(validRecipe);
    createRecipe({ ...validRecipe, name: 'Arroz con pollo' });
    expect(listRecipes({ search: 'Arroz' })).toHaveLength(1);
  });

  it('gets recipe by id', () => {
    const result = createRecipe(validRecipe);
    if (!result.ok) throw new Error('should not fail');
    const recipe = getRecipeById(result.data.id);
    expect(recipe?.name).toBe('Pollo al horno');
  });

  it('gets recipe by slug', () => {
    createRecipe(validRecipe);
    const recipe = getRecipeBySlug('pollo-al-horno');
    expect(recipe?.name).toBe('Pollo al horno');
  });

  it('returns undefined for non-existent id', () => {
    expect(getRecipeById(999)).toBeUndefined();
  });

  it('toggles favorite', () => {
    const result = createRecipe(validRecipe);
    if (!result.ok) throw new Error('should not fail');
    const toggled = toggleFavorite(result.data.id);
    expect(toggled?.isFavorite).toBe(true);
    const toggled2 = toggleFavorite(result.data.id);
    expect(toggled2?.isFavorite).toBe(false);
  });

  it('returns undefined when toggling non-existent recipe', () => {
    expect(toggleFavorite(999)).toBeUndefined();
  });

  it('updates recipe fields', () => {
    const result = createRecipe(validRecipe);
    if (!result.ok) throw new Error('should not fail');
    const updated = updateRecipe(result.data.id, { category: 'entrante' });
    expect(updated?.category).toBe('entrante');
  });

  it('returns undefined when updating non-existent recipe', () => {
    expect(updateRecipe(999, { category: 'entrante' })).toBeUndefined();
  });

  it('toggleFavorite works on recipe with default false value', () => {
    const result = createRecipe(validRecipe);
    if (!result.ok) throw new Error('should not fail');
    // isFavorite defaults to false
    expect(result.data.isFavorite).toBe(false);
    // First toggle -> true
    const toggled = toggleFavorite(result.data.id);
    expect(toggled?.isFavorite).toBe(true);
    // Verify persisted
    const recipe = getRecipeById(result.data.id);
    expect(recipe?.isFavorite).toBe(true);
  });
});
