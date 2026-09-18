<template>
  <div class="relative inline-block text-left w-full" ref="dropdownRef">
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'w-full text-left text-textMain border transition flex items-center justify-between shadow-sm cursor-pointer select-none',
        'focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        error ? 'border-accentCoral' : 'border-gray-800 hover:border-gray-700 bg-bgCard',
        buttonClass
      ]"
    >
      <span class="truncate pr-2" :class="selectedOption?.class">{{ selectedLabel }}</span>
      <font-awesome-icon icon="chevron-down" class="text-xs text-gray-400 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Teleport to="body">
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
          :style="menuStyle"
          class="fixed z-[99999] rounded-xl bg-bgCard shadow-2xl border border-gray-800 py-1 max-h-60 overflow-y-auto custom-scrollbar"
        >
          <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            :disabled="opt.disabled"
            @click="selectOption(opt)"
            :class="[
              'block w-full px-4 py-2.5 text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between',
              opt.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/15 text-white',
              isSelected(opt.value) ? 'bg-primaryTeal/25 text-teal-300 font-bold' : 'text-gray-200'
            ]"
          >
            <span class="truncate">{{ opt.label }}</span>
            <font-awesome-icon v-if="isSelected(opt.value)" icon="check" class="text-xs text-teal-300 ml-2 flex-shrink-0" />
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

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
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md'].includes(val)
  },
  buttonClass: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const dropdownRef = ref(null);
const menuStyle = ref({});

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return 'h-8 px-3 py-1 rounded-xl text-xs font-semibold';
  }
  return 'h-10 sm:h-9 px-3.5 py-1 sm:py-1.5 rounded-xl text-sm font-medium';
});

const isSelected = (optValue) => {
  if (optValue === props.modelValue) return true;
  if (optValue != null && props.modelValue != null) {
    return String(optValue) === String(props.modelValue);
  }
  return false;
};

const selectedOption = computed(() => {
  return props.options.find(o => isSelected(o.value));
});

const selectedLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : props.placeholder;
});

const updateMenuPosition = () => {
  if (dropdownRef.value) {
    const rect = dropdownRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuMaxHeight = 240;
    const showAbove = spaceBelow < menuMaxHeight && rect.top > menuMaxHeight;

    menuStyle.value = {
      top: showAbove ? `${Math.max(10, rect.top - menuMaxHeight)}px` : `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 240)}px`
    };
  }
};

const toggleDropdown = async () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updateMenuPosition();
  }
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

const handleScrollOrResize = () => {
  if (isOpen.value) {
    updateMenuPosition();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScrollOrResize, true);
  window.addEventListener('resize', handleScrollOrResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScrollOrResize, true);
  window.removeEventListener('resize', handleScrollOrResize);
});
</script>
