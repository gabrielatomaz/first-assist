<template>
  <span
    :class="[badgeClasses, sizeClasses]"
    class="inline-flex items-center justify-center text-center font-bold font-mono tracking-wider uppercase flex-shrink-0 transition-colors leading-none"
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
  const s = props.status.toUpperCase().replace(/\s+/g, '_');
  if (s === 'PENDING_SCREENING') return 'IN_TRIAGE';
  return s;
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-5 px-2 text-[10px] rounded';
    case 'sm':
      return 'h-5 px-2.5 text-xs rounded';
    case 'lg':
      return 'h-7 px-3.5 text-xs rounded-lg min-w-[90px]';
    case 'md':
    default:
      return 'h-6 px-2.5 text-xs rounded-md min-w-[76px]';
  }
});

const badgeClasses = computed(() => {
  const s = (props.status || '').toUpperCase();
  switch (s) {
    case 'OPEN':
      return 'bg-accentCoral/15 text-accentCoral border border-accentCoral/30';
    case 'INVESTIGATING':
    case 'PENDING_SCREENING':
    case 'IN_TRIAGE':
    case 'TRIAGE':
    case 'PENDING':
      return 'bg-accentYellow/15 text-accentYellow border border-accentYellow/30';
    case 'ASSIGNED':
      return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
    case 'IN_PROGRESS':
      return 'bg-accentPurple/15 text-accentPurple border border-accentPurple/30';
    case 'RESOLVED':
      return 'bg-accentGreen/15 text-accentGreen border border-accentGreen/30';
    case 'ACTIVE':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'WAITING':
      return 'bg-gray-800 text-gray-300 border border-gray-700';
    case 'CLOSED':
    case 'INACTIVE':
      return 'bg-gray-800/80 text-gray-400 border border-gray-700/50';
    case 'REJECTED':
      return 'bg-red-950/40 text-accentCoral border border-red-900/30';
    default:
      return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});
</script>
