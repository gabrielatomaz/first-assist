<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :title="title"
    :class="[
      variantClasses,
      sizeClasses,
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
    ]"
    class="font-bold transition-all duration-150 inline-flex items-center justify-center gap-2 select-none"
  >
    <font-awesome-icon v-if="loading" :icon="icon === 'arrows-rotate' ? 'arrows-rotate' : 'spinner'" spin class="text-xs" />
    <font-awesome-icon v-else-if="icon" :icon="icon" class="text-xs" />
    <span v-if="loading && loadingText">{{ loadingText }}</span>
    <span v-else-if="$slots.default"><slot /></span>
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
    validator: (val) => ['primary', 'secondary', 'danger', 'success', 'purple', 'ai', 'ghost', 'outline'].includes(val)
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg', 'icon-xs', 'icon-sm', 'icon-md'].includes(val)
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
  },
  title: {
    type: String,
    default: ''
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 px-3 text-xs rounded-xl';
    case 'lg':
      return 'h-11 px-6 text-sm sm:text-base rounded-xl shadow-md';
    case 'icon-xs':
      return 'w-7 h-7 text-xs rounded-lg flex items-center justify-center p-0 flex-shrink-0';
    case 'icon-sm':
      return 'w-9 h-9 text-sm rounded-xl flex items-center justify-center p-0 flex-shrink-0';
    case 'icon-md':
      return 'w-10 sm:w-9 h-10 sm:h-9 text-sm rounded-xl flex items-center justify-center p-0 flex-shrink-0';
    case 'md':
    default:
      return 'h-10 sm:h-9 px-4 text-sm rounded-xl shadow-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700 shadow-sm';
    case 'danger':
      return 'bg-red-500/15 hover:bg-red-500/25 text-accentCoral hover:text-red-300 border border-red-500/30 hover:border-red-500/50 shadow-sm';
    case 'success':
      return 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 font-bold shadow-sm';
    case 'purple':
    case 'ai':
      return 'bg-accentPurple/20 hover:bg-accentPurple/30 text-purple-200 hover:text-white border border-accentPurple/30 shadow-sm';
    case 'ghost':
      return 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white';
    case 'outline':
      return 'bg-transparent border border-teal-500/40 text-teal-400 hover:bg-teal-500/10';
    case 'primary':
    default:
      return 'bg-primaryTeal hover:brightness-110 text-gray-200 font-bold shadow-md';
  }
});
</script>
