<template>
  <div class="space-y-6">
    <!-- AI Suggestion Container -->
    <div class="bg-accentPurple/5 border-accentPurple/20 border-2 p-6 rounded-2xl transition-all duration-300 space-y-6">
      <div class="flex justify-between items-center border-b border-gray-200/50 pb-3">
        <div class="flex items-center space-x-2">
          <!-- AI Icon -->
          <span class="text-accentPurple text-xl">🤖</span>
          <h3 class="text-lg font-bold text-accentPurple font-sans tracking-tight">AI Assistant Diagnosis</h3>
        </div>
        
        <div v-if="suggestion && !loading" class="flex items-center space-x-2 text-xs">
          <span class="text-gray-500 font-medium">Was this suggestion helpful?</span>
          <div class="flex items-center space-x-1">
            <button
              @click="rateSuggestion('HELPFUL')"
              :class="suggestion.rating === 'HELPFUL' ? 'bg-primaryTeal text-white' : 'bg-white text-gray-400 hover:text-gray-600'"
              class="p-1 px-2 rounded border border-gray-200 transition duration-150 text-xs font-semibold flex items-center shadow-sm"
              title="Helpful"
            >
              👍 Helpful
            </button>
            <button
              @click="rateSuggestion('NOT_HELPFUL')"
              :class="suggestion.rating === 'NOT_HELPFUL' ? 'bg-accentCoral text-white border-accentCoral/30' : 'bg-white text-gray-400 hover:text-gray-600'"
              class="p-1 px-2 rounded border border-gray-200 transition duration-150 text-xs font-semibold flex items-center shadow-sm"
              title="Reject suggestion"
            >
              👎 Reject
            </button>
          </div>
        </div>
      </div>

      <!-- Graceful Fallback Notice (US-AI-006) -->
      <div v-if="error" class="bg-amber-50 border border-amber-200/50 p-4 rounded-xl text-amber-800 text-xs flex flex-col space-y-1">
        <span class="font-bold">⚠️ AI Diagnostics Offline</span>
        <span>The AI analysis helper is currently unavailable. Please continue investigating the incident manually.</span>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-6">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-accentPurple border-t-transparent"></div>
        <p class="text-xs text-accentPurple/60 mt-2">Generating diagnostic recommendation...</p>
      </div>

      <!-- Main suggestions -->
      <div v-else-if="suggestion" class="space-y-4">
        <div class="space-y-4 text-sm text-gray-700">
          <div>
            <h4 class="font-bold text-accentPurple text-xs uppercase tracking-wider mb-1">Likely Root Cause</h4>
            <p class="bg-white/80 p-3 rounded-lg border border-accentPurple/5 text-gray-800 leading-relaxed font-medium">
              {{ suggestion.suggestedCause }}
            </p>
          </div>

          <div>
            <h4 class="font-bold text-accentPurple text-xs uppercase tracking-wider mb-1">Recommended Solution</h4>
            <p class="bg-white/80 p-3 rounded-lg border border-accentPurple/5 text-gray-800 leading-relaxed font-medium">
              {{ suggestion.suggestedSolution }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Historical Incidents (US-AI-004) -->
    <div v-if="relatedIncidents.length > 0" class="bg-white p-6 rounded-2xl border border-gray-100 shadow space-y-4">
      <div class="flex items-center space-x-2 border-b pb-3">
        <span class="text-lg">📚</span>
        <h4 class="text-base font-bold text-primaryNavy tracking-tight">Related Resolved Tickets</h4>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="ticket in relatedIncidents" 
          :key="ticket._id"
          class="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition duration-150 flex flex-col space-y-2 text-xs"
        >
          <div class="flex justify-between items-center">
            <span class="font-extrabold text-primaryNavy text-sm">Team {{ ticket.teamNumber }}</span>
            <span class="text-[10px] bg-green-100 text-green-800 font-bold uppercase font-mono px-2 py-0.5 rounded">
              Resolved
            </span>
          </div>
          
          <p class="text-gray-500 font-medium line-clamp-2">{{ ticket.description }}</p>
          
          <div class="grid grid-cols-2 gap-4 border-t pt-2 mt-1">
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase">Root Cause</span>
              <span class="text-gray-700 font-medium line-clamp-1">{{ ticket.rootCause }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase">Solution</span>
              <span class="text-gray-700 font-medium line-clamp-1">{{ ticket.appliedSolution }}</span>
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
    const response = await fetch(`http://localhost:3000/api/incidents/${props.incidentId}/ai-suggestions`, {
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
    const response = await fetch(`http://localhost:3000/api/incidents/${props.incidentId}/related`, {
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
    const response = await fetch(`http://localhost:3000/api/ai-suggestions/${suggestion.value._id}/rating`, {
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
