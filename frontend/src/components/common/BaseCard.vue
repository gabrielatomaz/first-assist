<template>
  <div
    :class="[
      padding,
      hover ? 'hover:border-gray-700 hover:shadow-md transition-all' : ''
    ]"
    class="bg-bgCard rounded-2xl shadow border border-gray-800"
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
  }
});
</script>
