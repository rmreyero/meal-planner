<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import IconProgressActivity from '~icons/material-symbols/progress-activity';
import IconAddAPhoto from '~icons/material-symbols/add-a-photo-outline';
import IconError from '~icons/material-symbols/error-outline';

const props = defineProps<{
  recipeId: number;
  currentPhoto?: string;
}>();

const uploading = ref(false);
const error = ref('');
const fullscreen = ref(false);
const fileInput = ref<HTMLInputElement>();

function triggerPicker() {
  fileInput.value?.click();
}

function openFullscreen() {
  fullscreen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
  fullscreen.value = false;
  document.body.style.overflow = '';
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && fullscreen.value) closeFullscreen();
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));

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
        :srcset="`/photos/${currentPhoto}?w=800&f=webp 800w, /photos/${currentPhoto}?w=1600&f=webp 1600w`"
        sizes="(min-width: 768px) 1600px, 800px"
        alt=""
        class="w-full aspect-video object-cover rounded-xl shadow-lg cursor-pointer"
        :style="{ viewTransitionName: `recipe-photo-${recipeId}` }"
        @click="openFullscreen"
      />
    </div>

    <!-- Without photo -->
    <div
      v-else
      class="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
      @click="triggerPicker"
    >
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <IconProgressActivity class="w-9 h-9 text-slate-400 animate-spin" />
        <span class="text-sm text-slate-500 font-medium">Subiendo...</span>
      </div>
      <template v-else>
        <IconAddAPhoto class="w-9 h-9 text-slate-400" />
        <span class="text-sm text-slate-500 font-medium">Añadir foto</span>
      </template>
    </div>

    <!-- Error toast -->
    <div
      v-if="error"
      class="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-bold text-white bg-red-500 toast-in cursor-pointer"
      @click="error = ''"
    >
      <IconError class="w-5 h-5" />
      {{ error }}
    </div>

    <!-- Fullscreen overlay -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="fullscreen"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-pointer"
          @click="closeFullscreen"
        >
          <img
            :src="`/photos/${currentPhoto}?w=1600&f=webp`"
            alt=""
            class="max-w-[95vw] max-h-[95vh] object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.toast-in {
  animation: toast-in 0.3s ease;
}
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
