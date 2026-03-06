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
    <div class="flex items-center gap-3 mb-4">
      <label class="text-sm font-bold text-slate-500 shrink-0">Porcion (g)</label>
      <input
        v-model.number="weight"
        type="number"
        min="10"
        step="10"
        class="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center font-bold outline-none focus:border-primary transition-colors"
      />
      <input
        v-model.number="weight"
        type="range"
        :min="Math.round(props.baseWeight * 0.25)"
        :max="Math.round(props.baseWeight * 3)"
        step="5"
        class="flex-1"
      />
    </div>
    <div class="grid grid-cols-4 gap-3">
      <div class="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-slate-100">
        <span class="text-primary text-xs font-bold">Calorias</span>
        <span class="text-lg font-extrabold">{{ macros.calories }}</span>
        <span class="text-[10px] text-slate-500 uppercase">kcal</span>
      </div>
      <div class="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-slate-100">
        <span class="text-primary text-xs font-bold">Proteina</span>
        <span class="text-lg font-extrabold">{{ macros.protein }}g</span>
        <span class="text-[10px] text-slate-500 uppercase">prot</span>
      </div>
      <div class="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-slate-100">
        <span class="text-primary text-xs font-bold">HC</span>
        <span class="text-lg font-extrabold">{{ macros.carbs }}g</span>
        <span class="text-[10px] text-slate-500 uppercase">carbs</span>
      </div>
      <div class="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-slate-100">
        <span class="text-primary text-xs font-bold">Grasas</span>
        <span class="text-lg font-extrabold">{{ macros.fat }}g</span>
        <span class="text-[10px] text-slate-500 uppercase">fat</span>
      </div>
    </div>
  </div>
</template>
