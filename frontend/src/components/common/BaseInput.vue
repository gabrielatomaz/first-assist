<template>
  <div class="w-full space-y-1.5">
    <div v-if="label || $slots.labelAction" class="flex justify-between items-center">
      <label v-if="label" :for="inputId" class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
        {{ label }}
        <span v-if="required && showAsterisk" class="text-accentCoral ml-0.5">*</span>
      </label>
      <slot name="labelAction" />
    </div>

    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <font-awesome-icon :icon="icon" class="text-xs" />
      </div>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :list="list"
        @input="$emit('update:modelValue', type === 'number' ? ($event.target.value === '' ? null : Number($event.target.value)) : $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        :class="[
          'w-full border bg-bgMain text-textMain text-sm placeholder-gray-500 transition duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses,
          icon ? 'pl-9 pr-3.5' : 'px-3.5',
          error ? 'border-accentCoral focus:ring-accentCoral/30 focus:border-accentCoral' : 'border-gray-700',
          inputClass
        ]"
      />

      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-2 flex items-center">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-xs text-accentCoral font-medium animate-fadeIn">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-[11px] text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  showAsterisk: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  min: [String, Number],
  max: [String, Number],
  step: [String, Number],
  list: String,
  inputClass: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue', 'blur', 'focus']);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 py-1.5 px-3 text-xs rounded-xl';
    case 'lg':
      return 'h-11 sm:h-10 py-2 px-4 text-sm rounded-xl';
    case 'md':
    default:
      return 'h-10 sm:h-9 py-1.5 sm:py-1 px-3.5 text-sm rounded-xl';
  }
});

const inputId = computed(() => {
  return props.id || (props.label ? `input-${props.label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
});
</script>
