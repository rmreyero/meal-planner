<script setup lang="ts">
withDefaults(defineProps<{
  level?: 2 | 3;
}>(), {
  level: 2,
});
</script>

<template>
  <component
    :is="'h' + level"
    :class="level === 2
      ? 'text-xl font-bold mb-4 flex items-center gap-2'
      : 'text-lg font-extrabold mb-4 flex items-center gap-2'"
  >
    <span v-if="$slots.icon" class="text-primary"><slot name="icon" /></span>
    <slot />
  </component>
</template>
