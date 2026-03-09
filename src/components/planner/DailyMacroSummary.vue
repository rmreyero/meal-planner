<script setup lang="ts">
import { computed } from 'vue';
import BaseCard from '@/components/ui/BaseCard.vue';

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

function pctLabel(actual: number, target: number | undefined): string {
  if (!target) return '';
  return `${Math.round((actual / target) * 100)}%`;
}

function barColor(actual: number, target: number | undefined): string {
  if (!target) return 'bg-slate-300';
  const ratio = actual / target;
  if (ratio > 1.1) return 'bg-red-400';
  if (ratio >= 0.9) return 'bg-success';
  return 'bg-amber-400';
}
</script>

<template>
  <BaseCard variant="highlight" class="space-y-2.5">
    <p class="text-[10px] font-black text-primary uppercase text-center mb-1">Total Diario</p>
    <div v-for="f in fields" :key="f.label" class="flex items-center gap-2">
      <span class="text-xs text-slate-500 w-10 shrink-0 font-bold">{{ f.label }}</span>
      <div class="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          v-if="f.target"
          class="h-full rounded-full macro-bar"
          :class="barColor(f.actual, f.target)"
          :style="{ width: pct(f.actual, f.target) + '%' }"
        ></div>
      </div>
      <span v-if="f.target" class="text-[10px] font-bold w-9 text-center shrink-0" :class="barColor(f.actual, f.target).replace('bg-', 'text-')">
        {{ pctLabel(f.actual, f.target) }}
      </span>
      <span class="text-xs font-bold w-24 text-right shrink-0">
        {{ Math.round(f.actual) }}{{ f.unit || '' }}
        <span v-if="f.target" class="text-slate-400 font-medium">/ {{ f.target }}{{ f.unit || '' }}</span>
      </span>
    </div>
  </BaseCard>
</template>
