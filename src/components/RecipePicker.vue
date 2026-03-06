<script setup lang="ts">
import { ref, computed } from 'vue';

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

const filtered = computed(() => {
  if (!search.value) return props.recipes;
  const q = search.value.toLowerCase();
  return props.recipes.filter((r) => r.name.toLowerCase().includes(q));
});
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" @click.self="emit('cancel')">
    <div class="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[70vh] flex flex-col">
      <div class="p-4 border-b border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold">Elegir receta</h3>
          <button @click="emit('cancel')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <input
          v-model="search"
          type="search"
          placeholder="Buscar..."
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
          autofocus
        />
      </div>
      <div class="overflow-y-auto flex-1">
        <button
          v-for="recipe in filtered"
          :key="recipe.id"
          @click="emit('pick', recipe)"
          class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex justify-between items-center"
        >
          <span class="text-sm">{{ recipe.name }}</span>
          <span v-if="recipe.baseCalories" class="text-xs text-gray-400 shrink-0 ml-2">
            {{ Math.round(recipe.baseCalories) }} kcal
          </span>
        </button>
        <p v-if="filtered.length === 0" class="text-center text-gray-400 py-6 text-sm">
          Sin resultados
        </p>
      </div>
    </div>
  </div>
</template>
