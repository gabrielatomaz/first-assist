<template>
  <div
    :class="[
      card
        ? 'bg-bgCard p-6 rounded-2xl shadow border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
        : 'flex flex-col md:flex-row justify-between md:items-center gap-4'
    ]"
  >
    <div class="flex items-center space-x-4">
      <div
        v-if="icon"
        class="w-10 h-10 flex items-center justify-center bg-teal-500/15 text-teal-400 border border-teal-500/25 rounded-xl shadow-sm flex-shrink-0"
      >
        <font-awesome-icon :icon="icon" class="text-base" />
      </div>
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight">
            {{ title }}
          </h2>
          <slot name="titleBadge" />
        </div>
        <p v-if="subtitle" class="text-sm text-gray-400 font-medium mt-1">
          {{ subtitle }}
        </p>
        <slot name="sub" />
      </div>
    </div>

    <!-- Actions / Filters slot -->
    <div v-if="$slots.actions" class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  card: {
    type: Boolean,
    default: false
  }
});
</script>
