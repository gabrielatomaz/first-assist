<template>
  <div class="text-center py-8">
    <div
      :class="[spinnerSizeClasses]"
      class="inline-block animate-spin rounded-full border-teal-500 border-t-transparent"
    />
    <p v-if="text" class="text-gray-400 mt-3 text-sm font-medium">
      {{ text }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: 'Loading...'
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  }
});

const spinnerSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-5 w-5 border-2';
    case 'lg':
      return 'h-12 w-12 border-4';
    case 'md':
    default:
      return 'h-8 w-8 border-4';
  }
});
</script>
