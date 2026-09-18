<template>
  <div 
    v-if="modelValue" 
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
    @click.self="handleBackdropClick"
    @keydown.esc="handleCancel"
  >
    <div 
      class="bg-bgCard border rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-fadeIn relative"
      :class="borderClass"
    >
      <!-- Icon Indicator Badge -->
      <div 
        class="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl border shadow-inner"
        :class="iconContainerClass"
      >
        <font-awesome-icon :icon="icon" />
      </div>

      <!-- Title & Description -->
      <div class="space-y-1.5">
        <h4 class="text-base font-extrabold text-white tracking-tight">{{ title }}</h4>
        <p v-if="message" class="text-xs text-gray-300 leading-relaxed font-medium">
          {{ message }}
        </p>
      </div>

      <!-- Optional Custom Slot or Detail Slot -->
      <slot name="content"></slot>

      <!-- Optional Input/Textarea field for Prompts / Reasons -->
      <div v-if="showInput" class="text-left space-y-1.5 pt-1">
        <BaseTextarea
          v-if="inputType === 'textarea'"
          :model-value="inputValue"
          @update:model-value="$emit('update:inputValue', $event)"
          :label="inputLabel"
          :placeholder="inputPlaceholder"
          rows="3"
        />
        <BaseInput
          v-else
          :model-value="inputValue"
          @update:model-value="$emit('update:inputValue', $event)"
          :label="inputLabel"
          :placeholder="inputPlaceholder"
          @keydown.enter.prevent="handleConfirm"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-center gap-2.5 pt-2">
        <BaseButton 
          type="button" 
          variant="secondary"
          size="md"
          @click="handleCancel" 
          :disabled="loading"
          class="flex-1"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton 
          type="button" 
          :variant="variant === 'danger' ? 'danger' : (variant === 'success' ? 'success' : 'primary')"
          size="md"
          @click="handleConfirm" 
          :disabled="loading || (inputRequired && !inputValue)"
          :loading="loading"
          :loading-text="loadingText"
          :icon="confirmIcon || ''"
          class="flex-1"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from './common/BaseButton.vue';
import BaseInput from './common/BaseInput.vue';
import BaseTextarea from './common/BaseTextarea.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  icon: { type: String, default: 'triangle-exclamation' },
  variant: { 
    type: String, 
    default: 'danger', 
    validator: (v) => ['danger', 'warning', 'primary', 'success', 'neutral'].includes(v)
  },
  confirmText: { type: String, default: 'Confirm' },
  confirmIcon: { type: String, default: null },
  cancelText: { type: String, default: 'Cancel' },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Processing...' },
  showInput: { type: Boolean, default: false },
  inputLabel: { type: String, default: '' },
  inputPlaceholder: { type: String, default: '' },
  inputValue: { type: String, default: '' },
  inputType: { type: String, default: 'text' },
  inputRequired: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'update:inputValue', 'confirm', 'cancel']);

const borderClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'border-red-500/40';
    case 'warning': return 'border-amber-500/40';
    case 'success': return 'border-emerald-500/40';
    case 'primary': return 'border-teal-500/40';
    default: return 'border-gray-800';
  }
});

const iconContainerClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-red-500/15 text-accentCoral border border-red-500/30';
    case 'warning': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'success': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'primary': return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
    default: return 'bg-gray-800 text-gray-300 border border-gray-800';
  }
});

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-accentCoral hover:bg-accentCoral/90 text-white';
    case 'warning': return 'bg-amber-600 hover:bg-amber-500 text-white';
    case 'success': return 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold';
    case 'primary': return 'bg-primaryTeal hover:bg-primaryTeal/90 text-white';
    default: return 'bg-gray-700 hover:bg-gray-600 text-white';
  }
});

const handleConfirm = () => {
  if (props.loading) return;
  if (props.inputRequired && !props.inputValue) return;
  emit('confirm');
};

const handleCancel = () => {
  if (props.loading) return;
  emit('update:modelValue', false);
  emit('cancel');
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !props.loading) {
    handleCancel();
  }
};
</script>
