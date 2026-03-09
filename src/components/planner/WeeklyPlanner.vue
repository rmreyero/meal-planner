<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import RecipePicker from './RecipePicker.vue';
import DailyMacroSummary from './DailyMacroSummary.vue';
import MealEntryCard from './MealEntryCard.vue';
import DayTabs from './DayTabs.vue';
import Toast from '@/components/ui/Toast.vue';
import IconChevronLeft from '~icons/material-symbols/chevron-left';
import IconChevronRight from '~icons/material-symbols/chevron-right';
import IconFitnessCenter from '~icons/material-symbols/fitness-center';
import IconWeekend from '~icons/material-symbols/weekend-outline';
import IconAddCircle from '~icons/material-symbols/add-circle-outline';

interface MacroTarget {
  profileType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DAY_NAMES = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] as const;

const SLOT_SCHEMES: Record<number, string[]> = {
  1: ['Cena'],
  2: ['Comida', 'Cena'],
  3: ['Desayuno', 'Comida', 'Cena'],
  4: ['Desayuno', 'Comida', 'Merienda', 'Cena'],
};

function getSlotLabel(slotOrder: number, totalSlots: number): string {
  const scheme = SLOT_SCHEMES[totalSlots];
  if (scheme && slotOrder < scheme.length) return scheme[slotOrder];
  return `Comida ${slotOrder + 1}`;
}

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

interface RecipeOption {
  id: number;
  name: string;
  slug: string;
  baseCalories: number | null;
  baseProtein: number | null;
}

const props = defineProps<{
  initialWeek: string;
  recipes: RecipeOption[];
}>();

const weekStart = ref(props.initialWeek);
const planId = ref<number | null>(null);
const entries = ref<MealEntry[]>([]);
const activeDay = ref(0);
const loading = ref(false);
const showPicker = ref(false);
const editingLabel = ref<number | null>(null);
const macroTargets = ref<Record<string, MacroTarget>>({});
const trainingDays = ref<Record<number, boolean>>({});
const toast = ref<InstanceType<typeof Toast> | null>(null);

function formatLocalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shiftWeek(delta: number) {
  const d = new Date(weekStart.value + 'T00:00:00');
  d.setDate(d.getDate() + 7 * delta);
  weekStart.value = formatLocalDate(d);
}

const weekDisplay = computed(() => {
  const start = new Date(weekStart.value + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleDateString('es', { month: 'short' })}`;
  return `${fmt(start)} – ${fmt(end)}`;
});

const dayEntries = computed(() =>
  entries.value
    .filter((e) => e.dayOfWeek === activeDay.value)
    .sort((a, b) => a.slotOrder - b.slotOrder)
);

function dayHasEntries(dayIdx: number): boolean {
  return entries.value.some((e) => e.dayOfWeek === dayIdx);
}

function resolvedLabel(entry: MealEntry): string {
  if (entry.slotLabel) return entry.slotLabel;
  const totalForDay = entries.value.filter((e) => e.dayOfWeek === entry.dayOfWeek).length;
  return getSlotLabel(entry.slotOrder, totalForDay);
}

function entryMacros(entry: MealEntry) {
  if (!entry.baseCalories || !entry.basePortionWeight) return null;
  const ratio = (entry.portionWeight || entry.basePortionWeight) / entry.basePortionWeight;
  return {
    calories: Math.round(entry.baseCalories * ratio),
    protein: +(entry.baseProtein! * ratio).toFixed(1),
    carbs: +(entry.baseCarbs! * ratio).toFixed(1),
    fat: +(entry.baseFat! * ratio).toFixed(1),
  };
}

const dayTotals = computed(() => {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const e of dayEntries.value) {
    const m = entryMacros(e);
    if (m) { calories += m.calories; protein += m.protein; carbs += m.carbs; fat += m.fat; }
  }
  return { calories: Math.round(calories), protein: +protein.toFixed(1), carbs: +carbs.toFixed(1), fat: +fat.toFixed(1) };
});

const isTrainingDay = computed(() => trainingDays.value[activeDay.value] ?? false);

async function toggleTraining() {
  const newVal = !isTrainingDay.value;
  trainingDays.value[activeDay.value] = newVal;
  try {
    const promises = dayEntries.value.map((entry) =>
      fetch(`/api/meal-entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrainingDay: newVal }),
      })
    );
    await Promise.all(promises);
    toast.value?.show(newVal ? 'Dia de entreno' : 'Dia de descanso', 'success');
  } catch {
    trainingDays.value[activeDay.value] = !newVal;
    toast.value?.show('Error al cambiar tipo de dia', 'error');
  }
}

const activeDayTarget = computed(() => {
  const type = isTrainingDay.value ? 'training' : 'rest';
  const t = macroTargets.value[type];
  if (!t || !t.calories) return null;
  return t;
});

async function fetchWeek() {
  loading.value = true;
  try {
    const res = await fetch(`/api/meal-plans?week=${weekStart.value}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    planId.value = data.id;
    entries.value = data.entries;
    trainingDays.value = {};
    for (const e of data.entries) {
      if (e.isTrainingDay) trainingDays.value[e.dayOfWeek] = true;
    }
  } catch {
    toast.value?.show('Error al cargar el plan', 'error');
  } finally {
    loading.value = false;
  }
}

watch(weekStart, fetchWeek);
onMounted(async () => {
  await fetchWeek();
  try {
    const res = await fetch('/api/macro-targets');
    if (!res.ok) throw new Error();
    const targets: MacroTarget[] = await res.json();
    for (const t of targets) macroTargets.value[t.profileType] = t;
  } catch {
    // Macro targets are optional
  }
});

async function addMeal(recipe: RecipeOption) {
  showPicker.value = false;
  if (!planId.value) return;
  const daySlots = entries.value.filter((e) => e.dayOfWeek === activeDay.value);
  const slotOrder = daySlots.length;
  try {
    const res = await fetch('/api/meal-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealPlanId: planId.value,
        dayOfWeek: activeDay.value,
        slotOrder,
        recipeId: recipe.id,
      }),
    });
    if (!res.ok) throw new Error();
    await fetchWeek();
  } catch {
    toast.value?.show('Error al anadir comida', 'error');
  }
}

async function removeEntry(id: number) {
  const entry = entries.value.find((e) => e.id === id);
  if (!entry) return;
  const confirmed = window.confirm(`Eliminar "${entry.recipeName}"?`);
  if (!confirmed) return;
  try {
    const res = await fetch(`/api/meal-entries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    entries.value = entries.value.filter((e) => e.id !== id);
    toast.value?.show('Comida eliminada', 'success');
  } catch {
    toast.value?.show('Error al eliminar comida', 'error');
  }
}

async function updatePortion(entry: MealEntry, weight: number) {
  entry.portionWeight = weight;
  try {
    const res = await fetch(`/api/meal-entries/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portionWeight: weight }),
    });
    if (!res.ok) throw new Error();
  } catch {
    toast.value?.show('Error al actualizar porcion', 'error');
  }
}

async function saveLabel(entry: MealEntry, label: string) {
  editingLabel.value = null;
  const trimmed = label.trim() || null;
  entry.slotLabel = trimmed;
  try {
    const res = await fetch(`/api/meal-entries/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotLabel: trimmed }),
    });
    if (!res.ok) throw new Error();
  } catch {
    toast.value?.show('Error al guardar etiqueta', 'error');
  }
}
</script>

<template>
  <Toast ref="toast" />

  <!-- Week nav -->
  <div class="flex items-center justify-between mb-4">
    <button @click="shiftWeek(-1)" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
      <IconChevronLeft class="w-6 h-6 text-slate-500" />
    </button>
    <div class="flex flex-col items-center">
      <span class="text-sm font-bold">{{ weekDisplay }}</span>
    </div>
    <button @click="shiftWeek(1)" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
      <IconChevronRight class="w-6 h-6 text-slate-500" />
    </button>
  </div>

  <!-- Day tabs -->
  <DayTabs
    v-model:active-day="activeDay"
    :week-start="weekStart"
    :has-entries="dayHasEntries"
  />

  <!-- Day name + training toggle -->
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-extrabold text-lg">{{ DAY_NAMES[activeDay] }}</h3>
    <button
      @click="toggleTraining"
      class="text-xs px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1"
      :class="isTrainingDay
        ? 'bg-orange-500 text-white'
        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'"
    >
      <IconFitnessCenter v-if="isTrainingDay" class="w-4 h-4" />
      <IconWeekend v-else class="w-4 h-4" />
      {{ isTrainingDay ? 'Entreno' : 'Descanso' }}
    </button>
  </div>

  <!-- Loading -->
  <div v-if="loading" class="text-center text-slate-400 py-8 text-sm">Cargando...</div>

  <!-- Entries -->
  <div v-else class="space-y-3">
    <MealEntryCard
      v-for="entry in dayEntries"
      :key="entry.id"
      :entry="entry"
      :label="resolvedLabel(entry)"
      :is-editing-label="editingLabel === entry.id"
      @remove="removeEntry"
      @update:portion="updatePortion"
      @edit-label="editingLabel = $event"
      @save-label="saveLabel"
    />

    <!-- Daily macro summary -->
    <DailyMacroSummary
      v-if="dayEntries.length > 0"
      :actual="dayTotals"
      :target="activeDayTarget"
    />

    <!-- Add meal button -->
    <button
      @click="showPicker = true"
      class="w-full rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm text-slate-400 hover:border-primary/40 hover:text-primary font-bold transition-colors flex items-center justify-center gap-1"
    >
      <IconAddCircle class="w-5 h-5" />
      Anadir comida
    </button>
  </div>

  <!-- Recipe picker modal -->
  <RecipePicker
    v-if="showPicker"
    :recipes="recipes"
    @pick="addMeal"
    @cancel="showPicker = false"
  />
</template>
