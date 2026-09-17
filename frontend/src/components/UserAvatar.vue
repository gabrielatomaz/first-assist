<template>
  <div
    v-if="hasBg"
    class="rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 transition-all duration-200"
    :style="{ backgroundColor: bgStyleColor }"
    :class="containerSizeClass"
    :title="title"
  >
    <font-awesome-icon 
      :icon="icon || 'user'" 
      :style="{ color: color || '#38777E' }"
      :class="[iconSizeClass, 'inline-block transition-all duration-200']"
    />
  </div>
  <font-awesome-icon 
    v-else
    :icon="icon || 'user'" 
    :style="{ color: color || '#38777E' }"
    :class="[sizeClass, 'inline-block transition-all duration-200 flex-shrink-0']"
    :title="title"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: { type: String, default: 'user' },
  color: { type: String, default: '#38777E' },
  size: { type: String, default: 'md' },
  title: { type: String, default: '' },
  hasBg: { type: Boolean, default: false }
});

const bgStyleColor = computed(() => {
  const c = props.color || '#38777E';
  return c.startsWith('#') ? `${c}25` : 'rgba(56, 119, 126, 0.2)';
});

const containerSizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-6 h-6';
    case 'sm': return 'w-8 h-8';
    case 'lg': return 'w-11 h-11';
    case 'xl': return 'w-14 h-14';
    case 'md':
    default: return 'w-9 h-9';
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[10px]';
    case 'sm': return 'text-xs';
    case 'lg': return 'text-base';
    case 'xl': return 'text-2xl';
    case 'md':
    default: return 'text-sm';
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[11px]';
    case 'sm': return 'text-sm';
    case 'lg': return 'text-xl';
    case 'xl': return 'text-4xl';
    case 'md':
    default: return 'text-base';
  }
});
</script>
