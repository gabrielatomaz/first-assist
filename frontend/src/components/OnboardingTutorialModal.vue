<template>
  <Teleport to="body">
    <div class="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn overflow-y-auto">
      <div class="bg-bgCard border border-teal-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-xl w-full space-y-6 relative animate-scaleIn my-auto max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
      <!-- Close / Skip Button -->
      <button 
        @click="completeTutorial" 
        class="absolute top-5 right-5 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
      >
        Skip Tutorial
      </button>

      <!-- Step Indicator Dots -->
      <div class="flex items-center space-x-2 pt-2">
        <span 
          v-for="s in totalSteps" 
          :key="s" 
          class="h-2 rounded-full transition-all duration-300"
          :class="s === currentStep ? 'w-8 bg-teal-400' : 'w-2 bg-gray-700'"
        ></span>
        <span class="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest pl-2">Step {{ currentStep }} of {{ totalSteps }}</span>
      </div>

      <!-- Step Content -->
      <div class="space-y-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border shadow-inner" :class="stepBadgeClass">
          <font-awesome-icon :icon="stepIcon" />
        </div>

        <div class="space-y-2">
          <h3 class="text-xl font-extrabold text-white tracking-tight">{{ stepTitle }}</h3>
          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
            {{ stepDescription }}
          </p>
        </div>

        <!-- Visual Feature Highlight Card -->
        <div class="bg-bgMain p-4 rounded-2xl border border-gray-800 space-y-2">
          <span class="text-[10px] font-extrabold font-mono uppercase tracking-wider text-teal-400">Pro Tip</span>
          <p class="text-xs text-gray-200 font-medium leading-normal">{{ stepTip }}</p>
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-800">
        <BaseButton 
          v-if="currentStep > 1"
          @click="currentStep--" 
          variant="secondary" 
          size="sm"
          icon="chevron-left"
        >
          Previous
        </BaseButton>
        <div v-else></div>

        <BaseButton 
          v-if="currentStep < totalSteps"
          @click="currentStep++" 
          variant="primary" 
          size="sm"
          icon="chevron-right"
        >
          Next Step
        </BaseButton>
        <BaseButton 
          v-else
          @click="completeTutorial" 
          variant="success" 
          size="sm"
          icon="check"
          :loading="saving"
          loading-text="Finishing..."
        >
          Got It, Start Working!
        </BaseButton>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';
import BaseButton from './common/BaseButton.vue';

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const currentStep = ref(1);
const totalSteps = 4;
const saving = ref(false);

const steps = [
  {
    title: 'Active Board & In Triage Queues',
    icon: 'list-check',
    badgeClass: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    description: 'FirstAssist separates live tickets into Active Board and In Triage. Public guest requests arrive in "In Triage" for FTA/CSA screening before hitting the active board.',
    tip: 'Tap Accept on In Triage tickets to quickly move them into the Open queue for your field team.'
  },
  {
    title: 'Voice Recording & Speech Transcription',
    icon: 'microphone',
    badgeClass: 'bg-accentPurple/20 text-purple-300 border-accentPurple/30',
    description: 'Need to report an issue fast while walking the pits? Hold down the microphone button when creating a report to record spoken notes in English or Portuguese.',
    tip: 'Speech-to-text automatically transcribes your voice into structured technical issue descriptions.'
  },
  {
    title: 'AI Diagnostic Suggestions & KB Grounding',
    icon: 'wand-magic-sparkles',
    badgeClass: 'bg-accentYellow/20 text-accentYellow border-accentYellow/30',
    description: 'Every ticket features AI Assistant Diagnosis powered by Gemini. The AI checks historical FRC knowledge base resolutions to suggest root causes and fixes.',
    tip: 'Click cited Knowledge Base cards to view historical solutions applied by other regional FTAs.'
  },
  {
    title: 'Regional Events & TBA Sync',
    icon: 'trophy',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Use the Event Selector header to switch competition venues. Admins and FTAs can import event rosters directly from The Blue Alliance with one click.',
    tip: 'CSAs are automatically scoped to their FTA assigned regional event for focused pit support.'
  }
];

const stepTitle = computed(() => steps[currentStep.value - 1].title);
const stepIcon = computed(() => steps[currentStep.value - 1].icon);
const stepBadgeClass = computed(() => steps[currentStep.value - 1].badgeClass);
const stepDescription = computed(() => steps[currentStep.value - 1].description);
const stepTip = computed(() => steps[currentStep.value - 1].tip);

const completeTutorial = async () => {
  saving.value = true;
  try {
    await authStore.completeOnboarding();
  } finally {
    saving.value = false;
    emit('close');
  }
};
</script>
