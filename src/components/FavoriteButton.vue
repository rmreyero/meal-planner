<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  recipeId: number;
  initial: boolean;
}>();

const isFavorite = ref(props.initial);
const loading = ref(false);

async function toggle() {
  loading.value = true;
  try {
    const res = await fetch(`/api/recipes/${props.recipeId}/favorite`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      isFavorite.value = data.isFavorite;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <button
    @click.prevent.stop="toggle"
    :disabled="loading"
    :aria-label="isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
    class="p-1.5 rounded-full transition-colors"
    :class="isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'"
  >
    <svg class="w-5 h-5" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  </button>
</template>
