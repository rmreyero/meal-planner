<script setup lang="ts">
import { computed } from 'vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import IconClose from '~icons/material-symbols/close';

interface MealEntry {
  id: number;
  dayOfWeek: number;
  slotLabel: string | null;
  slotOrder: number;
  recipeId: number;
  portionWeight: number | null;
  isTrainingDay: boolean | null;
  recipeName: string;
  recipeSlug: string;
  basePortionWeight: number | null;
  baseCalories: number | null;
  baseProtein: number | null;
  baseCarbs: number | null;
  baseFat: number | null;
}

const props = defineProps<{
  entry: MealEntry;
  label: string;
  isEditingLabel: boolean;
}>();

const emit = defineEmits<{
  remove: [id: number];
  'update:portion': [entry: MealEntry, weight: number];
  'edit-label': [id: number];
  'save-label': [entry: MealEntry, label: string];
}>();

const macros = computed(() => {
  if (!props.entry.baseCalories || !props.entry.basePortionWeight) return null;
  const ratio = (props.entry.portionWeight || props.entry.basePortionWeight) / props.entry.basePortionWeight;
  return {
    calories: Math.round(props.entry.baseCalories * ratio),
    protein: +(props.entry.baseProtein! * ratio).toFixed(1),
    carbs: +(props.entry.baseCarbs! * ratio).toFixed(1),
    fat: +(props.entry.baseFat! * ratio).toFixed(1),
  };
});
</script>

<template>
  <BaseCard padding="sm" class="hover:border-primary/30 transition-all">
    <div class="flex items-start justify-between mb-2">
      <div class="min-w-0">
        <!-- Editable slot label -->
        <div v-if="isEditingLabel" class="mb-1">
          <input
            :value="entry.slotLabel || label"
            @blur="emit('save-label', entry, ($event.target as HTMLInputElement).value)"
            @keyup.enter="($event.target as HTMLInputElement).blur()"
            class="text-base font-black uppercase text-primary bg-primary/10 rounded-lg px-2 py-1 outline-none border border-primary/20 w-28"
            autofocus
          />
        </div>
        <button
          v-else
          @click="emit('edit-label', entry.id)"
          class="text-[10px] font-black uppercase text-primary mb-1 hover:underline"
        >
          {{ label }}
        </button>

        <a :href="`/recipes/${entry.recipeSlug}`" class="block text-sm font-bold hover:text-primary transition-colors">
          {{ entry.recipeName }}
        </a>
      </div>
      <button @click="emit('remove', entry.id)" class="text-slate-300 hover:text-red-400 p-1 shrink-0 transition-colors">
        <IconClose class="w-5 h-5" />
      </button>
    </div>

    <!-- Portion weight -->
    <div v-if="entry.basePortionWeight" class="flex items-center gap-2 mb-2">
      <label class="text-xs text-slate-400 shrink-0 font-bold">g</label>
      <input
        :value="entry.portionWeight || entry.basePortionWeight"
        @change="emit('update:portion', entry, Number(($event.target as HTMLInputElement).value))"
        type="number"
        min="10"
        step="10"
        class="w-20 rounded-lg border border-border px-1.5 py-0.5 text-base text-center font-bold outline-none focus:border-primary transition-colors"
      />
      <div class="flex-1 flex items-center gap-1">
        <span class="text-[10px] text-slate-400">{{ Math.round(entry.basePortionWeight * 0.25) }}g</span>
        <input
          :value="entry.portionWeight || entry.basePortionWeight"
          @input="emit('update:portion', entry, Number(($event.target as HTMLInputElement).value))"
          type="range"
          :min="Math.round(entry.basePortionWeight * 0.25)"
          :max="Math.round(entry.basePortionWeight * 3)"
          step="5"
          class="flex-1"
        />
        <span class="text-[10px] text-slate-400">{{ Math.round(entry.basePortionWeight * 3) }}g</span>
      </div>
    </div>

    <!-- Macros -->
    <div v-if="macros" class="flex gap-3 text-[11px] font-medium text-slate-500">
      <span>{{ macros.calories }} kcal</span>
      <span class="text-primary font-bold">{{ macros.protein }}g P</span>
      <span>{{ macros.carbs }}g HC</span>
      <span>{{ macros.fat }}g G</span>
    </div>
  </BaseCard>
</template>
