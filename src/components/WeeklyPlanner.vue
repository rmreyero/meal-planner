<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import RecipePicker from './RecipePicker.vue';
import DailyMacroSummary from './DailyMacroSummary.vue';

interface MacroTarget {
  profileType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

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

// Week navigation
function shiftWeek(delta: number) {
  const d = new Date(weekStart.value + 'T00:00:00');
  d.setDate(d.getDate() + 7 * delta);
  weekStart.value = d.toISOString().split('T')[0];
}

const weekDisplay = computed(() => {
  const start = new Date(weekStart.value + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleDateString('es', { month: 'short' })}`;
  return `${fmt(start)} – ${fmt(end)}`;
});

// Day date display
function dayDate(dayIdx: number): string {
  const d = new Date(weekStart.value + 'T00:00:00');
  d.setDate(d.getDate() + dayIdx);
  return `${d.getDate()}`;
}

// Entries for active day
const dayEntries = computed(() =>
  entries.value
    .filter((e) => e.dayOfWeek === activeDay.value)
    .sort((a, b) => a.slotOrder - b.slotOrder)
);

// Has entries for a day (for dot indicator)
function dayHasEntries(dayIdx: number): boolean {
  return entries.value.some((e) => e.dayOfWeek === dayIdx);
}

// Slot label resolution
function resolvedLabel(entry: MealEntry): string {
  if (entry.slotLabel) return entry.slotLabel;
  const totalForDay = entries.value.filter((e) => e.dayOfWeek === entry.dayOfWeek).length;
  return getSlotLabel(entry.slotOrder, totalForDay);
}

// Macro calc for entry
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

// Day totals
const dayTotals = computed(() => {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const e of dayEntries.value) {
    const m = entryMacros(e);
    if (m) { calories += m.calories; protein += m.protein; carbs += m.carbs; fat += m.fat; }
  }
  return { calories: Math.round(calories), protein: +protein.toFixed(1), carbs: +carbs.toFixed(1), fat: +fat.toFixed(1) };
});

// Training day toggle
const isTrainingDay = computed(() => trainingDays.value[activeDay.value] ?? false);

async function toggleTraining() {
  const newVal = !isTrainingDay.value;
  trainingDays.value[activeDay.value] = newVal;
  // Update all entries for this day
  for (const entry of dayEntries.value) {
    fetch(`/api/meal-entries/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTrainingDay: newVal }),
    });
  }
}

// Active day's macro target based on training/rest
const activeDayTarget = computed(() => {
  const type = isTrainingDay.value ? 'training' : 'rest';
  const t = macroTargets.value[type];
  if (!t || !t.calories) return null;
  return t;
});

// Fetch week data
async function fetchWeek() {
  loading.value = true;
  const res = await fetch(`/api/meal-plans?week=${weekStart.value}`);
  const data = await res.json();
  planId.value = data.id;
  entries.value = data.entries;
  // Extract training day state from entries
  trainingDays.value = {};
  for (const e of data.entries) {
    if (e.isTrainingDay) trainingDays.value[e.dayOfWeek] = true;
  }
  loading.value = false;
}

watch(weekStart, fetchWeek);
onMounted(async () => {
  await fetchWeek();
  // Fetch macro targets
  const res = await fetch('/api/macro-targets');
  const targets: MacroTarget[] = await res.json();
  for (const t of targets) macroTargets.value[t.profileType] = t;
});

// Add meal
async function addMeal(recipe: RecipeOption) {
  showPicker.value = false;
  if (!planId.value) return;

  const daySlots = entries.value.filter((e) => e.dayOfWeek === activeDay.value);
  const slotOrder = daySlots.length;

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

  if (res.ok) await fetchWeek();
}

// Remove entry
async function removeEntry(id: number) {
  const res = await fetch(`/api/meal-entries/${id}`, { method: 'DELETE' });
  if (res.ok) entries.value = entries.value.filter((e) => e.id !== id);
}

// Update portion weight
async function updatePortion(entry: MealEntry, weight: number) {
  entry.portionWeight = weight;
  await fetch(`/api/meal-entries/${entry.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portionWeight: weight }),
  });
}

// Update slot label
async function saveLabel(entry: MealEntry, label: string) {
  editingLabel.value = null;
  const trimmed = label.trim() || null;
  entry.slotLabel = trimmed;
  await fetch(`/api/meal-entries/${entry.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotLabel: trimmed }),
  });
}
</script>

<template>
  <!-- Week nav -->
  <div class="flex items-center justify-between mb-4">
    <button @click="shiftWeek(-1)" class="p-2 text-gray-400 hover:text-gray-600">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </button>
    <span class="text-sm font-medium text-gray-700">{{ weekDisplay }}</span>
    <button @click="shiftWeek(1)" class="p-2 text-gray-400 hover:text-gray-600">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  </div>

  <!-- Day tabs -->
  <div class="flex border-b border-gray-200 mb-4">
    <button
      v-for="(label, idx) in DAY_LABELS"
      :key="idx"
      @click="activeDay = idx"
      class="flex-1 py-2 text-center text-sm relative transition-colors"
      :class="activeDay === idx
        ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600'
        : 'text-gray-400 hover:text-gray-600'"
    >
      <div>{{ label }}</div>
      <div class="text-xs" :class="activeDay === idx ? 'text-emerald-500' : 'text-gray-300'">{{ dayDate(idx) }}</div>
      <div
        v-if="dayHasEntries(idx) && activeDay !== idx"
        class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400"
      ></div>
    </button>
  </div>

  <!-- Day name + training toggle -->
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-semibold text-gray-700">{{ DAY_NAMES[activeDay] }}</h3>
    <button
      @click="toggleTraining"
      class="text-xs px-3 py-1 rounded-full border transition-colors"
      :class="isTrainingDay
        ? 'bg-orange-500 text-white border-orange-500'
        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'"
    >
      {{ isTrainingDay ? 'Entreno' : 'Descanso' }}
    </button>
  </div>

  <!-- Loading -->
  <div v-if="loading" class="text-center text-gray-400 py-8 text-sm">Cargando...</div>

  <!-- Entries -->
  <div v-else class="space-y-3">
    <div
      v-for="entry in dayEntries"
      :key="entry.id"
      class="rounded-lg border border-gray-200 p-3"
    >
      <div class="flex items-start justify-between mb-2">
        <div class="min-w-0">
          <!-- Editable slot label -->
          <div
            v-if="editingLabel === entry.id"
            class="mb-1"
          >
            <input
              :value="entry.slotLabel || resolvedLabel(entry)"
              @blur="saveLabel(entry, ($event.target as HTMLInputElement).value)"
              @keyup.enter="($event.target as HTMLInputElement).blur()"
              class="text-xs font-medium text-emerald-600 bg-emerald-50 rounded px-2 py-0.5 outline-none border border-emerald-200 w-28"
              autofocus
            />
          </div>
          <button
            v-else
            @click="editingLabel = entry.id"
            class="text-xs font-medium text-emerald-600 mb-1 hover:underline"
          >
            {{ resolvedLabel(entry) }}
          </button>

          <a :href="`/recipes/${entry.recipeSlug}`" class="block text-sm font-medium hover:text-emerald-600 transition-colors">
            {{ entry.recipeName }}
          </a>
        </div>
        <button @click="removeEntry(entry.id)" class="text-gray-300 hover:text-red-400 p-1 shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Portion weight -->
      <div v-if="entry.basePortionWeight" class="flex items-center gap-2 mb-2">
        <label class="text-xs text-gray-400 shrink-0">g</label>
        <input
          :value="entry.portionWeight || entry.basePortionWeight"
          @change="updatePortion(entry, Number(($event.target as HTMLInputElement).value))"
          type="number"
          min="10"
          step="10"
          class="w-16 rounded border border-gray-200 px-1.5 py-0.5 text-xs text-center outline-none focus:border-emerald-400"
        />
        <input
          :value="entry.portionWeight || entry.basePortionWeight"
          @input="updatePortion(entry, Number(($event.target as HTMLInputElement).value))"
          type="range"
          :min="Math.round(entry.basePortionWeight * 0.25)"
          :max="Math.round(entry.basePortionWeight * 3)"
          step="5"
          class="flex-1 accent-emerald-600"
        />
      </div>

      <!-- Macros -->
      <div v-if="entryMacros(entry)" class="flex gap-3 text-xs text-gray-500">
        <span>{{ entryMacros(entry)!.calories }} kcal</span>
        <span>{{ entryMacros(entry)!.protein }}g prot</span>
        <span>{{ entryMacros(entry)!.carbs }}g HC</span>
        <span>{{ entryMacros(entry)!.fat }}g grasa</span>
      </div>
    </div>

    <!-- Daily macro summary with progress bars -->
    <DailyMacroSummary
      v-if="dayEntries.length > 0"
      :actual="dayTotals"
      :target="activeDayTarget"
    />

    <!-- Add meal button -->
    <button
      @click="showPicker = true"
      class="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
    >
      + Añadir comida
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
