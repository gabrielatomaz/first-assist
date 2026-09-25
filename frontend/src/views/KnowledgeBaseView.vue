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
              @click.stop.prevent="reopenTarget = incident; showReopenModal = true"
              :disabled="rollingBackId === incident._id || showReopenModal"
              :loading="rollingBackId === incident._id"
              variant="secondary"
              size="icon-sm"
              icon="rotate-left"
              title="Re-open ticket and return to Dashboard"
            />
          </div>
        </div>

        <!-- 3 Distinct Content Blocks with Fixed Equal Heights & Read More Modal -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <!-- Issue Description Block -->
          <div class="p-3.5 bg-bgMain rounded-xl border border-gray-800/80 flex flex-col justify-between h-36">
            <div class="space-y-1.5 overflow-hidden">
              <div class="flex items-center space-x-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="circle-info" class="text-gray-400 text-xs" />
                <span>Issue Description</span>
              </div>
              <p class="text-gray-200 leading-relaxed font-medium line-clamp-3 text-xs">{{ incident.description }}</p>
            </div>
            <div v-if="incident.description && incident.description.length > 140" class="pt-1">
              <button 
                @click.stop.prevent="openTextModal(`Team ${incident.teamNumber} — Issue Description`, incident.description)"
                class="text-xs sm:text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 sm:p-0 bg-teal-500/15 sm:bg-transparent border border-teal-500/30 sm:border-0 rounded-lg sm:rounded-none cursor-pointer flex-shrink-0 transition shadow-sm sm:shadow-none"
              >
                Read more <font-awesome-icon icon="arrow-right" class="text-[10px] sm:text-[9px]" />
              </button>
            </div>
          </div>

          <!-- Root Cause Block -->
          <div class="p-3.5 bg-teal-500/10 rounded-xl border border-teal-500/25 flex flex-col justify-between h-36">
            <div class="space-y-1.5 overflow-hidden">
              <div class="flex items-center space-x-1.5 text-teal-300 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="lightbulb" class="text-teal-300 text-xs" />
                <span>Root Cause</span>
              </div>
              <p class="text-teal-100 leading-relaxed font-medium line-clamp-3 text-xs">{{ incident.rootCause || 'N/A' }}</p>
            </div>
            <div v-if="incident.rootCause && incident.rootCause.length > 140" class="pt-1">
              <button 
                @click.stop.prevent="openTextModal(`Team ${incident.teamNumber} — Root Cause`, incident.rootCause)"
                class="text-xs sm:text-[11px] font-bold text-teal-300 hover:text-teal-200 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 sm:p-0 bg-teal-500/20 sm:bg-transparent border border-teal-500/40 sm:border-0 rounded-lg sm:rounded-none cursor-pointer flex-shrink-0 transition shadow-sm sm:shadow-none"
              >
                Read more <font-awesome-icon icon="arrow-right" class="text-[10px] sm:text-[9px]" />
              </button>
            </div>
          </div>

          <!-- Applied Fix Block -->
          <div class="p-3.5 bg-accentGreen/10 rounded-xl border border-accentGreen/30 flex flex-col justify-between h-36">
            <div class="space-y-1.5 overflow-hidden">
              <div class="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
                <span>Applied Fix</span>
              </div>
              <p class="text-emerald-200 leading-relaxed font-semibold line-clamp-3 text-xs">{{ incident.appliedSolution || 'N/A' }}</p>
            </div>
            <div v-if="incident.appliedSolution && incident.appliedSolution.length > 140" class="pt-1">
              <button 
                @click.stop.prevent="openTextModal(`Team ${incident.teamNumber} — Applied Fix`, incident.appliedSolution)"
                class="text-xs sm:text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 sm:p-0 bg-emerald-500/20 sm:bg-transparent border border-emerald-500/40 sm:border-0 rounded-lg sm:rounded-none cursor-pointer flex-shrink-0 transition shadow-sm sm:shadow-none"
              >
                Read more <font-awesome-icon icon="arrow-right" class="text-[10px] sm:text-[9px]" />
              </button>
            </div>
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

      <!-- Sentinel for Infinite Scroll (FEAT-029) -->
      <div ref="sentinelRef" class="py-8 text-center flex justify-center items-center overflow-hidden">
        <LoadingSpinner v-if="loadingMore" text="Loading more knowledge base records..." />
        <div 
          v-else-if="!hasMorePages && results.length > 0" 
          class="flex flex-col items-center gap-2 origin-bottom transition-all duration-300"
          :class="isEndStretching ? 'animate-stretch py-3' : 'animate-fadeIn'"
        >
          <!-- Elastic Rubberband Pulled Bar -->
          <div 
            class="rounded-full bg-teal-400/80 shadow-lg shadow-teal-500/40 transition-all duration-500"
            :class="isEndStretching ? 'w-24 h-2.5 animate-pulse' : 'w-10 h-1 opacity-40'"
          ></div>

          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgCard border border-gray-800 shadow-sm text-xs font-mono font-bold text-gray-300 hover:border-gray-700 transition">
            <font-awesome-icon icon="circle-check" class="text-teal-400 text-xs" />
            <span>All {{ totalCount }} resolved tickets loaded</span>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      v-model="showReopenModal"
      title="Re-open Incident?"
      message="This will change the incident status back to In Progress and return it to the active dashboard."
      icon="rotate-left"
      variant="warning"
      confirm-text="Re-open"
      confirm-icon="rotate-left"
      :loading="rollingBackId !== null"
      loading-text="Re-opening..."
      @confirm="rollbackIncidentStatus"
      @cancel="showReopenModal = false; reopenTarget = null"
    />
    <!-- KB Text Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="showTextModal" 
        class="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn overflow-y-auto"
        @click.self="showTextModal = false"
      >
        <div class="bg-bgCard border border-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn my-auto max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-extrabold text-white tracking-tight">{{ textModalTitle }}</h4>
            <BaseButton variant="ghost" size="icon-xs" icon="xmark" @click="showTextModal = false" />
          </div>
          <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">{{ textModalContent }}</p>
        </div>
      </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  BaseButton,
  BaseCard,
  BaseInput,
  ConfirmationModal,
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
const loadingMore = ref(false);
const hasMorePages = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const sentinelRef = ref(null);
let observer = null;
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

const executeSearch = async (page = 1, isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    searching.value = true;
    currentPage.value = 1;
    results.value = [];
  }

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
    
    const newIncidents = data.incidents || (Array.isArray(data) ? data : []);
    totalPages.value = data.totalPages || 1;
    totalCount.value = data.total || newIncidents.length;

    if (isLoadMore) {
      const existingIds = new Set(results.value.map(i => i._id));
      const filtered = newIncidents.filter(i => !existingIds.has(i._id));
      results.value.push(...filtered);
    } else {
      results.value = newIncidents;
    }
    
    currentPage.value = page;
    hasMorePages.value = page < totalPages.value;
  } catch (err) {
    console.error(err);
  } finally {
    searching.value = false;
    loadingMore.value = false;
  }
};

const isEndStretching = ref(false);

const triggerEndStretch = () => {
  if (isEndStretching.value) return;
  isEndStretching.value = true;
  setTimeout(() => {
    isEndStretching.value = false;
  }, 750);
};

const loadMoreKB = () => {
  if (searching.value || loadingMore.value || !hasMorePages.value) return;
  executeSearch(currentPage.value + 1, true);
};

const setupObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (sentinelRef.value && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (hasMorePages.value && !searching.value && !loadingMore.value) {
          loadMoreKB();
        } else if (!hasMorePages.value && results.value.length > 0) {
          triggerEndStretch();
        }
      }
    }, { rootMargin: '200px' });

    observer.observe(sentinelRef.value);
  }
};

const rollingBackId = ref(null);
const showReopenModal = ref(false);
const reopenTarget = ref(null);

const showTextModal = ref(false);
const textModalTitle = ref('');
const textModalContent = ref('');

const openTextModal = (title, content) => {
  textModalTitle.value = title;
  textModalContent.value = content;
  showTextModal.value = true;
};

const rollbackIncidentStatus = async () => {
  if (!reopenTarget.value) return;
  const incident = reopenTarget.value;
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
    showReopenModal.value = false;
    reopenTarget.value = null;
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
  watch(sentinelRef, (el) => {
    if (el) setupObserver();
  }, { immediate: true });
});
</script>
