<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  unit: string;
}>();
</script>

<template>
  <div class="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-slate-100">
    <span class="text-primary text-xs font-bold">{{ label }}</span>
    <span class="text-lg font-extrabold">{{ value }}</span>
    <span class="text-[10px] text-slate-500 uppercase">{{ unit }}</span>
  </div>
</template>
