<template>
  <Teleport to="body">
    <div 
      class="fixed inset-0 w-screen h-screen bg-black/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <div class="bg-bgCard border border-gray-800 p-5 rounded-2xl shadow-2xl max-w-sm w-full space-y-3.5 relative animate-scaleIn text-center">
        <!-- Close (X) Button -->
        <button 
          type="button"
          @click="emit('close')" 
          class="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Close"
        >
          <font-awesome-icon icon="xmark" class="text-sm" />
        </button>

        <!-- Icon -->
        <div class="w-11 h-11 mx-auto rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 text-base shadow-inner">
          <font-awesome-icon icon="globe" />
        </div>

        <!-- Title & Combined Content -->
        <div class="space-y-2.5">
          <h3 class="text-base font-bold text-white tracking-tight">
            {{ isPt ? 'Idioma de Áudio e IA' : 'Audio & AI Language' }}
          </h3>
          <p class="text-xs text-gray-300 leading-relaxed font-medium">
            {{ isPt 
              ? 'Esta opção é utilizada para a transcrição de incidentes por áudio e para a interpretação dos incidentes com Inteligência Artificial.' 
              : 'This setting is used for transcribing incidents by audio and when using AI to interpret incidents.' 
            }}
          </p>
          <div class="bg-bgMain/70 border border-gray-800 rounded-xl p-2.5 text-[11px] text-gray-400 font-medium text-center">
            {{ isPt 
              ? 'Nota: A interface da página não será traduzida.' 
              : 'Note: The page interface will not be translated.' 
            }}
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-1">
          <BaseButton 
            type="button" 
            variant="primary" 
            size="sm" 
            @click="emit('close')" 
            class="w-full justify-center font-bold"
          >
            {{ isPt ? 'Entendi' : 'Got it' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from './common/BaseButton.vue';

const props = defineProps({
  locale: {
    type: String,
    default: 'en'
  }
});

const emit = defineEmits(['close']);

const isPt = computed(() => props.locale === 'pt');
</script>
