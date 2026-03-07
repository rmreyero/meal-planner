<script setup lang="ts">
import { ref } from 'vue';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
  leaving: boolean;
}

const toasts = ref<ToastItem[]>([]);
let nextId = 0;

function show(message: string, type: 'success' | 'error' = 'success') {
  const id = nextId++;
  toasts.value.push({ id, message, type, leaving: false });
  setTimeout(() => dismiss(id), 3000);
}

function dismiss(id: number) {
  const toast = toasts.value.find((t) => t.id === id);
  if (!toast) return;
  toast.leaving = true;
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 300);
}

defineExpose({ show });
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-bold text-white"
      :class="[
        toast.type === 'error' ? 'bg-red-500' : 'bg-success',
        toast.leaving ? 'toast-out' : 'toast-in',
      ]"
      @click="dismiss(toast.id)"
    >
      <span class="material-symbols-outlined text-lg">
        {{ toast.type === 'error' ? 'error' : 'check_circle' }}
      </span>
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-in {
  animation: toast-in 0.3s ease;
}
.toast-out {
  animation: toast-out 0.3s ease forwards;
}
</style>
