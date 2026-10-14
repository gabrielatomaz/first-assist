<template>
  <div class="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto scrollbar-none w-full touch-pan-x">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      @click="selectTab(tab.id)"
      :class="[
        'h-9 px-3 sm:px-4 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none whitespace-nowrap flex-1 sm:flex-initial sm:flex-shrink-0',
        sizeClasses,
        modelValue === tab.id
          ? (tab.activeClass || 'bg-primaryTeal/20 text-teal-300 border-primaryTeal/50 shadow-sm')
          : 'bg-bgCard text-gray-300 border-gray-800 hover:text-white hover:border-gray-700',
        tabClass
      ]"
    >
      <font-awesome-icon v-if="tab.icon" :icon="tab.icon" :class="[iconSizeClass, modelValue === tab.id ? '' : 'text-gray-400', 'pointer-events-none flex-shrink-0']" />
      <span class="pointer-events-none">
        <span v-if="tab.shortLabel" class="sm:hidden">{{ tab.shortLabel }}</span>
        <span :class="{ 'hidden sm:inline': tab.shortLabel }">{{ tab.label }}</span>
      </span>
      <span
        v-if="tab.count !== undefined && tab.count !== null"
        :class="[
          'min-w-[19px] h-[19px] px-1 inline-flex items-center justify-center text-[10px] font-extrabold rounded-full font-mono pointer-events-none flex-shrink-0 leading-none',
          modelValue === tab.id
            ? (tab.activeCountClass || 'bg-teal-400 text-slate-950')
            : (tab.inactiveCountClass || 'bg-gray-700 text-gray-300')
        ]"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  tabs: {
    type: Array,
    required: true,
    // Each item: { id: string, label: string, icon?: string, count?: number, activeClass?: string }
  },
  size: {
    type: String,
    default: 'xs',
    validator: (val) => ['xs', 'sm', 'md'].includes(val)
  },
  tabClass: {
    type: String,
    default: ''
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'xs':
    default:
      return 'text-xs';
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'xs':
    default:
      return 'text-xs';
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectTab = (tabId) => {
  emit('update:modelValue', tabId);
  emit('change', tabId);
};
</script>
