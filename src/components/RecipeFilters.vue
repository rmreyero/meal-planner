<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  tags: string[];
}>();

const emit = defineEmits<{
  filter: [{ search: string; tag: string }];
}>();

const search = ref('');
const selectedTag = ref('');

const sortedTags = computed(() => [...props.tags].sort());

function onFilter() {
  emit('filter', { search: search.value, tag: selectedTag.value });
}

function toggleTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag;
  onFilter();
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-stretch rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex items-center justify-center pl-3 text-slate-400">
        <span class="material-symbols-outlined text-xl">search</span>
      </div>
      <input
        v-model="search"
        @input="onFilter"
        type="search"
        placeholder="Buscar recetas..."
        class="flex-1 border-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="tag in sortedTags"
        :key="tag"
        @click="toggleTag(tag)"
        class="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors"
        :class="selectedTag === tag
          ? 'bg-primary text-white'
          : 'bg-primary/10 text-primary hover:bg-primary/20'"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>
