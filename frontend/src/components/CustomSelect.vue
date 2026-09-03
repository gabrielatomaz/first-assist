<template>
  <div class="relative inline-block text-left w-full" ref="dropdownRef">
    <button
      type="button"
      @click="toggleDropdown"
      :class="[
        'w-full rounded-lg bg-bgCard px-3 py-2 text-left text-xs font-semibold text-textMain border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal transition flex items-center justify-between shadow-sm cursor-pointer',
        buttonClass
      ]"
    >
      <span class="truncate pr-2" :class="selectedOption?.class">{{ selectedLabel }}</span>
      <font-awesome-icon icon="chevron-down" class="text-[10px] text-gray-400 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-1.5 min-w-[12rem] w-full rounded-xl bg-bgCard shadow-2xl border border-gray-800 py-1 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :disabled="opt.disabled"
          @click="selectOption(opt)"
          :class="[
            'block w-full px-4 py-2.5 text-left text-xs font-medium transition cursor-pointer flex items-center justify-between',
            opt.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 text-textMain',
            modelValue === opt.value ? 'bg-primaryTeal/15 font-bold' : 'text-textMain'
          ]"
        >
          <span class="text-textMain">{{ opt.label }}</span>
          <font-awesome-icon v-if="modelValue === opt.value" icon="check" class="text-xs text-primaryTeal ml-2 flex-shrink-0" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: [String, Number, Object],
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select option'
  },
  buttonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedOption = computed(() => {
  return props.options.find(o => o.value === props.modelValue);
});

const selectedLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (opt) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
