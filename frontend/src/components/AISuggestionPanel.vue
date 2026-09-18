<template>
  <div class="space-y-6">
    <!-- AI Suggestion Container -->
    <div class="bg-accentPurple/5 border-accentPurple/20 border-2 p-6 rounded-2xl transition-all duration-300 space-y-6">
      <div class="border-b border-gray-700/50 pb-3 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2 min-w-0">
            <!-- AI Icon -->
            <font-awesome-icon icon="robot" class="text-accentPurple text-xl flex-shrink-0" />
            <h3 class="text-base sm:text-lg font-bold text-accentPurple font-sans tracking-tight truncate">AI Assistant Diagnosis</h3>
          </div>

          <!-- Action Button: Only Refresh on top -->
          <div v-if="suggestion && !loading && !generating" class="flex items-center flex-shrink-0">
            <button
              @click="generateDiagnosis"
              :disabled="generating"
              class="w-9 h-9 flex items-center justify-center bg-bgMain text-gray-300 hover:text-white border border-gray-700 hover:bg-gray-800 rounded-xl transition duration-150 shadow-sm cursor-pointer disabled:opacity-50 text-sm"
              title="Re-generate AI diagnosis"
            >
              <font-awesome-icon icon="arrows-rotate" :class="{ 'animate-spin': generating }" class="text-sm" />
            </button>
          </div>
        </div>

        <!-- Knowledge Base Status Badge (Below Title) -->
        <div class="pt-0.5">
          <span v-if="suggestion?.isRagGrounded" class="inline-flex items-center justify-center text-center px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider bg-primaryTeal/15 text-primaryTeal border border-primaryTeal/30 shadow-sm">
            <font-awesome-icon icon="database" class="mr-1.5 text-[10px]" /> Knowledge Base Solution
          </span>
          <span v-else-if="suggestion" class="inline-flex items-center justify-center text-center px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider bg-accentPurple/15 text-accentPurple border border-accentPurple/30 shadow-sm">
            <font-awesome-icon icon="wand-magic-sparkles" class="mr-1.5 text-[10px]" /> AI Generated Suggestion
          </span>
        </div>
      </div>

      <!-- Graceful Fallback Notice (Network / System Issue / Response Not Found) -->
      <div v-if="error" class="bg-amber-950/40 border border-amber-900/50 p-4 rounded-xl text-amber-300 text-xs flex flex-col space-y-1">
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
        <div class="space-y-4 text-sm text-textMain">
          <!-- Not Found in Knowledge Base Notice -->
          <div v-if="!suggestion.isRagGrounded && (!suggestion.suggestedCause || !suggestion.suggestedCause.toLowerCase().includes('response not found'))" class="p-3 bg-accentPurple/10 border border-accentPurple/25 rounded-xl text-xs text-purple-200 flex items-center space-x-2 animate-fadeIn">
            <font-awesome-icon icon="circle-info" class="text-sm text-accentPurple flex-shrink-0" />
            <span class="font-medium">It was not found in our knowledge base, but here is an AI suggestion:</span>
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
            <h4 class="font-bold text-accentPurple text-xs uppercase tracking-wider mb-1">Likely Root Cause</h4>
            <p class="bg-bgMain p-3 rounded-lg border border-gray-700 text-gray-200 leading-relaxed font-medium">
              {{ suggestion.suggestedCause }}
            </p>
          </div>

          <div>
            <h4 class="font-bold text-accentPurple text-xs uppercase tracking-wider mb-1">Recommended Solution</h4>
            <p class="bg-bgMain p-3 rounded-lg border border-gray-700 text-gray-200 leading-relaxed font-medium">
              {{ suggestion.suggestedSolution }}
            </p>
          </div>

          <!-- Cited Knowledge Base Resolutions (Clickable Tickets) -->
          <div v-if="suggestion.isRagGrounded && suggestion.citedIncidents && suggestion.citedIncidents.length > 0" class="pt-2 border-t border-gray-700/60 space-y-2">
            <h4 class="font-bold text-accentPurple text-xs uppercase tracking-wider mb-2">Cited Knowledge Base Resolutions</h4>
            <router-link
              v-for="cite in suggestion.citedIncidents" 
              :key="cite.incidentId || cite.teamNumber"
              :to="cite.incidentId ? `/incidents/${cite.incidentId}` : '#'"
              class="block bg-bgMain p-3 rounded-xl border border-gray-700 hover:border-primaryTeal/50 hover:bg-bgMain/80 transition duration-150 text-xs space-y-1 cursor-pointer group shadow-sm"
            >
                <div class="flex justify-between items-center font-bold text-gray-200">
                  <span class="group-hover:text-primaryTeal group-hover:underline transition flex items-center gap-1.5">
                    <span>Team {{ cite.teamNumber }} ({{ (cite.eventCode || 'brba').toUpperCase() }} • {{ cite.matchNumber }})</span>
                    <font-awesome-icon icon="arrow-up-right-from-square" class="text-[10px] text-gray-400 group-hover:text-primaryTeal" />
                  </span>
                  <span v-if="cite.similarityScore" class="text-[10px] font-mono font-bold text-accentGreen bg-accentGreen/10 border border-accentGreen/30 px-2 py-0.5 rounded-md">
                    {{ cite.similarityScore }}% Match
                  </span>
                </div>
                <p class="text-gray-300 text-[11px] font-medium leading-relaxed">
                  <span class="text-gray-400 font-semibold">Applied Fix:</span> {{ cite.appliedSolution }}
                </p>
              </router-link>
          </div>

          <!-- Bottom Feedback / Thumbs Rating Section -->
          <div class="pt-3 border-t border-gray-700/60 flex items-center justify-between">
            <span class="text-xs text-gray-400 font-medium">Was this suggestion helpful?</span>
            <div class="inline-flex rounded-xl shadow-sm border border-gray-700 bg-bgMain overflow-hidden">
              <!-- Thumbs Up Button -->
              <button
                @click="rateSuggestion('HELPFUL')"
                :class="suggestion.rating === 'HELPFUL' ? 'bg-accentGreen/25 text-emerald-400 font-bold' : 'text-gray-300 hover:text-accentGreen hover:bg-accentGreen/10'"
                class="w-9 h-9 transition duration-150 text-sm font-semibold flex items-center justify-center cursor-pointer border-r border-gray-700"
                title="Helpful"
              >
                <font-awesome-icon icon="thumbs-up" class="text-sm" />
              </button>

              <!-- Thumbs Down Button -->
              <button
                @click="rateSuggestion('NOT_HELPFUL')"
                :class="suggestion.rating === 'NOT_HELPFUL' ? 'bg-accentCoral/25 text-red-400 font-bold' : 'text-gray-300 hover:text-accentCoral hover:bg-accentCoral/10'"
                class="w-9 h-9 transition duration-150 text-sm font-semibold flex items-center justify-center cursor-pointer"
                title="Reject suggestion"
              >
                <font-awesome-icon icon="thumbs-down" class="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- On-Demand Trigger Button State (when no suggestion generated yet) -->
      <div v-else-if="!suggestion" class="text-center py-4 space-y-3">
        <p class="text-xs text-gray-300 font-medium">No AI diagnostic recommendation generated yet for this incident.</p>
        <button
          @click="generateDiagnosis"
          :disabled="generating"
          class="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 mx-auto shadow-md border border-purple-500/30 cursor-pointer"
        >
          <font-awesome-icon icon="wand-magic-sparkles" class="mr-1 text-purple-200" />
          <span>Generate AI Diagnosis</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

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
