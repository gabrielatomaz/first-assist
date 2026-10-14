<template>
  <div class="space-y-6 relative">
    <!-- Styled Confirm Reject Triage Modal -->
    <ConfirmationModal
      :model-value="!!incidentToReject"
      @update:model-value="(val) => { if (!val) incidentToReject = null; }"
      title="Reject Technical Incident?"
      message="Are you sure you want to reject this incident ticket? It will be marked as rejected and removed from the active triage queue."
      icon="triangle-exclamation"
      variant="danger"
      confirm-text="Yes, Reject"
      confirm-icon="xmark"
      cancel-text="Cancel"
      :loading="!!triageLoadingMap[incidentToReject]"
      loading-text="Rejecting..."
      @confirm="executeRejectTriage"
      @cancel="incidentToReject = null"
    />

    <PageHeader
      title="Active Incident Queue"
      subtitle="Real-time FRC field issues and technical support requests"
    >
      <template #actions>
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto md:max-w-full md:flex-nowrap md:overflow-x-auto py-0.5">
          <!-- Event Code Filter (Visible ONLY for Admin and FTA) -->
          <CustomSelect
            v-if="authStore.isAdmin || authStore.isFTA"
            v-model="eventFilter"
            :options="eventOptions"
            @change="fetchIncidents"
            class="w-full md:w-56 lg:w-64 md:flex-shrink-0"
          />

          <!-- CSA Active Event Context Badge (CSAs have 1 event, no dropdown) -->
          <div v-else-if="authStore.user?.assignedEventCode" class="h-10 sm:h-9 px-3 flex items-center justify-center md:justify-start rounded-xl border border-primaryTeal/40 bg-primaryTeal/10 text-teal-400 text-xs font-bold font-mono w-full md:w-auto md:flex-shrink-0 whitespace-nowrap">
            <font-awesome-icon icon="trophy" class="mr-2 text-accentYellow" /> Active Event: {{ authStore.user.assignedEventCode }}
          </div>

          <!-- Team Filter (Teams with Open Incidents) -->
          <CustomSelect
            v-model="teamFilter"
            :options="teamOptions"
            @change="fetchIncidents"
            class="w-full md:w-52 lg:w-60 md:flex-shrink-0"
          />

          <!-- Status Filter -->
          <CustomSelect
            v-model="statusFilter"
            :options="statusOptions"
            @change="fetchIncidents"
            class="w-full md:w-32 lg:w-36 md:flex-shrink-0"
          />

          <!-- Priority Filter -->
          <CustomSelect
            v-model="priorityFilter"
            :options="priorityOptions"
            @change="fetchIncidents"
            class="w-full md:w-32 lg:w-36 md:flex-shrink-0"
          />

          <!-- Unified Refresh & Auto-Sync Control -->
          <div class="relative flex items-center h-9 rounded-xl border border-gray-800 bg-bgCard hover:border-gray-700 shadow-sm w-full md:w-auto md:flex-shrink-0">
            <button
              type="button"
              @click="handleManualRefresh"
              :disabled="isRefreshing"
              title="Refresh Incident Board Now"
              class="h-9 px-2.5 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition flex items-center justify-center cursor-pointer border-r border-gray-800 rounded-l-xl flex-shrink-0 active:scale-95 disabled:opacity-50"
            >
              <font-awesome-icon icon="arrows-rotate" :spin="isRefreshing" class="text-xs transition-colors" :class="isRefreshing ? 'text-teal-400' : 'text-gray-400'" />
            </button>
            <CustomSelect
              v-model="refreshInterval"
              :options="refreshOptions"
              @change="updateRefreshInterval"
              button-class="!h-9 !py-0 !border-0 !bg-transparent rounded-r-xl rounded-l-none !px-2.5 !shadow-none text-xs"
              class="w-full md:w-28 flex-1 md:flex-none"
            />
          </div>
        </div>
      </template>
    </PageHeader>

    <!-- Main View Tabs: Active Board vs In Triage -->
    <BaseTabs v-model="activeBoardTab" :tabs="dashboardTabs" />

    <!-- Main Content -->
    <LoadingSpinner v-if="loading && firstLoad" text="Loading incident board..." />

    <AlertBanner v-else-if="error" type="error" :message="error" />

    <div v-else-if="incidents.length > 0" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <router-link
          v-for="incident in incidents"
          :key="incident._id"
          :to="`/incidents/${incident._id}`"
          class="h-full flex flex-col hover:scale-[1.01] active:scale-[0.99] transition duration-150 cursor-pointer"
        >
          <IncidentCard 
            :incident="incident" 
            :triage-loading-action="triageLoadingMap[incident._id]"
            @accept-triage="handleAcceptTriage"
            @reject-triage="handleRejectTriage"
            class="h-full" 
          />
        </router-link>
      </div>

      <!-- Sentinel for Infinite Scroll (FEAT-029) -->
      <div ref="sentinelRef" class="py-8 text-center flex justify-center items-center overflow-hidden">
        <LoadingSpinner v-if="loadingMore" text="Loading more incidents..." />
        <div 
          v-else-if="!hasMorePages && incidents.length > 0" 
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
            <span>All incidents loaded</span>
          </div>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="circle-check"
      title="No Technical Incidents Reported"
      description="There are currently no active or reported technical incidents matching this event context. The competition field is clear!"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  IncidentCard,
  CustomSelect,
  ConfirmationModal,
  PageHeader,
  LoadingSpinner,
  AlertBanner,
  EmptyState,
  BaseTabs
} from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();
const incidents = ref([]);
const events = ref([]);
const loading = ref(true);
const firstLoad = ref(true);
const error = ref(null);

const searchQuery = ref('');
const statusFilter = ref('ALL');
const priorityFilter = ref('ALL');
const eventFilter = ref('ALL');
const teamFilter = ref('ALL');
const allTeamsMap = ref(new Map());
const activeTeamsList = ref([]);
const refreshInterval = ref(parseInt(localStorage.getItem('first_assist_refresh_rate')) || 15000);
const pendingScreeningCount = ref(0);
const activeBoardCount = ref(0);

const currentPage = ref(1);
const totalPages = ref(1);
const loadingMore = ref(false);
const hasMorePages = ref(true);
const sentinelRef = ref(null);
let observer = null;

const dashboardTabs = computed(() => [
  { 
    id: 'ALL', 
    label: 'Active Incidents', 
    icon: 'list-check',
    count: activeBoardCount.value,
    activeClass: 'bg-primaryTeal/20 text-teal-300 border-primaryTeal/50 shadow-sm',
    activeCountClass: 'bg-teal-400/20 text-teal-300 font-bold',
    inactiveCountClass: 'bg-gray-700/60 text-gray-300 font-bold'
  },
  {
    id: 'PENDING_SCREENING',
    label: 'In Triage',
    icon: 'shield-halved',
    count: pendingScreeningCount.value,
    activeClass: 'bg-yellow-400/20 text-yellow-300 border-yellow-200/70 shadow-sm',
    activeCountClass: 'bg-yellow-400/20 text-yellow-300 font-bold',
    inactiveCountClass: 'bg-gray-700/60 text-gray-300 font-bold'
  }
]);

const activeBoardTab = computed({
  get: () => (statusFilter.value === 'PENDING_SCREENING' ? 'PENDING_SCREENING' : 'ALL'),
  set: (val) => {
    statusFilter.value = val;
    fetchIncidents();
  }
});

const statusOptions = computed(() => [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_SCREENING', label: 'In Triage' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' }
]);

const priorityOptions = computed(() => [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' }
]);

const teamOptions = computed(() => {
  const options = [{ value: 'ALL', label: 'All Teams' }];
  activeTeamsList.value.forEach(num => {
    const name = allTeamsMap.value.get(num);
    const label = name ? `Team ${num} - ${name}` : `Team ${num}`;
    options.push({
      value: String(num),
      label,
      teamNumber: num,
      teamName: name || ''
    });
  });
  return options;
});

const toggleAwaitingTriage = () => {
  if (statusFilter.value === 'PENDING_SCREENING') {
    statusFilter.value = 'ALL';
  } else {
    statusFilter.value = 'PENDING_SCREENING';
  }
  fetchIncidents();
};

const refreshOptions = [
  { value: 0, label: 'Manual Sync' },
  { value: 5000, label: 'Every 5s' },
  { value: 15000, label: 'Every 15s' },
  { value: 30000, label: 'Every 30s' },
  { value: 60000, label: 'Every 1 min' },
  { value: 300000, label: 'Every 5 min' },
  { value: 900000, label: 'Every 15 min' }
];

const availableEvents = computed(() => {
  if (authStore.isAdmin) return events.value;
  if (authStore.isFTA) {
    const assigned = authStore.user?.assignedEventCodes || [];
    if (assigned.length > 0) {
      return events.value.filter(e => assigned.includes(e.code));
    }
  }
  return events.value;
});

const eventOptions = computed(() => [
  { value: 'ALL', label: 'All Events' },
  ...availableEvents.value.map(e => ({ value: e.code, label: `${e.name} (${e.code})` }))
]);

let pollInterval = null;

const startPollTimer = () => {
  if (pollInterval) clearInterval(pollInterval);
  if (refreshInterval.value > 0) {
    pollInterval = setInterval(() => {
      fetchIncidents();
    }, refreshInterval.value);
  }
};

const isRefreshing = ref(false);

const handleManualRefresh = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await fetchIncidents();
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 450);
  }
};

const updateRefreshInterval = () => {
  localStorage.setItem('first_assist_refresh_rate', String(refreshInterval.value));
  startPollTimer();
};

const fetchEvents = async () => {
  try {
    const response = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      events.value = await response.json();
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchTeams = async () => {
  try {
    const res = await fetch(getApiUrl('/teams'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const list = await res.json();
      const map = new Map();
      list.forEach(t => map.set(t.number, t.name));
      allTeamsMap.value = map;
    }
  } catch (err) {
    console.error('Failed to load teams dictionary:', err);
  }
};

const fetchCounts = async () => {
  try {
    let eventParam = eventFilter.value !== 'ALL' ? `eventCode=${eventFilter.value}` : 'eventCode=ALL';
    const [resPending, resActive] = await Promise.all([
      fetch(getApiUrl(`/incidents?status=PENDING_SCREENING&limit=1000&${eventParam}`), {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch(getApiUrl(`/incidents?status=ALL&limit=1000&${eventParam}`), {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
    ]);

    if (resPending.ok) {
      const dataPending = await resPending.json();
      pendingScreeningCount.value = typeof dataPending.total === 'number' 
        ? dataPending.total 
        : (Array.isArray(dataPending) ? dataPending.length : (dataPending.incidents || []).length);
    }
    if (resActive.ok) {
      const dataActive = await resActive.json();
      activeBoardCount.value = typeof dataActive.total === 'number' 
        ? dataActive.total 
        : (Array.isArray(dataActive) ? dataActive.length : (dataActive.incidents || []).length);
      const listActive = dataActive.incidents || (Array.isArray(dataActive) ? dataActive : []);
      const teamsWithOpenIncs = Array.from(new Set(listActive.map(i => i.teamNumber).filter(Boolean)));
      activeTeamsList.value = teamsWithOpenIncs.sort((a, b) => a - b);
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchIncidents = async (isLoadMore = false) => {
  error.value = null;
  if (!isLoadMore) {
    currentPage.value = 1;
    hasMorePages.value = true;
    loading.value = true;
    await fetchCounts();
  } else {
    loadingMore.value = true;
  }

  try {
    let params = [
      `page=${currentPage.value}`,
      `limit=9`
    ];
    if (statusFilter.value !== 'ALL') {
      params.push(`status=${statusFilter.value}`);
    }
    if (priorityFilter.value !== 'ALL') {
      params.push(`priority=${priorityFilter.value}`);
    }
    if (eventFilter.value !== 'ALL') {
      params.push(`eventCode=${eventFilter.value}`);
    } else {
      params.push('eventCode=ALL');
    }
    if (teamFilter.value !== 'ALL') {
      params.push(`teamNumber=${teamFilter.value}`);
    }
    if (searchQuery.value.trim()) {
      params.push(`q=${encodeURIComponent(searchQuery.value.trim())}`);
    }
    
    const query = `?${params.join('&')}`;
    const response = await fetch(getApiUrl(`/incidents${query}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to sync incidents log from API');
    const data = await response.json();

    const newItems = data.incidents || (Array.isArray(data) ? data : []);
    totalPages.value = data.totalPages || 1;

    if (typeof data.total === 'number') {
      if (statusFilter.value === 'ALL') {
        activeBoardCount.value = data.total;
      } else if (statusFilter.value === 'PENDING_SCREENING') {
        pendingScreeningCount.value = data.total;
      }
    }

    if (isLoadMore) {
      const existingIds = new Set(incidents.value.map(i => i._id));
      const filteredNew = newItems.filter(i => !existingIds.has(i._id));
      incidents.value = [...incidents.value, ...filteredNew];
    } else {
      incidents.value = newItems;
    }

    hasMorePages.value = currentPage.value < totalPages.value;
  } catch (err) {
    error.value = err.message || 'Failed to sync with API. Verify server connection.';
  } finally {
    loading.value = false;
    loadingMore.value = false;
    firstLoad.value = false;
  }
};

const loadMoreIncidents = () => {
  if (loading.value || loadingMore.value || !hasMorePages.value) return;
  currentPage.value++;
  fetchIncidents(true);
};

watch([statusFilter, priorityFilter, eventFilter, teamFilter], () => {
  fetchIncidents();
});

const triageLoadingMap = ref({});
const incidentToReject = ref(null);

const handleAcceptTriage = async (incidentId) => {
  triageLoadingMap.value[incidentId] = 'accept';
  try {
    const res = await fetch(getApiUrl(`/incidents/${incidentId}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: 'OPEN' })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to accept ticket into Open queue');
    }
    await fetchIncidents();
  } catch (err) {
    alert(err.message);
  } finally {
    delete triageLoadingMap.value[incidentId];
  }
};

const handleRejectTriage = (incidentId) => {
  incidentToReject.value = incidentId;
};

const executeRejectTriage = async () => {
  if (!incidentToReject.value) return;
  const incidentId = incidentToReject.value;
  triageLoadingMap.value[incidentId] = 'reject';
  try {
    const res = await fetch(getApiUrl(`/incidents/${incidentId}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: 'REJECTED' })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to reject ticket');
    }
    incidentToReject.value = null;
    await fetchIncidents();
  } catch (err) {
    alert(err.message);
  } finally {
    delete triageLoadingMap.value[incidentId];
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

watch(sentinelRef, (el) => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (el && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (hasMorePages.value && !loading.value && !loadingMore.value) {
          loadMoreIncidents();
        } else if (!hasMorePages.value && incidents.value.length > 0) {
          triggerEndStretch();
        }
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
  }
}, { immediate: true });

onMounted(() => {
  fetchEvents();
  fetchTeams();
  if (authStore.user?.assignedEventCode) {
    eventFilter.value = authStore.user.assignedEventCode;
  } else if (authStore.user?.assignedEventCodes?.length > 0) {
    eventFilter.value = authStore.user.assignedEventCodes[0];
  }
  fetchIncidents();
  startPollTimer();
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  if (observer) observer.disconnect();
});
</script>
