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
      v-for="(recipe, idx) in filtered"
      :key="recipe.id"
      :href="`/recipes/${recipe.slug}`"
      class="recipe-card block bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      :style="{ animationDelay: `${idx * 40}ms` }"
    >
      <div class="flex">
        <!-- Thumbnail -->
        <img
          v-if="recipe.photoPath"
          :src="`/photos/${recipe.photoPath}?w=200&f=webp`"
          :alt="recipe.name"
          class="w-20 h-20 object-cover shrink-0 self-center ml-3 rounded-lg"
          loading="lazy"
        />
        <div class="flex-1 p-4 min-w-0">
          <div class="flex justify-between items-start">
            <div class="min-w-0">
              <h2 class="font-bold text-base md:text-lg leading-snug">{{ recipe.name }}</h2>
              <div class="flex gap-1.5 mt-1.5 flex-wrap">
                <span
                  v-for="tag in recipe.tags"
                  :key="tag"
                  class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                >{{ tag }}</span>
              </div>
            </div>
            <div class="flex items-start gap-1 shrink-0 ml-3">
              <div v-if="recipe.baseCalories" class="text-right bg-surface-alt rounded-lg px-2 py-1">
                <div class="font-extrabold text-sm">{{ Math.round(recipe.baseCalories) }} <span class="text-[10px] text-slate-500 font-bold">kcal</span></div>
                <div class="text-xs text-primary font-bold">{{ recipe.baseProtein }}g prot</div>
              </div>
              <FavoriteButton :recipe-id="recipe.id" :initial="!!recipe.isFavorite" />
            </div>
          </div>
        </div>
      </div>
    </a>
    <p v-if="filtered.length === 0" class="text-center text-slate-400 py-8 text-sm">
      No se encontraron recetas
    </p>
  </div>
</template>

<style scoped>
.recipe-card {
  animation: fade-up 0.3s ease both;
}
</style>
