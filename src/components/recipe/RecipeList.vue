<script setup lang="ts">
import { ref, computed } from 'vue';
import RecipeFilters from './RecipeFilters.vue';
import IconFavorite from '~icons/material-symbols/favorite-rounded';
import IconSchedule from '~icons/material-symbols/schedule-outline';
import IconChevronRight from '~icons/material-symbols/chevron-right';
import BaseBadge from '@/components/ui/BaseBadge.vue';

interface Recipe {
  id: number;
  slug: string;
  name: string;
  tags: string[] | null;
  baseCalories: number | null;
  baseProtein: number | null;
  isFavorite: boolean | null;
  photoPath: string | null;
  totalTime: string | null;
  difficulty: string | null;
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

  <div class="flex flex-col mt-2">
    <a
      v-for="(recipe, idx) in filtered"
      :key="recipe.id"
      :href="`/recipes/${recipe.slug}`"
      class="flex gap-4 py-4 border-b border-slate-100 items-center"
    >
      <!-- Photo or gradient placeholder -->
      <div class="relative shrink-0">
        <img
          v-if="recipe.photoPath"
          :src="`/photos/${recipe.photoPath}?w=200&f=webp`"
          :alt="recipe.name"
          width="80"
          height="80"
          class="size-20 rounded-xl object-cover shadow-sm"
          :style="{ viewTransitionName: `recipe-photo-${recipe.id}` }"
          :loading="idx >= 10 ? 'lazy' : undefined"
        />
        <div
          v-else
          class="flex items-center justify-center size-20 rounded-xl bg-gradient-to-br from-primary/15 to-primary/35 text-primary shadow-sm"
          :style="{ viewTransitionName: `recipe-photo-${recipe.id}` }"
        >
          <span class="text-2xl font-bold">{{ recipe.name.charAt(0) }}</span>
        </div>
        <IconFavorite
          v-if="recipe.isFavorite"
          class="text-primary w-4 h-4 absolute -top-1.5 -right-1.5 drop-shadow-sm"
        />
      </div>

      <!-- Info -->
      <div class="flex flex-1 flex-col justify-center min-w-0">
        <h3 class="text-base font-bold leading-tight text-slate-900">{{ recipe.name }}</h3>
        <div class="flex items-center gap-2 mt-1" v-if="recipe.totalTime || recipe.difficulty">
          <span v-if="recipe.totalTime" class="text-slate-500 text-xs flex items-center gap-1">
            <IconSchedule class="w-4 h-4" /> {{ recipe.totalTime }}
          </span>
          <span v-if="recipe.totalTime && recipe.difficulty" class="text-slate-300">&bull;</span>
          <span v-if="recipe.difficulty" class="text-slate-500 text-xs">{{ recipe.difficulty }}</span>
        </div>
        <div class="flex items-center gap-2 mt-1">
          <BaseBadge v-if="recipe.baseCalories" size="sm">
            {{ Math.round(recipe.baseCalories) }} Kcal
          </BaseBadge>
          <BaseBadge v-if="recipe.baseProtein" variant="secondary" size="sm">
            {{ recipe.baseProtein }}g Prot
          </BaseBadge>
        </div>
      </div>

      <!-- Chevron -->
      <div class="shrink-0 text-slate-400">
        <IconChevronRight class="w-6 h-6" />
      </div>
    </a>

    <p v-if="filtered.length === 0" class="text-center text-slate-400 py-8 text-sm">
      No se encontraron recetas
    </p>
  </div>
</template>

