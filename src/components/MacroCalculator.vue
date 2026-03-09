<script setup lang="ts">
import { ref, computed } from 'vue';
import MacroStatCard from './ui/MacroStatCard.vue';
import IconRemove from '~icons/material-symbols/remove';
import IconAdd from '~icons/material-symbols/add';

const props = defineProps<{
  baseWeight: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}>();

const weight = ref(props.baseWeight);
const step = 10;

function decrement() {
  weight.value = Math.max(step, weight.value - step);
}

function increment() {
  weight.value = weight.value + step;
}

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
    <!-- Stepper for grams -->
    <div class="flex items-center justify-between mb-6">
      <p class="font-bold">Porcion (g)</p>
      <div class="flex items-center bg-white rounded-full border border-primary/20 p-1 shadow-sm">
        <button
          @click="decrement"
          class="size-8 flex items-center justify-center text-primary rounded-full hover:bg-primary/10 transition-colors"
        >
          <IconRemove class="w-6 h-6" />
        </button>
        <input
          v-model.number="weight"
          type="number"
          min="10"
          step="10"
          class="w-16 text-center font-bold text-lg border-none bg-transparent outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          @click="increment"
          class="size-8 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
        >
          <IconAdd class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Macro grid -->
    <div class="grid grid-cols-4 gap-3">
      <MacroStatCard label="Calorias" :value="macros.calories" unit="kcal" />
      <MacroStatCard label="Proteina" :value="macros.protein + 'g'" unit="prot" />
      <MacroStatCard label="HC" :value="macros.carbs + 'g'" unit="carbs" />
      <MacroStatCard label="Grasas" :value="macros.fat + 'g'" unit="fat" />
    </div>
  </div>
</template>
