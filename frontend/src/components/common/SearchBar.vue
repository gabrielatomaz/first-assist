<template>
  <div class="flex items-center space-x-3 bg-bgMain px-4 py-3 rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-400 transition-all shadow-inner">
    <font-awesome-icon icon="magnifying-glass" class="text-teal-400 text-base flex-shrink-0" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      type="text"
      @input="handleInput"
      class="w-full bg-transparent border-none focus:outline-none text-sm text-textMain placeholder-gray-500 font-medium"
    />
    <button
      v-if="modelValue"
      @click="clear"
      type="button"
      class="text-xs text-accentYellow hover:underline font-bold transition whitespace-nowrap flex items-center cursor-pointer flex-shrink-0"
    >
      <font-awesome-icon icon="xmark" class="mr-1" /> Clear
    </button>
  </div>
</template>

<script setup>
let timeoutId = null;

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search...'
  },
  debounceMs: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue', 'search', 'clear']);

const handleInput = (e) => {
  const value = e.target.value;
  emit('update:modelValue', value);
  
  if (props.debounceMs > 0) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      emit('search', value);
    }, props.debounceMs);
  } else {
    emit('search', value);
  }
};

const clear = () => {
  emit('update:modelValue', '');
  emit('clear');
  emit('search', '');
};
</script>
