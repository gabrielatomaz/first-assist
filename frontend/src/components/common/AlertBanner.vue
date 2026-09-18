<template>
  <div
    v-if="visible"
    :class="[bannerClasses]"
    class="p-4 rounded-xl border text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn"
  >
    <div class="flex items-center space-x-2.5">
      <font-awesome-icon :icon="iconName" :class="iconColorClass" class="text-base flex-shrink-0" />
      <div>
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button
      v-if="dismissible"
      @click="visible = false"
      type="button"
      class="text-gray-400 hover:text-white transition ml-3 flex-shrink-0 cursor-pointer"
      title="Dismiss"
    >
      <font-awesome-icon icon="xmark" class="text-sm" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'error',
    validator: (val) => ['error', 'warning', 'success', 'info'].includes(val)
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  }
});

const visible = ref(true);

const bannerClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
    case 'warning':
      return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
    case 'info':
      return 'bg-teal-950/40 text-teal-300 border-teal-900/30';
    case 'error':
    default:
      return 'bg-red-950/40 text-accentCoral border-red-900/30';
  }
});

const iconColorClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-emerald-400';
    case 'warning':
      return 'text-amber-400';
    case 'info':
      return 'text-teal-400';
    case 'error':
    default:
      return 'text-accentCoral';
  }
});

const iconName = computed(() => {
  switch (props.type) {
    case 'success':
      return 'circle-check';
    case 'warning':
      return 'triangle-exclamation';
    case 'info':
      return 'circle-info';
    case 'error':
    default:
      return 'circle-exclamation';
  }
});
</script>
