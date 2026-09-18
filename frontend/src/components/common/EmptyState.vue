<template>
  <div class="bg-bgCard p-8 rounded-2xl shadow border border-gray-800 text-center space-y-3">
    <div v-if="icon" class="w-12 h-12 bg-gray-800/80 text-gray-400 border border-gray-700/60 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="space-y-1">
      <h3 v-if="title" class="text-base font-bold text-gray-200">
        {{ title }}
      </h3>
      <p v-if="description" class="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.action" class="pt-2">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'inbox'
  },
  title: {
    type: String,
    default: 'No items found'
  },
  description: {
    type: String,
    default: ''
  }
});
</script>
