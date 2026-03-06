<script setup lang="ts">
import { computed } from 'vue';

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const props = defineProps<{
  actual: Macros;
  target: Macros | null;
}>();

const fields = computed(() => [
  { label: 'kcal', actual: props.actual.calories, target: props.target?.calories },
  { label: 'prot', actual: props.actual.protein, target: props.target?.protein, unit: 'g' },
  { label: 'HC', actual: props.actual.carbs, target: props.target?.carbs, unit: 'g' },
  { label: 'grasa', actual: props.actual.fat, target: props.target?.fat, unit: 'g' },
]);

function pct(actual: number, target: number | undefined): number {
  if (!target) return 0;
  return Math.min((actual / target) * 100, 100);
}

function barColor(actual: number, target: number | undefined): string {
  if (!target) return 'bg-gray-300';
  const ratio = actual / target;
  if (ratio > 1.1) return 'bg-red-400';
  if (ratio > 0.9) return 'bg-emerald-500';
  return 'bg-emerald-400';
}
</script>

<template>
  <div class="rounded-lg bg-gray-50 p-3 space-y-2">
    <div v-for="f in fields" :key="f.label" class="flex items-center gap-2">
      <span class="text-xs text-gray-500 w-10 shrink-0">{{ f.label }}</span>
      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          v-if="f.target"
          class="h-full rounded-full transition-all"
          :class="barColor(f.actual, f.target)"
          :style="{ width: pct(f.actual, f.target) + '%' }"
        ></div>
      </div>
      <span class="text-xs text-gray-600 w-24 text-right shrink-0">
        {{ Math.round(f.actual) }}{{ f.unit || '' }}
        <span v-if="f.target" class="text-gray-400">/ {{ f.target }}{{ f.unit || '' }}</span>
      </span>
    </div>
  </div>
</template>
