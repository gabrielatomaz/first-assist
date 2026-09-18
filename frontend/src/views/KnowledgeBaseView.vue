<template>
  <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto text-textMain">
    <PageHeader
      title="Knowledge Base"
      subtitle="Search through resolved tickets to find proven root causes and applied fixes."
    />

    <!-- Search & Filters Container -->
    <BaseCard class="space-y-4">
      <SearchBar
        v-model="searchQuery"
        placeholder="Type keywords (e.g. radio, fuse, breaker, CAN)..."
        :debounce-ms="300"
        @search="debouncedSearch"
        @clear="clearSearch"
      />

      <!-- Advanced filters (Category, Priority, Team Number, Event Code) -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</label>
          <CustomSelect
            v-model="filters.category"
            :options="categoryOptions"
            @change="executeSearch(1)"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Priority</label>
          <CustomSelect
            v-model="filters.priority"
            :options="priorityOptions"
            @change="executeSearch(1)"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Context</label>
          <CustomSelect
            v-model="filters.eventCode"
            :options="eventOptions"
            @change="executeSearch(1)"
          />
        </div>

        <div>
          <BaseInput
            v-model="filters.teamNumber"
            type="number"
            label="Team Number"
            placeholder="e.g. 254"
            @input="debouncedSearch"
            input-class="font-mono"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Results -->
    <LoadingSpinner v-if="searching" text="Searching knowledge base..." />

    <div v-else class="space-y-4">
      <router-link 
        v-for="(incident) in results" 
        :key="incident._id" 
        :to="`/incidents/${incident._id}`"
        class="block p-6 rounded-2xl bg-bgCard border border-gray-700/60 hover:border-teal-500/50 space-y-4 transition-all duration-150 cursor-pointer hover:shadow-xl hover:scale-[1.005]"
      >
        <!-- Header Row -->
        <div class="flex flex-row items-start justify-between gap-3">
          <div class="space-y-1.5 flex-1 min-w-0">
            <h3 class="font-extrabold text-white text-xl tracking-tight group-hover:text-teal-300 transition">Team {{ incident.teamNumber }}</h3>

            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <CategoryBadge :category="incident.category" />
              <PriorityBadge v-if="incident.priority" :priority="incident.priority" />

              <!-- Event Code Badge -->
              <span v-if="incident.eventCode" class="h-6 px-2.5 rounded-md text-xs font-bold text-accentYellow/90 bg-accentYellow/10 border border-accentYellow/20 font-mono uppercase tracking-wider inline-flex items-center justify-center leading-none flex-shrink-0">
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
            <BaseButton
              v-if="authStore.user"
              @click.stop.prevent="rollbackIncidentStatus(incident)"
              :disabled="rollingBackId === incident._id"
              :loading="rollingBackId === incident._id"
              variant="secondary"
              size="icon-sm"
              icon="rotate-left"
              title="Re-open ticket and return to Dashboard"
            />
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
          <div class="p-3.5 bg-teal-500/10 rounded-xl border border-teal-500/25 space-y-1.5">
            <div class="flex items-center space-x-1.5 text-teal-300 font-bold uppercase tracking-wider text-[10px]">
              <font-awesome-icon icon="lightbulb" class="text-teal-300 text-xs" />
              <span>Root Cause</span>
            </div>
            <p class="text-teal-100 leading-relaxed font-medium">{{ incident.rootCause }}</p>
          </div>

          <!-- Applied Fix Block -->
          <div class="p-3.5 bg-accentGreen/10 rounded-xl border border-accentGreen/30 space-y-1.5">
            <div class="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
              <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
              <span>Applied Fix</span>
            </div>
            <p class="text-emerald-200 leading-relaxed font-semibold">{{ incident.appliedSolution }}</p>
          </div>
        </div>
      </router-link>

      <EmptyState
        v-if="results.length === 0"
        icon="book-open"
        title="No Matching Records"
        description="No matching resolved incident records found. Try adjusting your search keywords or filter criteria."
      />
    </div>

      <!-- Pagination Controls (FEAT-016) -->
      <div v-if="totalPages > 1" class="flex justify-between items-center bg-bgCard p-4 rounded-xl border border-gray-800 text-xs text-gray-400">
        <span>Page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} Total Resolved Tickets)</span>
        <div class="flex space-x-2">
          <BaseButton 
            :disabled="currentPage === 1" 
            @click="executeSearch(currentPage - 1)"
            variant="secondary"
            size="icon-sm"
            icon="chevron-left"
            title="Previous Page"
          />
          <BaseButton 
            :disabled="currentPage === totalPages" 
            @click="executeSearch(currentPage + 1)"
            variant="secondary"
            size="icon-sm"
            icon="chevron-right"
            title="Next Page"
          />
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  BaseButton,
  BaseCard,
  BaseInput,
  CustomSelect,
  PageHeader,
  SearchBar,
  CategoryBadge,
  PriorityBadge,
  LoadingSpinner,
  EmptyState
} from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();

const searchQuery = ref('');
const filters = ref({ category: '', priority: '', teamNumber: null, eventCode: '' });
const events = ref([]);

const categoryOptions = [
  { value: '', label: 'All' },
  { value: 'RADIO_COMMS', label: 'Radio & Wireless Comms' },
  { value: 'ROBOTIC_POWER', label: 'Robot Power Path & Battery' },
  { value: 'CAN_BUS', label: 'CAN Bus Connection' },
  { value: 'MOTOR_CONTROLLER', label: 'Motor Controllers & Sensors' },
  { value: 'PNEUMATICS', label: 'Pneumatics & Air System' },
  { value: 'VISION_COPROCESSOR', label: 'Vision & Coprocessors' },
  { value: 'DRIVER_STATION', label: 'Driver Station & Controls' },
  { value: 'CODE_EXCEPTION', label: 'Robot User Code' },
  { value: 'MECHANICAL', label: 'Mechanical & Hardware' },
  { value: 'FIELD_NETWORK', label: 'Field & FMS Network' },
  { value: 'OTHER', label: 'Other Issues' }
];

const priorityOptions = [
  { value: '', label: 'All' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical', class: 'text-accentCoral font-bold' }
];

const eventOptions = computed(() => [
  { value: '', label: 'All' },
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

onMounted(() => {
  loadEvents();
  executeSearch(1);
});
</script>
