<template>
  <font-awesome-icon 
    :icon="icon || 'user'" 
    :style="{ color: color || '#4F7F82' }"
    :class="[sizeClass, 'inline-block transition-all duration-200 flex-shrink-0']"
    :title="title"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: { type: String, default: 'user' },
  color: { type: String, default: '#4F7F82' },
  size: { type: String, default: 'md' },
  title: { type: String, default: '' }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[11px]';
    case 'sm': return 'text-sm';
    case 'lg': return 'text-xl';
    case 'xl': return 'text-4xl';
    case 'md':
    default: return 'text-base';
  }
});
</script>
