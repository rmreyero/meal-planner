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
    <input
      v-model="search"
      @input="onFilter"
      type="search"
      placeholder="Buscar recetas..."
      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
    />
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="tag in sortedTags"
        :key="tag"
        @click="toggleTag(tag)"
        class="text-xs px-3 py-1 rounded-full border transition-colors"
        :class="selectedTag === tag
          ? 'bg-emerald-600 text-white border-emerald-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>
