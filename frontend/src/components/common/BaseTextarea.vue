<template>
  <div class="w-full space-y-1.5">
    <div v-if="label || $slots.labelAction" class="flex justify-between items-center">
      <label v-if="label" :for="textareaId" class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
        {{ label }}
        <span v-if="required" class="text-accentCoral ml-0.5">*</span>
      </label>
      <slot name="labelAction" />
    </div>

    <div class="relative">
      <textarea
        :id="textareaId"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :rows="rows"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        :class="[
          'w-full px-4 py-2.5 rounded-xl border bg-bgMain text-textMain text-sm placeholder-gray-500 transition duration-150 leading-relaxed resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-accentCoral focus:ring-accentCoral/30 focus:border-accentCoral' : 'border-gray-700',
          textareaClass
        ]"
      ></textarea>

      <div v-if="$slots.action" class="absolute right-3 bottom-3 flex items-center">
        <slot name="action" />
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
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: [Number, String],
    default: 3
  },
  required: {
    type: Boolean,
    default: false
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
  id: {
    type: String,
    default: ''
  },
  textareaClass: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue', 'blur', 'focus']);

const textareaId = computed(() => {
  return props.id || (props.label ? `textarea-${props.label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
});
</script>
