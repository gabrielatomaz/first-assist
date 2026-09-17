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
        <label v-if="inputLabel" class="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
          {{ inputLabel }}
        </label>
        <textarea
          v-if="inputType === 'textarea'"
          :value="inputValue"
          @input="$emit('update:inputValue', $event.target.value)"
          :placeholder="inputPlaceholder"
          rows="3"
          class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition resize-none"
        ></textarea>
        <input
          v-else
          type="text"
          :value="inputValue"
          @input="$emit('update:inputValue', $event.target.value)"
          :placeholder="inputPlaceholder"
          @keydown.enter.prevent="handleConfirm"
          class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-center gap-2.5 pt-2">
        <button 
          type="button" 
          @click="handleCancel" 
          :disabled="loading"
          class="flex-1 py-2.5 px-4 bg-bgMain hover:bg-bgMain/80 text-gray-300 hover:text-white font-semibold rounded-xl border border-gray-700 transition text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {{ cancelText }}
        </button>
        <button 
          type="button" 
          @click="handleConfirm" 
          :disabled="loading || (inputRequired && !inputValue)"
          class="flex-1 py-2.5 px-4 font-bold rounded-xl shadow-md transition text-xs cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="confirmButtonClass"
        >
          <font-awesome-icon v-if="loading" icon="spinner" spin class="text-xs" />
          <font-awesome-icon v-else-if="confirmIcon" :icon="confirmIcon" class="text-xs" />
          <span>{{ loading ? loadingText : confirmText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
    case 'danger': return 'border-accentCoral/40';
    case 'warning': return 'border-amber-500/40';
    case 'success': return 'border-emerald-500/40';
    case 'primary': return 'border-primaryTeal/40';
    default: return 'border-gray-700/80';
  }
});

const iconContainerClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-accentCoral/15 text-accentCoral border-accentCoral/30';
    case 'warning': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'success': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'primary': return 'bg-primaryTeal/15 text-primaryTeal border-primaryTeal/30';
    default: return 'bg-gray-800 text-gray-300 border-gray-700';
  }
});

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-accentCoral hover:bg-accentCoral/90 text-white';
    case 'warning': return 'bg-amber-500 hover:bg-amber-400 text-slate-950';
    case 'success': return 'bg-emerald-500 hover:bg-emerald-400 text-slate-950';
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
