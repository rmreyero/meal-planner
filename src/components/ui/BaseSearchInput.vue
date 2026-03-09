<script setup lang="ts">
import IconSearch from '~icons/material-symbols/search';
import IconClose from '~icons/material-symbols/close';

withDefaults(defineProps<{
  modelValue: string;
  placeholder?: string;
  showClose?: boolean;
}>(), {
  placeholder: 'Buscar...',
  showClose: false,
});

defineEmits<{
  'update:modelValue': [value: string];
  close: [];
}>();

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div class="flex items-stretch rounded-xl bg-bg border border-border overflow-hidden">
    <div class="flex items-center justify-center pl-3 text-slate-400">
      <IconSearch class="w-5 h-5" />
    </div>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="search"
      :placeholder="placeholder"
      class="flex-1 border-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-slate-400"
      v-bind="$attrs"
    />
    <button v-if="showClose" @click="$emit('close')" class="px-3 text-slate-400 hover:text-slate-600">
      <IconClose class="w-5 h-5" />
    </button>
  </div>
</template>
