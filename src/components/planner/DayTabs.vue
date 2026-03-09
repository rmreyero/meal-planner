<script setup lang="ts">
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
const DAY_NAMES = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] as const;

const props = defineProps<{
  activeDay: number;
  weekStart: string;
  hasEntries: (dayIdx: number) => boolean;
}>();

defineEmits<{
  'update:activeDay': [idx: number];
}>();

function dayDate(dayIdx: number): string {
  const d = new Date(props.weekStart + 'T00:00:00');
  d.setDate(d.getDate() + dayIdx);
  return `${d.getDate()}`;
}
</script>

<template>
  <div class="flex gap-1 mb-4" role="tablist" aria-label="Dias de la semana">
    <button
      v-for="(label, idx) in DAY_LABELS"
      :key="idx"
      @click="$emit('update:activeDay', idx)"
      role="tab"
      :aria-selected="activeDay === idx"
      :aria-label="DAY_NAMES[idx]"
      class="flex-1 py-2 text-center text-sm rounded-lg font-bold relative transition-all"
      :class="activeDay === idx
        ? 'bg-primary text-white shadow-md shadow-primary/20'
        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'"
    >
      <div>{{ label }}</div>
      <div class="text-[10px]" :class="activeDay === idx ? 'text-white/70' : 'text-slate-400'">{{ dayDate(idx) }}</div>
      <div
        v-if="hasEntries(idx) && activeDay !== idx"
        class="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/40"
      ></div>
    </button>
  </div>
</template>
