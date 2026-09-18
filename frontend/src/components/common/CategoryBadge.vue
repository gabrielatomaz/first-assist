<template>
  <span
    v-if="category"
    class="inline-flex items-center justify-center text-center px-2.5 pt-[0.5em] pb-[0.25em] rounded text-xs font-semibold text-gray-300 bg-gray-800/80 border border-gray-700/70 font-mono uppercase tracking-wider flex-shrink-0"
  >
    <slot>{{ formattedCategory }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  category: {
    type: String,
    default: ''
  }
});

const formattedCategory = computed(() => {
  if (!props.category) return '';
  return props.category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});
</script>
