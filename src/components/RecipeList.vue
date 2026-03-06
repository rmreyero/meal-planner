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
      class="block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-primary/50 transition-all"
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
            <h2 class="font-bold text-base">{{ recipe.name }}</h2>
            <div class="flex gap-1.5 mt-2 flex-wrap">
              <span
                v-for="tag in recipe.tags"
                :key="tag"
                class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              >{{ tag }}</span>
            </div>
          </div>
          <div class="flex items-start gap-1 shrink-0 ml-3">
            <div v-if="recipe.baseCalories" class="text-right">
              <div class="font-extrabold text-sm">{{ Math.round(recipe.baseCalories) }} <span class="text-[10px] text-slate-500 font-bold">kcal</span></div>
              <div class="text-xs text-primary font-bold">{{ recipe.baseProtein }}g prot</div>
            </div>
            <FavoriteButton :recipe-id="recipe.id" :initial="!!recipe.isFavorite" />
          </div>
        </div>
      </div>
    </a>
    <p v-if="filtered.length === 0" class="text-center text-slate-400 py-8 text-sm">
      No se encontraron recetas
    </p>
  </div>
</template>
