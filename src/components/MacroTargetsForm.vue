<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Toast from './Toast.vue';

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
const toast = ref<InstanceType<typeof Toast> | null>(null);

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
  try {
    const res = await fetch(`/api/macro-targets/${type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calories: profile.calories,
        protein: profile.protein,
        carbs: profile.carbs,
        fat: profile.fat,
      }),
    });
    if (!res.ok) throw new Error();
    saved.value = type;
    setTimeout(() => { if (saved.value === type) saved.value = null; }, 2000);
  } catch {
    toast.value?.show('Error al guardar objetivos', 'error');
  } finally {
    saving.value = null;
  }
}

const LABELS: Record<string, string> = { training: 'Entrenamiento', rest: 'Descanso' };
const ICONS: Record<string, string> = { training: 'fitness_center', rest: 'weekend' };
const FIELDS = [
  { key: 'calories' as const, label: 'Calorias', unit: 'kcal' },
  { key: 'protein' as const, label: 'Proteina', unit: 'g' },
  { key: 'carbs' as const, label: 'Hidratos', unit: 'g' },
  { key: 'fat' as const, label: 'Grasa', unit: 'g' },
];
</script>

<template>
  <Toast ref="toast" />
  <div class="space-y-6">
    <div
      v-for="type in ['training', 'rest']"
      :key="type"
      class="bg-white rounded-xl border border-border p-5 shadow-sm"
    >
      <h3 class="font-extrabold text-lg mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">{{ ICONS[type] }}</span>
        {{ LABELS[type] }}
      </h3>

      <div v-if="profiles[type]" class="space-y-3">
        <div v-for="field in FIELDS" :key="field.key" class="flex items-center gap-3">
          <label class="text-sm font-bold text-slate-500 w-20 shrink-0">{{ field.label }}</label>
          <input
            v-model.number="profiles[type][field.key]"
            type="number"
            min="0"
            class="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-bold outline-none focus:border-primary transition-colors"
          />
          <span class="text-xs text-slate-400 font-bold w-8">{{ field.unit }}</span>
        </div>

        <button
          @click="save(type)"
          :disabled="saving === type"
          class="w-full mt-3 rounded-xl bg-primary text-white py-2.5 text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 transition-all"
        >
          {{ saving === type ? 'Guardando...' : saved === type ? 'Guardado' : 'Guardar' }}
        </button>
      </div>

      <div v-else class="text-sm text-slate-400 py-4 text-center">Cargando...</div>
    </div>
  </div>
</template>
