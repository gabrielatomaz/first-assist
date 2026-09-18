<template>
  <span
    v-if="category"
    :class="sizeClasses"
    class="inline-flex items-center justify-center text-center font-bold text-gray-300 bg-gray-800/80 border border-gray-800 font-mono uppercase tracking-wider flex-shrink-0 leading-none"
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
      return 'h-5 px-2 text-[10px] rounded';
    case 'sm':
      return 'h-5 px-2.5 text-xs rounded min-w-[64px]';
    case 'lg':
      return 'h-7 px-3.5 text-xs rounded-lg min-w-[90px]';
    case 'md':
    default:
      return 'h-6 px-2.5 text-xs rounded-md min-w-[76px]';
  }
});

const CATEGORY_LABELS = {
  RADIO_COMMS: 'Radio & Comms',
  ROBOTIC_POWER: 'Robot Power',
  CAN_BUS: 'CAN Bus',
  MOTOR_CONTROLLER: 'Motor Control',
  PNEUMATICS: 'Pneumatics',
  VISION_COPROCESSOR: 'Vision / CoProc',
  DRIVER_STATION: 'Driver Station',
  CODE_EXCEPTION: 'User Code',
  MECHANICAL: 'Mechanical',
  FIELD_NETWORK: 'Field / FMS',
  OTHER: 'Other'
};

const formattedCategory = computed(() => {
  if (!props.category) return '';
  const key = props.category.toUpperCase();
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  return props.category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});
</script>
