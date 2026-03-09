<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseSearchInput from '@/components/ui/BaseSearchInput.vue';
import IconSearch from '~icons/material-symbols/search';

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
      <BaseSearchInput
        v-model="search"
        @update:model-value="onFilter"
        placeholder="Buscar recetas..."
        :show-close="true"
        @close="toggleSearch"
        autofocus
      />
    </div>

    <!-- Horizontal scrolling tags -->
    <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      <button
        @click="toggleSearch"
        :aria-expanded="showSearch"
        aria-label="Buscar"
        class="flex h-9 shrink-0 items-center justify-center rounded-full px-3 transition-colors"
        :class="showSearch ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'"
      >
        <IconSearch class="w-5 h-5" />
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
