<template>
  <span
    :class="[badgeClasses, sizeClasses]"
    class="inline-flex items-center justify-center text-center font-bold font-mono tracking-wider uppercase flex-shrink-0 transition-colors pt-[0.5em] pb-[0.25em]"
  >
    <slot>{{ displayRole }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  role: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'sm',
    validator: (val) => ['xs', 'sm', 'md'].includes(val)
  }
});

const displayRole = computed(() => {
  if (!props.role) return '';
  return props.role.replace(/_/g, ' ');
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-2 text-[9px] rounded';
    case 'md':
      return 'px-3 text-xs rounded-md';
    case 'sm':
    default:
      return 'px-2.5 text-xs rounded-md';
  }
});

const badgeClasses = computed(() => {
  const r = (props.role || '').toUpperCase();
  switch (r) {
    case 'ADMIN':
      return 'bg-accentYellow/15 text-accentYellow border border-accentYellow/25';
    case 'FTA':
      return 'bg-accentPurple/15 text-purple-300 border border-accentPurple/25';
    case 'CSA':
      return 'bg-teal-500/15 text-teal-400 border border-teal-500/25';
    case 'TEAM_REP':
      return 'bg-gray-800 text-gray-300 border border-gray-700';
    default:
      return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});
</script>
