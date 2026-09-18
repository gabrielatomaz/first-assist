<template>
  <span
    :class="[badgeClasses, sizeClasses]"
    class="inline-flex items-center justify-center text-center font-bold font-mono tracking-wider uppercase flex-shrink-0 transition-colors pt-[0.5em] pb-[0.25em]"
  >
    <slot>{{ priority }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  priority: {
    type: String,
    default: 'LOW'
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['xs', 'sm', 'md', 'lg'].includes(val)
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-2 text-[10px] rounded';
    case 'sm':
      return 'px-2.5 text-xs rounded min-w-[70px]';
    case 'lg':
      return 'px-4 text-sm rounded-lg min-w-[100px]';
    case 'md':
    default:
      return 'px-2.5 text-xs rounded min-w-[85px]';
  }
});

const badgeClasses = computed(() => {
  const p = (props.priority || '').toUpperCase();
  switch (p) {
    case 'CRITICAL':
      return 'bg-red-950/50 text-red-400 border border-red-900/40 animate-pulse';
    case 'HIGH':
      return 'bg-accentCoral/15 text-accentCoral border border-accentCoral/25';
    case 'MEDIUM':
      return 'bg-sky-950/40 text-sky-400 border border-sky-800/30';
    case 'LOW':
    default:
      return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});
</script>
