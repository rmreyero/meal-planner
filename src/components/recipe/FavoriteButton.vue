<script setup lang="ts">
import { ref } from 'vue';
import IconFavoriteFilled from '~icons/material-symbols/favorite-rounded';
import IconFavoriteOutline from '~icons/material-symbols/favorite-outline';

const props = defineProps<{
  recipeId: number;
  initial: boolean;
}>();

const isFavorite = ref(props.initial);
const loading = ref(false);
const pulse = ref(false);

async function toggle() {
  loading.value = true;
  const prev = isFavorite.value;
  isFavorite.value = !prev;
  pulse.value = true;
  setTimeout(() => { pulse.value = false; }, 300);
  try {
    const res = await fetch(`/api/recipes/${props.recipeId}/favorite`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      isFavorite.value = data.isFavorite;
    } else {
      isFavorite.value = prev;
    }
  } catch {
    isFavorite.value = prev;
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
    class="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
  >
    <IconFavoriteFilled
      v-if="isFavorite"
      class="w-6 h-6 text-primary transition-all duration-200"
      :class="pulse ? 'scale-125' : 'scale-100'"
    />
    <IconFavoriteOutline
      v-else
      class="w-6 h-6 text-slate-300 hover:text-slate-400 transition-all duration-200"
      :class="pulse ? 'scale-125' : 'scale-100'"
    />
  </button>
</template>
