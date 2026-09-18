<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      variantClasses,
      sizeClasses,
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
    ]"
    class="font-bold transition-all duration-150 inline-flex items-center justify-center space-x-2 select-none"
  >
    <font-awesome-icon v-if="loading" icon="spinner" spin class="text-xs" />
    <font-awesome-icon v-else-if="icon" :icon="icon" class="text-xs" />
    <span v-if="loading && loadingText">{{ loadingText }}</span>
    <span v-else><slot /></span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'danger', 'success', 'ghost', 'outline'].includes(val)
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg', 'icon-sm', 'icon-md'].includes(val)
  },
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-lg';
    case 'lg':
      return 'px-6 py-3 text-base rounded-xl shadow-md';
    case 'icon-sm':
      return 'w-8 h-8 rounded-lg flex items-center justify-center p-0 flex-shrink-0';
    case 'icon-md':
      return 'w-10 h-10 rounded-xl flex items-center justify-center p-0 flex-shrink-0';
    case 'md':
    default:
      return 'px-4 py-2.5 text-sm rounded-xl shadow-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700';
    case 'danger':
      return 'bg-accentCoral hover:brightness-110 text-white shadow-sm';
    case 'success':
      return 'bg-emerald-600 hover:bg-emerald-500 text-gray-200 font-bold shadow-sm';
    case 'ghost':
      return 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white';
    case 'outline':
      return 'bg-transparent border border-teal-500/40 text-teal-400 hover:bg-teal-500/10';
    case 'primary':
    default:
      return 'bg-primaryTeal hover:brightness-110 text-gray-200 font-bold shadow-md border border-primaryTeal/30';
  }
});
</script>
