<script setup lang="ts">
import { ref, computed } from 'vue';
import RecipeFilters from './RecipeFilters.vue';
import FavoriteButton from './FavoriteButton.vue';

interface Recipe {
  id: number;
  slug: string;
  name: string;
  tags: string[] | null;
  baseCalories: number | null;
  baseProtein: number | null;
  isFavorite: boolean | null;
  photoPath: string | null;
}

const props = defineProps<{
  recipes: Recipe[];
}>();

const search = ref('');
const selectedTag = ref('');

const allTags = computed(() => {
  const tagSet = new Set<string>();
  for (const r of props.recipes) {
    r.tags?.forEach((t) => tagSet.add(t));
  }
  return [...tagSet];
});

const filtered = computed(() => {
  let list = props.recipes;
  if (selectedTag.value) {
    list = list.filter((r) => r.tags?.includes(selectedTag.value));
  }
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter((r) => r.name.toLowerCase().includes(q));
  }
  return list;
});

function onFilter(f: { search: string; tag: string }) {
  search.value = f.search;
  selectedTag.value = f.tag;
}
</script>

<template>
  <RecipeFilters :tags="allTags" @filter="onFilter" />

  <div class="space-y-3 mt-4">
    <a
      v-for="recipe in filtered"
      :key="recipe.id"
      :href="`/recipes/${recipe.slug}`"
      class="block rounded-lg border border-gray-200 overflow-hidden hover:border-emerald-300 transition-colors"
    >
      <img
        v-if="recipe.photoPath"
        :src="`/photos/${recipe.photoPath}?w=400&f=webp`"
        :alt="recipe.name"
        class="w-full h-40 object-cover"
        loading="lazy"
      />
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div class="min-w-0">
            <h2 class="font-semibold text-lg">{{ recipe.name }}</h2>
            <div class="flex gap-2 mt-1 flex-wrap">
              <span
                v-for="tag in recipe.tags"
                :key="tag"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >{{ tag }}</span>
            </div>
          </div>
          <div class="flex items-start gap-1 shrink-0 ml-3">
            <div v-if="recipe.baseCalories" class="text-right text-sm text-gray-500">
              <div class="font-medium text-gray-900">{{ Math.round(recipe.baseCalories) }} kcal</div>
              <div>{{ recipe.baseProtein }}g prot</div>
            </div>
            <FavoriteButton :recipe-id="recipe.id" :initial="!!recipe.isFavorite" />
          </div>
        </div>
      </div>
    </a>
    <p v-if="filtered.length === 0" class="text-center text-gray-400 py-8">
      No se encontraron recetas
    </p>
  </div>
</template>
