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
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
          <CustomSelect
            v-model="filters.category"
            :options="categoryOptions"
            @change="executeSearch(1)"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
          <CustomSelect
            v-model="filters.priority"
            :options="priorityOptions"
            @change="executeSearch(1)"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Event Context</label>
          <CustomSelect
            v-model="filters.eventCode"
            :options="eventOptions"
            @change="executeSearch(1)"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Team Number</label>
          <input
            v-model.number="filters.teamNumber"
            type="number"
            placeholder="e.g. 254"
            @input="debouncedSearch"
            class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgCard focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 text-xs text-textMain placeholder-gray-500 font-medium"
          >
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="searching" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primaryTeal border-t-transparent"></div>
      <p class="text-sm text-gray-400 mt-2">Searching knowledge base...</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="(incident, index) in results" 
        :key="incident._id" 
        class="p-6 rounded-2xl border border-gray-700/60 space-y-4"
        :class="index % 2 === 0 ? 'bg-bgCard' : 'bg-[#243344]'"
      >
        <!-- Header Row -->
        <div class="flex flex-row items-start justify-between gap-3">
          <div class="space-y-1.5 flex-1 min-w-0">
            <h3 class="font-extrabold text-white text-xl tracking-tight">Team {{ incident.teamNumber }}</h3>

            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <!-- Category Badge -->
              <span class="inline-flex items-center justify-center text-center px-2.5 py-1 rounded text-xs font-bold text-primaryTeal/85 bg-primaryTeal/5 border border-primaryTeal/10 font-mono uppercase tracking-wider">
                {{ formatCategory(incident.category) }}
              </span>

              <!-- Priority Badge -->
              <span 
                v-if="incident.priority"
                class="inline-flex items-center justify-center text-center min-w-[85px] px-2.5 py-1 rounded text-xs font-bold tracking-wider font-mono uppercase"
                :class="priorityBadgeClass(incident.priority)"
              >
                {{ incident.priority }}
              </span>

              <!-- Event Code Badge -->
              <span v-if="incident.eventCode" class="inline-flex items-center justify-center text-center px-2.5 py-1 rounded text-xs font-bold text-accentYellow/90 bg-accentYellow/10 border border-accentYellow/20 font-mono uppercase tracking-wider flex-shrink-0">
                <font-awesome-icon icon="trophy" class="mr-1 text-[10px]" /> {{ incident.eventCode }}
              </span>
            </div>
            
            <p class="text-xs text-gray-400 font-medium flex items-center space-x-2">
              <span>Match: <strong class="text-gray-200">{{ incident.matchNumber || 'N/A' }}</strong></span>
              <span>•</span>
              <span>Resolved: <strong class="text-gray-200">{{ formatDate(incident.resolvedAt) }}</strong></span>
            </p>
          </div>

          <!-- Actions (Top Right) -->
          <div class="flex items-center space-x-2 flex-shrink-0">
            <button
              v-if="authStore.user"
              @click.stop="rollbackIncidentStatus(incident)"
              :disabled="rollingBackId === incident._id"
              class="h-8 w-8 flex items-center justify-center bg-accentYellow/15 hover:bg-accentYellow/25 text-accentYellow border border-accentYellow/30 rounded-lg transition cursor-pointer disabled:opacity-50"
              title="Re-open ticket and return to Dashboard"
            >
              <font-awesome-icon :icon="rollingBackId === incident._id ? 'spinner' : 'rotate-left'" :class="{ 'animate-spin': rollingBackId === incident._id }" class="text-xs" />
            </button>
          </div>
        </div>

        <!-- 3 Distinct Content Blocks -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <!-- Issue Description Block -->
          <div class="p-3.5 bg-bgMain rounded-xl border border-gray-800/80 space-y-1.5">
            <div class="flex items-center space-x-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <font-awesome-icon icon="circle-info" class="text-gray-400 text-xs" />
              <span>Issue Description</span>
            </div>
            <p class="text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{{ incident.description }}</p>
          </div>

          <!-- Root Cause Block -->
          <div class="p-3.5 bg-primaryTeal/10 rounded-xl border border-primaryTeal/25 space-y-1.5">
            <div class="flex items-center space-x-1.5 text-primaryTeal font-bold uppercase tracking-wider text-[10px]">
              <font-awesome-icon icon="lightbulb" class="text-primaryTeal text-xs" />
              <span>Root Cause</span>
            </div>
            <p class="text-teal-100 leading-relaxed font-medium">{{ incident.rootCause }}</p>
          </div>

          <!-- Applied Fix Block -->
          <div class="p-3.5 bg-accentGreen/10 rounded-xl border border-accentGreen/30 space-y-1.5">
            <div class="flex items-center space-x-1.5 text-accentGreen font-bold uppercase tracking-wider text-[10px]">
              <font-awesome-icon icon="circle-check" class="text-accentGreen text-xs" />
              <span>Applied Fix</span>
            </div>
            <p class="text-emerald-200 leading-relaxed font-semibold">{{ incident.appliedSolution }}</p>
          </div>
        </div>
      </div>

      <div v-if="results.length === 0" class="text-center py-12 bg-bgCard rounded-2xl border border-dashed border-gray-800">
        <p class="text-gray-400 text-sm font-medium">No matching resolved incident records found.</p>
      </div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { CustomSelect } from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();

const searchQuery = ref('');
const filters = ref({ category: '', priority: '', teamNumber: null, eventCode: '' });
const events = ref([]);

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'RADIO_COMMS', label: 'Radio & Comms' },
  { value: 'ROBOTIC_POWER', label: 'Robot Power Path' },
  { value: 'CAN_BUS', label: 'CAN Bus Connection' },
  { value: 'MECHANICAL', label: 'Mechanical Issue' },
  { value: 'CODE_EXCEPTION', label: 'Robot User Code' },
  { value: 'OTHER', label: 'Other Issues' }
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical', class: 'text-accentCoral font-bold' }
];

const eventOptions = computed(() => [
  { value: '', label: 'All Events' },
  ...events.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
]);

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

const rollingBackId = ref(null);

const rollbackIncidentStatus = async (incident) => {
  try {
    rollingBackId.value = incident._id;
    const response = await fetch(getApiUrl(`/incidents/${incident._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to re-open ticket status');
    results.value = results.value.filter(i => i._id !== incident._id);
    totalCount.value = Math.max(0, totalCount.value - 1);
  } catch (err) {
    console.error('Failed to re-open ticket:', err);
    alert(err.message);
  } finally {
    rollingBackId.value = null;
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

const priorityBadgeClass = (priority) => {
  switch (priority) {
    case 'LOW': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'MEDIUM': return 'bg-blue-950/40 text-blue-400 border border-blue-900/30';
    case 'HIGH': return 'bg-accentCoral/10 text-accentCoral border border-accentCoral/20';
    case 'CRITICAL': return 'bg-red-950/40 text-red-400 border border-red-900/30';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
};

onMounted(() => {
  loadEvents();
  executeSearch(1);
});
</script>
