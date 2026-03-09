<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'default' | 'highlight';
  padding?: 'sm' | 'md';
}>(), {
  variant: 'default',
  padding: 'md',
});

const classes = computed(() => {
  if (props.variant === 'highlight')
    return 'bg-primary/5 rounded-xl border border-primary/20 p-4';
  return `bg-white rounded-xl border border-border shadow-sm ${props.padding === 'sm' ? 'p-3' : 'p-5'}`;
});
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
