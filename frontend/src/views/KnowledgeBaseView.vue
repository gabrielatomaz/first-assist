<template>
  <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto text-textMain">
    <div>
      <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">Knowledge Base</h2>
      <p class="text-sm text-gray-400 mt-1">Search through resolved tickets to find proven root causes and applied fixes.</p>
    </div>

    <!-- Search & Filters Container -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
      <div class="flex items-center space-x-3 bg-bgMain px-4 py-3 rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-primaryTeal/30 focus-within:border-primaryTeal transition-all shadow-inner">
        <font-awesome-icon icon="magnifying-glass" class="text-primaryTeal text-base" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Type keywords (e.g. radio, fuse, breaker, CAN)..."
          @input="debouncedSearch"
          class="w-full bg-transparent border-none focus:outline-none text-sm text-textMain placeholder-gray-500 font-medium"
        >
        <button v-if="searchQuery" @click="clearSearch" class="text-xs text-accentYellow hover:underline font-bold transition whitespace-nowrap">
          <font-awesome-icon icon="xmark" class="mr-1" /> Clear
        </button>
      </div>

      <!-- Advanced filters (Category, Priority, Team Number, Event Code) -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Category</label>
          <select v-model="filters.category" @change="executeSearch(1)" class="w-full px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 text-xs bg-bgCard font-semibold text-textMain">
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
          <select v-model="filters.priority" @change="executeSearch(1)" class="w-full px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 text-xs bg-bgCard font-semibold text-textMain">
            <option value="" class="bg-bgCard">All Priorities</option>
            <option value="LOW" class="bg-bgCard">Low</option>
            <option value="MEDIUM" class="bg-bgCard">Medium</option>
            <option value="HIGH" class="bg-bgCard">High</option>
            <option value="CRITICAL" class="bg-bgCard">Critical</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Event Context</label>
          <select v-model="filters.eventCode" @change="executeSearch(1)" class="w-full px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 text-xs bg-bgCard font-semibold text-textMain">
            <option value="" class="bg-bgCard">All Regionals / Events</option>
            <option v-for="ev in events" :key="ev._id" :value="ev.code" class="bg-bgCard">
              {{ ev.name }} ({{ ev.code }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Team Number</label>
          <input
            v-model.number="filters.teamNumber"
            type="number"
            placeholder="e.g. 254"
            @input="debouncedSearch"
            class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgCard focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 text-xs text-textMain placeholder-gray-500"
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
              <span v-if="incident.eventCode" class="bg-accentPurple/10 text-accentPurple px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono border border-accentPurple/20">
                <font-awesome-icon icon="trophy" class="mr-1 text-accentYellow" /> {{ incident.eventCode }}
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

      <!-- Pagination Controls (FEAT-016) -->
      <div v-if="totalPages > 1" class="flex justify-between items-center bg-bgCard p-4 rounded-xl border border-gray-800 text-xs text-gray-400">
        <span>Page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} Total Resolved Tickets)</span>
        <div class="flex space-x-2">
          <button 
            :disabled="currentPage === 1" 
            @click="executeSearch(currentPage - 1)"
            class="w-8 h-8 rounded-lg bg-bgMain border border-gray-700 disabled:opacity-40 font-bold hover:bg-gray-800 transition flex items-center justify-center text-textMain cursor-pointer"
            title="Previous Page"
          >
            <font-awesome-icon icon="chevron-left" class="text-xs" />
          </button>
          <button 
            :disabled="currentPage === totalPages" 
            @click="executeSearch(currentPage + 1)"
            class="w-8 h-8 rounded-lg bg-bgMain border border-gray-700 disabled:opacity-40 font-bold hover:bg-gray-800 transition flex items-center justify-center text-textMain cursor-pointer"
            title="Next Page"
          >
            <font-awesome-icon icon="chevron-right" class="text-xs" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();

const searchQuery = ref('');
const filters = ref({ category: '', priority: '', teamNumber: null, eventCode: '' });
const events = ref([]);

const results = ref([]);
const searching = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
let debounceTimeout = null;

const loadEvents = async () => {
  try {
    const res = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      events.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load events:', err);
  }
};

const executeSearch = async (page = 1) => {
  searching.value = true;
  currentPage.value = page;
  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', '10');
    if (searchQuery.value.trim()) params.append('q', searchQuery.value.trim());
    if (filters.value.category) params.append('category', filters.value.category);
    if (filters.value.priority) params.append('priority', filters.value.priority);
    if (filters.value.teamNumber) params.append('teamNumber', String(filters.value.teamNumber));
    if (filters.value.eventCode) params.append('eventCode', filters.value.eventCode);
    
    const response = await fetch(getApiUrl(`/incidents/search?${params.toString()}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to query knowledge base');
    const data = await response.json();
    
    if (data.incidents) {
      results.value = data.incidents;
      totalPages.value = data.totalPages;
      totalCount.value = data.total;
    } else {
      results.value = data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    searching.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    executeSearch(1);
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  executeSearch(1);
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
  loadEvents();
  executeSearch(1);
});
</script>
