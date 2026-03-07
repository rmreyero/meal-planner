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
const showTags = ref(false);

const sortedTags = computed(() => [...props.tags].sort());

function onFilter() {
  emit('filter', { search: search.value, tag: selectedTag.value });
}

function toggleTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag;
  onFilter();
}

function clearTag() {
  selectedTag.value = '';
  onFilter();
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-stretch gap-2">
      <div class="flex-1 flex items-stretch rounded-xl bg-white border border-border shadow-sm overflow-hidden">
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
      <button
        @click="showTags = !showTags"
        class="md:hidden flex items-center gap-1 px-3 rounded-xl border border-border bg-white text-sm font-bold transition-colors"
        :class="showTags || selectedTag ? 'text-primary' : 'text-slate-500'"
      >
        <span class="material-symbols-outlined text-lg">tune</span>
        <span class="text-xs">Filtros</span>
      </button>
    </div>

    <!-- Active tag chip (always visible on mobile when a tag is selected) -->
    <div v-if="selectedTag && !showTags" class="md:hidden flex items-center gap-2">
      <button
        @click="clearTag"
        class="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider bg-primary text-white flex items-center gap-1 transition-colors"
      >
        {{ selectedTag }}
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>

    <!-- Tags: always visible on desktop, toggle on mobile -->
    <div
      class="flex gap-2 flex-wrap transition-all"
      :class="showTags ? '' : 'hidden md:flex'"
    >
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
