<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import IconClose from '~icons/material-symbols/close';
import IconSearch from '~icons/material-symbols/search';

interface RecipeOption {
  id: number;
  name: string;
  slug: string;
  baseCalories: number | null;
  baseProtein: number | null;
}

const props = defineProps<{
  recipes: RecipeOption[];
}>();

const emit = defineEmits<{
  pick: [recipe: RecipeOption];
  cancel: [];
}>();

const search = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const filtered = computed(() => {
  if (!search.value) return props.recipes;
  const q = search.value.toLowerCase();
  return props.recipes.filter((r) => r.name.toLowerCase().includes(q));
});

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('cancel');
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  searchInput.value?.focus();
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Elegir receta" @click.self="emit('cancel')">
    <div class="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[70vh] flex flex-col shadow-xl">
      <div class="p-4 border-b border-slate-100">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-extrabold text-lg">Elegir receta</h3>
          <button @click="emit('cancel')" class="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <IconClose class="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div class="flex items-stretch rounded-xl bg-bg border border-border overflow-hidden">
          <div class="flex items-center justify-center pl-3 text-slate-400">
            <IconSearch class="w-5 h-5" />
          </div>
          <input
            ref="searchInput"
            v-model="search"
            type="search"
            placeholder="Buscar..."
            class="flex-1 border-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <div class="overflow-y-auto flex-1">
        <button
          v-for="recipe in filtered"
          :key="recipe.id"
          @click="emit('pick', recipe)"
          class="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-slate-50 flex justify-between items-center transition-colors"
        >
          <span class="text-sm font-medium">{{ recipe.name }}</span>
          <span v-if="recipe.baseCalories" class="text-xs text-slate-400 shrink-0 ml-2 font-bold">
            {{ Math.round(recipe.baseCalories) }} kcal
          </span>
        </button>
        <p v-if="filtered.length === 0" class="text-center text-slate-400 py-6 text-sm">
          Sin resultados
        </p>
      </div>
    </div>
  </div>
</template>
