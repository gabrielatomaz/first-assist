<template>
  <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto text-textMain">
    <div>
      <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">Knowledge Base</h2>
      <p class="text-sm text-gray-400 mt-1">Search through resolved tickets to find proven root causes and applied fixes.</p>
    </div>

    <!-- Search & Filters Container -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
      <div class="flex items-center space-x-3 border-b border-gray-700 pb-4">
        <span class="text-gray-400 text-lg">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Type keywords (e.g. radio, fuse, breaker, CAN)..."
          @input="debouncedSearch"
          class="w-full bg-transparent focus:outline-none text-sm text-textMain placeholder-gray-500"
        >
        <button v-if="searchQuery" @click="clearSearch" class="text-xs text-accentYellow hover:underline font-semibold transition">
          Clear
        </button>
      </div>

      <!-- Advanced filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Category</label>
          <select v-model="filters.category" @change="executeSearch" class="w-full px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-bgCard font-semibold text-textMain">
            <option value="" class="bg-bgCard">All Categories</option>
            <option value="RADIO_COMMS" class="bg-bgCard">Radio & Comms</option>
            <option value="ROBOTIC_POWER" class="bg-bgCard">Robot Power Path</option>
            <option value="CAN_BUS" class="bg-bgCard">CAN Bus Connection</option>
            <option value="MECHANICAL" class="bg-bgCard">Mechanical Issue</option>
            <option value="CODE_EXCEPTION" class="bg-bgCard">Robot User Code</option>
            <option value="OTHER" class="bg-bgCard">Other Issues</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Priority</label>
          <select v-model="filters.priority" @change="executeSearch" class="w-full px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-bgCard font-semibold text-textMain">
            <option value="" class="bg-bgCard">All Priorities</option>
            <option value="LOW" class="bg-bgCard">Low</option>
            <option value="MEDIUM" class="bg-bgCard">Medium</option>
            <option value="HIGH" class="bg-bgCard">High</option>
            <option value="CRITICAL" class="bg-bgCard">Critical</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Team Number</label>
          <input
            v-model.number="filters.teamNumber"
            type="number"
            placeholder="e.g. 254"
            @input="debouncedSearch"
            class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgCard focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs text-textMain placeholder-gray-500"
          >
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="searching" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primaryTeal border-t-transparent"></div>
      <p class="text-sm text-gray-400 mt-2">Searching knowledge base...</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="incident in results" :key="incident._id" class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4 hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <h3 class="font-extrabold text-white text-lg">Team {{ incident.teamNumber }}</h3>
              <span class="bg-primaryTeal/10 text-primaryTeal px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                {{ formatCategory(incident.category) }}
              </span>
            </div>
            <p class="text-xs text-gray-400 font-medium">Match: {{ incident.matchNumber || 'N/A' }} | Resolved on {{ formatDate(incident.resolvedAt) }}</p>
          </div>
          <span class="bg-green-950/40 text-green-400 border border-green-900/30 px-2 py-0.5 rounded text-xs font-semibold uppercase font-mono tracking-wider">
            {{ incident.status }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-3 bg-bgMain rounded-lg border border-gray-800">
            <h4 class="font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Description</h4>
            <p class="text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{{ incident.description }}</p>
          </div>
          <div class="p-3 bg-bgMain rounded-lg border border-gray-800">
            <h4 class="font-bold text-primaryTeal uppercase tracking-wider mb-1">Root Cause</h4>
            <p class="text-gray-200 leading-relaxed font-medium">{{ incident.rootCause }}</p>
          </div>
          <div class="p-3 bg-bgMain rounded-lg border border-gray-800">
            <h4 class="font-bold text-primaryTeal uppercase tracking-wider mb-1">Applied Fix</h4>
            <p class="text-gray-200 leading-relaxed font-medium">{{ incident.appliedSolution }}</p>
          </div>
        </div>
      </div>

      <div v-if="results.length === 0" class="text-center py-12 bg-bgCard rounded-2xl border border-dashed border-gray-800">
        <p class="text-gray-400 text-sm font-medium">No matching resolved incident records found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const searchQuery = ref('');
const filters = ref({ category: '', priority: '', teamNumber: null });
const results = ref([]);
const searching = ref(true);
let debounceTimeout = null;

const executeSearch = async () => {
  searching.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value.trim()) params.append('q', searchQuery.value);
    if (filters.value.category) params.append('category', filters.value.category);
    if (filters.value.priority) params.append('priority', filters.value.priority);
    if (filters.value.teamNumber) params.append('teamNumber', filters.value.teamNumber);
    
    const response = await fetch(`http://localhost:3000/api/incidents/search?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to query knowledge base');
    results.value = await response.json();
  } catch (err) {
    console.error(err);
  } finally {
    searching.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    executeSearch();
  }, 300); // wait 300ms
};

const clearSearch = () => {
  searchQuery.value = '';
  executeSearch();
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCategory = (cat) => {
  if (!cat) return 'OTHER';
  return cat.replace('_', ' ');
};

onMounted(() => {
  executeSearch();
});
</script>
