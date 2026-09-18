<template>
  <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-0.5">
    <div v-if="icon" :class="[iconClasses]" class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner">
      <font-awesome-icon :icon="icon" class="text-base" />
    </div>
    <span :class="[valueClasses]" class="text-3xl font-extrabold tracking-tight">
      {{ value }}
    </span>
    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
      {{ title }}
    </span>
    <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'teal',
    validator: (val) => ['teal', 'green', 'purple', 'yellow', 'coral', 'gray'].includes(val)
  }
});

const valueClasses = computed(() => {
  switch (props.variant) {
    case 'green':
      return 'text-accentGreen';
    case 'purple':
      return 'text-accentPurple';
    case 'yellow':
      return 'text-accentYellow';
    case 'coral':
      return 'text-accentCoral';
    case 'gray':
      return 'text-gray-300';
    case 'teal':
    default:
      return 'text-teal-400';
  }
});

const iconClasses = computed(() => {
  switch (props.variant) {
    case 'green':
      return 'bg-accentGreen/15 text-accentGreen border border-accentGreen/25';
    case 'purple':
      return 'bg-accentPurple/15 text-accentPurple border border-accentPurple/25';
    case 'yellow':
      return 'bg-accentYellow/15 text-accentYellow border border-accentYellow/25';
    case 'coral':
      return 'bg-accentCoral/15 text-accentCoral border border-accentCoral/25';
    case 'gray':
      return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'teal':
    default:
      return 'bg-teal-500/15 text-teal-400 border border-teal-500/25';
  }
});
</script>
