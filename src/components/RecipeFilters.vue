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
const showSearch = ref(false);

const sortedTags = computed(() => [...props.tags].sort());

function onFilter() {
  emit('filter', { search: search.value, tag: selectedTag.value });
}

function toggleTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag;
  onFilter();
}

function toggleSearch() {
  showSearch.value = !showSearch.value;
  if (!showSearch.value) {
    search.value = '';
    onFilter();
  }
}
</script>

<template>
  <div class="space-y-0">
    <!-- Search bar -->
    <div v-if="showSearch" class="px-0 pb-3">
      <div class="flex items-stretch rounded-xl bg-white border border-slate-100 overflow-hidden">
        <div class="flex items-center justify-center pl-3 text-slate-400">
          <span class="material-symbols-outlined text-xl">search</span>
        </div>
        <input
          v-model="search"
          @input="onFilter"
          type="search"
          placeholder="Buscar recetas..."
          class="flex-1 border-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-slate-400"
          autofocus
        />
        <button @click="toggleSearch" class="px-3 text-slate-400 hover:text-slate-600">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
    </div>

    <!-- Horizontal scrolling tags -->
    <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      <button
        @click="toggleSearch"
        class="flex h-9 shrink-0 items-center justify-center rounded-full px-3 transition-colors"
        :class="showSearch ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'"
      >
        <span class="material-symbols-outlined text-xl">search</span>
      </button>
      <button
        v-for="tag in sortedTags"
        :key="tag"
        @click="toggleTag(tag)"
        class="flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors"
        :class="selectedTag === tag
          ? 'bg-primary text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>
