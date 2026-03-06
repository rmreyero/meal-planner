<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Profile {
  id: number;
  profileType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const profiles = ref<Record<string, Profile>>({});
const saving = ref<string | null>(null);
const saved = ref<string | null>(null);

onMounted(async () => {
  const res = await fetch('/api/macro-targets');
  const data: Profile[] = await res.json();
  for (const p of data) {
    profiles.value[p.profileType] = p;
  }
});

async function save(type: string) {
  const profile = profiles.value[type];
  if (!profile) return;

  saving.value = type;
  await fetch(`/api/macro-targets/${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calories: profile.calories,
      protein: profile.protein,
      carbs: profile.carbs,
      fat: profile.fat,
    }),
  });
  saving.value = null;
  saved.value = type;
  setTimeout(() => { if (saved.value === type) saved.value = null; }, 2000);
}

const LABELS: Record<string, string> = { training: 'Entrenamiento', rest: 'Descanso' };
const FIELDS = [
  { key: 'calories' as const, label: 'Calorías', unit: 'kcal' },
  { key: 'protein' as const, label: 'Proteína', unit: 'g' },
  { key: 'carbs' as const, label: 'Hidratos', unit: 'g' },
  { key: 'fat' as const, label: 'Grasa', unit: 'g' },
];
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="type in ['training', 'rest']"
      :key="type"
      class="rounded-lg border border-gray-200 p-4"
    >
      <h3 class="font-semibold mb-3">{{ LABELS[type] }}</h3>

      <div v-if="profiles[type]" class="space-y-3">
        <div v-for="field in FIELDS" :key="field.key" class="flex items-center gap-3">
          <label class="text-sm text-gray-500 w-20 shrink-0">{{ field.label }}</label>
          <input
            v-model.number="profiles[type][field.key]"
            type="number"
            min="0"
            class="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-400 transition-colors"
          />
          <span class="text-xs text-gray-400 w-8">{{ field.unit }}</span>
        </div>

        <button
          @click="save(type)"
          :disabled="saving === type"
          class="w-full mt-2 rounded-lg bg-emerald-600 text-white py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {{ saving === type ? 'Guardando...' : saved === type ? 'Guardado' : 'Guardar' }}
        </button>
      </div>

      <div v-else class="text-sm text-gray-400 py-4 text-center">Cargando...</div>
    </div>
  </div>
</template>
