<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  recipeId: number;
  currentPhoto?: string;
}>();

const uploading = ref(false);
const error = ref('');
const fileInput = ref<HTMLInputElement>();

function triggerPicker() {
  fileInput.value?.click();
}

async function handleFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = true;
  error.value = '';

  try {
    const form = new FormData();
    form.append('photo', file);

    const res = await fetch(`/api/recipes/${props.recipeId}/photo`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Error al subir la foto');
    }

    window.location.reload();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al subir la foto';
    uploading.value = false;
  }
}
</script>

<template>
  <div class="py-2 md:py-0 md:mb-0">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFile"
    />

    <!-- With photo -->
    <div v-if="currentPhoto">
      <img
        :src="`/photos/${currentPhoto}?w=800&f=webp`"
        alt=""
        class="w-full aspect-video object-cover rounded-xl shadow-lg"
        :style="{ viewTransitionName: `recipe-photo-${recipeId}` }"
      />
    </div>

    <!-- Without photo -->
    <div
      v-else
      class="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
      @click="triggerPicker"
    >
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <span aria-hidden="true" class="material-symbols-outlined text-slate-400 text-4xl animate-spin">progress_activity</span>
        <span class="text-sm text-slate-500 font-medium">Subiendo...</span>
      </div>
      <template v-else>
        <span aria-hidden="true" class="material-symbols-outlined text-slate-400 text-4xl">add_a_photo</span>
        <span class="text-sm text-slate-500 font-medium">Añadir foto</span>
      </template>
    </div>

    <!-- Error toast -->
    <div
      v-if="error"
      class="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-bold text-white bg-red-500 toast-in cursor-pointer"
      @click="error = ''"
    >
      <span aria-hidden="true" class="material-symbols-outlined text-lg">error</span>
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.toast-in {
  animation: toast-in 0.3s ease;
}
</style>
