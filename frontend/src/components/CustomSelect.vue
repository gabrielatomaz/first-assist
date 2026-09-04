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
          class="fixed z-[99999] rounded-xl bg-bgCard shadow-2xl border border-gray-700 py-1 max-h-60 overflow-y-auto custom-scrollbar"
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
              isSelected(opt.value) ? 'bg-primaryTeal/25 text-primaryTeal font-bold' : 'text-gray-200'
            ]"
          >
            <span class="truncate">{{ opt.label }}</span>
            <font-awesome-icon v-if="isSelected(opt.value)" icon="check" class="text-xs text-primaryTeal ml-2 flex-shrink-0" />
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
  buttonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const dropdownRef = ref(null);
const menuStyle = ref({});

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
