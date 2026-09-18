<template>
  <div class="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto scrollbar-none">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      @click="selectTab(tab.id)"
      :class="[
        'h-9 px-4 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer flex-shrink-0 select-none',
        modelValue === tab.id
          ? (tab.activeClass || 'bg-primaryTeal/20 text-teal-300 border-primaryTeal/50 shadow-sm')
          : 'bg-bgCard text-gray-300 border-gray-800 hover:text-white hover:border-gray-700'
      ]"
    >
      <font-awesome-icon v-if="tab.icon" :icon="tab.icon" class="text-xs" :class="modelValue === tab.id ? '' : 'text-gray-400'" />
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.count !== undefined && tab.count !== null"
        :class="[
          'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full font-mono',
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
defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  tabs: {
    type: Array,
    required: true,
    // Each item: { id: string, label: string, icon?: string, count?: number, activeClass?: string }
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectTab = (tabId) => {
  emit('update:modelValue', tabId);
  emit('change', tabId);
};
</script>
