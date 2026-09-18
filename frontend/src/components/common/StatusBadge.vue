<template>
  <span
    :class="[badgeClasses, sizeClasses]"
    class="inline-flex items-center justify-center text-center font-bold font-mono tracking-wider uppercase flex-shrink-0 transition-colors pt-[0.5em] pb-[0.25em]"
  >
    <slot>{{ displayLabel }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['xs', 'sm', 'md', 'lg'].includes(val)
  },
  format: {
    type: Boolean,
    default: true
  }
});

const displayLabel = computed(() => {
  if (!props.status) return '';
  const s = props.status.toUpperCase();
  if (s === 'PENDING_SCREENING') return 'IN_TRIAGE';
  if (!props.format) return props.status;
  return props.status.replace(/_/g, ' ');
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
  const s = (props.status || '').toUpperCase();
  switch (s) {
    case 'PENDING_SCREENING':
    case 'IN_TRIAGE':
    case 'TRIAGE':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'OPEN':
      return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
    case 'ASSIGNED':
      return 'bg-accentYellow/15 text-accentYellow border border-accentYellow/25';
    case 'IN_PROGRESS':
      return 'bg-accentPurple/15 text-accentPurple border border-accentPurple/25';
    case 'WAITING':
      return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'RESOLVED':
      return 'bg-accentGreen/15 text-accentGreen border border-accentGreen/30';
    case 'CLOSED':
      return 'bg-gray-800/80 text-gray-400 border border-gray-700/50';
    case 'REJECTED':
      return 'bg-accentCoral/15 text-accentCoral border border-accentCoral/30';
    case 'ACTIVE':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'INACTIVE':
      return 'bg-gray-800 text-gray-500 border border-gray-700';
    case 'PENDING':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    default:
      return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});
</script>
