<template>
  <div class="space-y-6">
    <!-- AI Suggestion Container -->
    <div class="bg-accentPurple/5 border-accentPurple/20 border-2 p-6 rounded-2xl transition-all duration-300 space-y-6">
      <div class="flex justify-between items-center border-b border-gray-200/50 pb-3">
        <div class="flex items-center space-x-2">
          <!-- AI Icon -->
          <font-awesome-icon icon="robot" class="text-accentPurple text-xl" />
          <h3 class="text-lg font-bold text-accentPurple font-sans tracking-tight">AI Assistant Diagnosis</h3>
        </div>
        
        <div v-if="suggestion && !loading" class="flex items-center space-x-2 text-xs">
          <div class="flex items-center space-x-1">
            <button
              @click="rateSuggestion('HELPFUL')"
              :class="suggestion.rating === 'HELPFUL' ? 'bg-primaryTeal text-white border-primaryTeal' : 'bg-bgMain text-gray-300 hover:text-white border-gray-700'"
              class="p-1.5 px-2.5 rounded border transition duration-150 text-sm font-semibold flex items-center shadow-sm"
              title="Helpful"
            >
              <font-awesome-icon icon="thumbs-up" />
            </button>
            <button
              @click="rateSuggestion('NOT_HELPFUL')"
              :class="suggestion.rating === 'NOT_HELPFUL' ? 'bg-accentCoral text-white border-accentCoral/30' : 'bg-bgMain text-gray-300 hover:text-white border-gray-700'"
              class="p-1.5 px-2.5 rounded border transition duration-150 text-sm font-semibold flex items-center shadow-sm"
              title="Reject suggestion"
            >
              <font-awesome-icon icon="thumbs-down" />
            </button>
          </div>
        </div>
      </div>

      <!-- Graceful Fallback Notice (US-AI-006) -->
      <div v-if="error" class="bg-amber-950/40 border border-amber-900/50 p-4 rounded-xl text-amber-300 text-xs flex flex-col space-y-1">
        <span class="font-bold"><font-awesome-icon icon="triangle-exclamation" class="mr-1" /> AI Diagnostics Offline</span>
        <span>The AI analysis helper is currently unavailable. Please continue investigating the incident manually.</span>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-6">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-accentPurple border-t-transparent"></div>
        <p class="text-xs text-accentPurple/60 mt-2">Generating diagnostic recommendation...</p>
      </div>

      <!-- Main suggestions -->
      <div v-else-if="suggestion" class="space-y-4">
        <div class="space-y-4 text-sm text-textMain">
          <div>
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
        </div>
      </div>
    </div>

    <!-- Related Historical Incidents (US-AI-004) -->
    <div v-if="relatedIncidents.length > 0" class="bg-bgCard p-6 rounded-2xl border border-gray-700 shadow space-y-4">
      <div class="flex items-center space-x-2 border-b border-gray-700 pb-3">
        <font-awesome-icon icon="book" class="text-lg text-primaryTeal" />
        <h4 class="text-base font-bold text-primaryTeal tracking-tight">Related Resolved Tickets</h4>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="ticket in relatedIncidents" 
          :key="ticket._id"
          class="p-4 rounded-xl border border-gray-800 bg-bgMain/60 hover:bg-bgMain transition duration-150 flex flex-col space-y-2 text-xs"
        >
          <div class="flex justify-between items-center">
            <span class="font-extrabold text-white text-sm">Team {{ ticket.teamNumber }}</span>
            <span class="text-[10px] bg-green-950/40 text-green-400 border border-green-900/30 font-bold uppercase font-mono px-2 py-0.5 rounded">
              Resolved
            </span>
          </div>
          
          <p class="text-gray-300 font-medium line-clamp-2">{{ ticket.description }}</p>
          
          <div class="grid grid-cols-2 gap-4 border-t border-gray-800 pt-2 mt-1">
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase">Root Cause</span>
              <span class="text-gray-200 font-medium line-clamp-1">{{ ticket.rootCause }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase">Solution</span>
              <span class="text-gray-200 font-medium line-clamp-1">{{ ticket.appliedSolution }}</span>
            </div>
          </div>
        </div>
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
const relatedIncidents = ref([]);
const loading = ref(true);
const error = ref(null);

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

const fetchRelatedIncidents = async () => {
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/related`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      relatedIncidents.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to load related historical incidents:', err);
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
  fetchRelatedIncidents();
});
</script>
