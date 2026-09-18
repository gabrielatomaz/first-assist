<template>
  <BaseCard class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-800 pb-2 min-h-[32px]">
      <div class="flex items-center space-x-2 min-w-0">
        <font-awesome-icon icon="robot" class="text-accentPurple text-sm flex-shrink-0" />
        <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">AI Assistant Diagnosis</h3>
      </div>

      <div class="flex items-center space-x-2 flex-shrink-0">
        <span v-if="suggestion?.isRagGrounded" class="h-6 px-2.5 rounded-md text-xs font-bold font-mono uppercase tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/30 inline-flex items-center justify-center leading-none flex-shrink-0">
          <font-awesome-icon icon="database" class="mr-1.5 text-[10px]" /> KB Solution
        </span>
        <span v-else-if="suggestion" class="h-6 px-2.5 rounded-md text-xs font-bold font-mono uppercase tracking-wider bg-accentPurple/15 text-accentPurple border border-accentPurple/30 inline-flex items-center justify-center leading-none flex-shrink-0">
          <font-awesome-icon icon="wand-magic-sparkles" class="mr-1.5 text-[10px]" /> AI Generated
        </span>
        <BaseButton
          v-if="suggestion && !loading"
          @click="generateDiagnosis"
          :disabled="generating"
          :loading="generating"
          variant="ghost"
          size="icon-sm"
          icon="arrows-rotate"
          title="Re-generate AI diagnosis"
        />
      </div>
    </div>

    <!-- Graceful Fallback Notice (Network / System Issue / Response Not Found) -->
    <div v-if="error" class="bg-amber-950/40 border border-amber-900/50 p-3 rounded-xl text-amber-300 text-xs flex flex-col space-y-1">
      <span class="font-bold flex items-center gap-1.5 text-amber-400">
        <font-awesome-icon icon="triangle-exclamation" /> Response Not Found
      </span>
      <span class="text-gray-200 font-medium">Diagnostic response could not be determined due to a network or service issue ({{ error }}). Please inspect hardware connections manually.</span>
    </div>

    <!-- Initial Loading / Generating State -->
    <div v-else-if="loading || generating" class="text-center py-6">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-accentPurple border-t-transparent"></div>
      <p class="text-xs text-accentPurple/80 mt-2 font-medium">
        {{ generating ? 'Searching Knowledge Base & analyzing incident details with AI...' : 'Checking AI diagnosis status...' }}
      </p>
    </div>

    <!-- Main suggestions -->
    <div v-else-if="suggestion" class="space-y-4">
      <div class="space-y-3 text-sm text-textMain">
        <!-- Not Found in Knowledge Base Notice -->
        <div v-if="!suggestion.isRagGrounded && (!suggestion.suggestedCause || !suggestion.suggestedCause.toLowerCase().includes('response not found'))" class="p-3 bg-accentPurple/10 border border-accentPurple/25 rounded-xl text-xs text-textMain flex items-center space-x-2 animate-fadeIn">
          <font-awesome-icon icon="circle-info" class="text-sm text-accentPurple flex-shrink-0" />
          <span class="font-medium">Not found in historical knowledge base. Generated via live diagnosis:</span>
        </div>

        <!-- Response Not Found Warning Banner if AI/RAG could not determine diagnosis -->
        <div v-if="suggestion.suggestedCause && suggestion.suggestedCause.toLowerCase().includes('response not found')" class="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl space-y-1.5 text-xs">
          <div class="flex items-center gap-1.5 font-bold text-amber-400">
            <font-awesome-icon icon="triangle-exclamation" />
            <span>Response Not Found</span>
          </div>
          <p class="text-amber-200/90 font-medium leading-relaxed">{{ suggestion.suggestedCause }}</p>
        </div>
        <div v-else>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Likely Root Cause</label>
          <div class="bg-bgMain p-3 rounded-xl border border-gray-800/80 text-xs text-gray-200 leading-relaxed font-medium">
            {{ suggestion.suggestedCause }}
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Recommended Solution</label>
          <div class="bg-bgMain p-3 rounded-xl border border-gray-800/80 text-xs text-gray-200 leading-relaxed font-medium">
            {{ suggestion.suggestedSolution }}
          </div>
        </div>

        <!-- Cited Knowledge Base Resolutions (Clickable Tickets) -->
        <div v-if="suggestion.isRagGrounded && suggestion.citedIncidents && suggestion.citedIncidents.length > 0" class="pt-2 border-t border-gray-800 space-y-2">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Cited Knowledge Base Resolutions</label>
          <router-link
            v-for="cite in suggestion.citedIncidents" 
            :key="cite.incidentId || cite.teamNumber"
            :to="cite.incidentId ? `/incidents/${cite.incidentId}` : '#'"
            class="block bg-bgMain p-3 rounded-xl border border-gray-800 hover:border-primaryTeal/50 hover:bg-bgMain/80 transition duration-150 text-xs space-y-1 cursor-pointer group shadow-sm"
          >
            <div class="flex justify-between items-center font-bold text-gray-200">
              <span class="group-hover:text-primaryTeal group-hover:underline transition flex items-center gap-1.5">
                <span>Team {{ cite.teamNumber }} ({{ (cite.eventCode || 'brba').toUpperCase() }} • {{ cite.matchNumber }})</span>
                <font-awesome-icon icon="arrow-up-right-from-square" class="text-[10px] text-gray-400 group-hover:text-primaryTeal" />
              </span>
              <span v-if="cite.similarityScore" class="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-md">
                {{ cite.similarityScore }}% Match
              </span>
            </div>
            <p class="text-gray-300 text-[11px] font-medium leading-relaxed">
              <span class="text-gray-400 font-semibold">Applied Fix:</span> {{ cite.appliedSolution }}
            </p>
          </router-link>
        </div>

        <!-- Bottom Feedback / Thumbs Rating Section -->
        <div class="pt-3 border-t border-gray-800 flex items-center justify-between">
          <span class="text-xs text-gray-400 font-medium">Was this diagnosis helpful?</span>
          <div class="inline-flex rounded-xl shadow-sm border border-gray-800 bg-bgMain overflow-hidden">
            <!-- Thumbs Up Button -->
            <button
              @click="rateSuggestion('HELPFUL')"
              :class="suggestion.rating === 'HELPFUL' ? 'bg-accentGreen/25 text-emerald-400 font-bold' : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'"
              class="w-8 h-8 transition duration-150 text-xs font-semibold flex items-center justify-center cursor-pointer border-r border-gray-800"
              title="Helpful"
            >
              <font-awesome-icon icon="thumbs-up" />
            </button>

            <!-- Thumbs Down Button -->
            <button
              @click="rateSuggestion('NOT_HELPFUL')"
              :class="suggestion.rating === 'NOT_HELPFUL' ? 'bg-accentCoral/25 text-red-400 font-bold' : 'text-gray-300 hover:text-accentCoral hover:bg-accentCoral/10'"
              class="w-8 h-8 transition duration-150 text-xs font-semibold flex items-center justify-center cursor-pointer"
              title="Reject suggestion"
            >
              <font-awesome-icon icon="thumbs-down" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- On-Demand Trigger Button State (when no suggestion generated yet) -->
    <div v-else-if="!suggestion" class="text-center py-4 space-y-3">
      <p class="text-xs text-gray-300 font-medium">No AI diagnostic recommendation generated yet for this incident.</p>
      <BaseButton
        @click="generateDiagnosis"
        :loading="generating"
        loading-text="Analyzing incident..."
        variant="ai"
        size="sm"
        icon="wand-magic-sparkles"
      >
        Generate AI Diagnosis
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';
import BaseCard from './common/BaseCard.vue';
import BaseButton from './common/BaseButton.vue';

const props = defineProps({
  incidentId: { type: String, required: true }
});

const authStore = useAuthStore();
const suggestion = ref(null);
const loading = ref(true);
const generating = ref(false);
const error = ref(null);

const formatCategory = (cat) => {
  if (!cat) return 'OTHER';
  return cat.replace('_', ' ');
};

const fetchSuggestions = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/ai-suggestions`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to retrieve suggestions');
    const data = await response.json();
    if (data.suggestions && data.suggestions.length > 0) {
      suggestion.value = data.suggestions[0];
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const generateDiagnosis = async () => {
  generating.value = true;
  error.value = null;
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/ai-suggestions`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate AI diagnosis');
    }
    const data = await response.json();
    if (data.suggestion) {
      suggestion.value = data.suggestion;
    } else if (data.suggestions && data.suggestions.length > 0) {
      suggestion.value = data.suggestions[0];
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    generating.value = false;
  }
};

const rateSuggestion = async (ratingVal) => {
  if (!suggestion.value) return;
  try {
    const response = await fetch(getApiUrl(`/ai-suggestions/${suggestion.value._id}/rating`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ rating: ratingVal })
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to update feedback rating');
    suggestion.value.rating = data.rating;
  } catch (err) {
    alert(err.message);
  }
};

onMounted(() => {
  fetchSuggestions();
});
</script>
