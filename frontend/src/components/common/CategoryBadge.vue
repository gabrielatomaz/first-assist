<template>
  <span
    v-if="category"
    class="inline-flex items-center justify-center text-center px-2.5 py-0.5 rounded text-xs font-bold text-teal-300/90 bg-teal-500/15 border border-teal-500/30 font-mono uppercase tracking-wider leading-normal flex-shrink-0"
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
