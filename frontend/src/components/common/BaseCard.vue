<template>
  <div
    :class="[
      padding,
      hover ? 'hover:border-gray-700 hover:shadow-lg transition-all duration-150' : '',
      clickable ? 'cursor-pointer active:scale-[0.99]' : ''
    ]"
    class="bg-bgCard rounded-2xl shadow border border-gray-800"
    @click="$emit('click', $event)"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  padding: {
    type: String,
    default: 'p-6'
  },
  hover: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>
