<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  baseWeight: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}>();

const weight = ref(props.baseWeight);

const ratio = computed(() => weight.value / props.baseWeight);

const macros = computed(() => ({
  calories: Math.round(props.baseCalories * ratio.value),
  protein: +(props.baseProtein * ratio.value).toFixed(1),
  carbs: +(props.baseCarbs * ratio.value).toFixed(1),
  fat: +(props.baseFat * ratio.value).toFixed(1),
}));
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-3">
      <label class="text-sm text-gray-500 shrink-0">Porcion (g)</label>
      <input
        v-model.number="weight"
        type="number"
        min="10"
        step="10"
        class="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center outline-none focus:border-emerald-400 transition-colors"
      />
      <input
        v-model.number="weight"
        type="range"
        :min="Math.round(props.baseWeight * 0.25)"
        :max="Math.round(props.baseWeight * 3)"
        step="5"
        class="flex-1 accent-emerald-600"
      />
    </div>
    <div class="grid grid-cols-4 gap-2 text-center">
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-lg font-semibold">{{ macros.calories }}</div>
        <div class="text-xs text-gray-500">kcal</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-lg font-semibold">{{ macros.protein }}g</div>
        <div class="text-xs text-gray-500">proteina</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-lg font-semibold">{{ macros.carbs }}g</div>
        <div class="text-xs text-gray-500">HC</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-lg font-semibold">{{ macros.fat }}g</div>
        <div class="text-xs text-gray-500">grasa</div>
      </div>
    </div>
  </div>
</template>
