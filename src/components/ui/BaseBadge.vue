<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}>(), {
  variant: 'primary',
  size: 'md',
});

const classes = computed(() => {
  const base = 'rounded-full font-bold';
  if (props.variant === 'primary' && props.size === 'md')
    return `${base} px-3 py-1 bg-primary/10 text-primary text-xs uppercase tracking-wider`;
  if (props.variant === 'secondary' && props.size === 'md')
    return `${base} px-3 py-1 bg-slate-200 text-slate-600 text-xs`;
  if (props.variant === 'primary' && props.size === 'sm')
    return `${base} px-2 py-0.5 bg-primary/10 text-primary text-xs`;
  return `${base} px-2 py-0.5 bg-slate-100 text-slate-700 text-xs`;
});
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
