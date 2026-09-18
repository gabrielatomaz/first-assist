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
      title="Technical Incidents"
      subtitle="Real-time status tracking and CSA assignments for FRC teams"
    >
      <template #actions>
        <!-- Event Code Filter (Visible ONLY for Admin and FTA) -->
        <CustomSelect
          v-if="authStore.isAdmin || authStore.isFTA"
          v-model="eventFilter"
          :options="eventOptions"
          @change="fetchIncidents"
          class="w-full sm:w-64"
        />

        <!-- CSA Active Event Context Badge (CSAs have 1 event, no dropdown) -->
        <div v-else-if="authStore.user?.assignedEventCode" class="h-11 px-4 flex items-center rounded-xl border border-primaryTeal/40 bg-primaryTeal/10 text-teal-400 text-xs font-bold font-mono">
          <font-awesome-icon icon="trophy" class="mr-2 text-accentYellow" /> Active Event: {{ authStore.user.assignedEventCode }}
        </div>

        <!-- Status Filter -->
        <CustomSelect
          v-model="statusFilter"
          :options="statusOptions"
          @change="fetchIncidents"
          class="w-full sm:w-36"
        />

        <!-- Priority Filter -->
        <CustomSelect
          v-model="priorityFilter"
          :options="priorityOptions"
          @change="fetchIncidents"
          class="w-full sm:w-36"
        />

        <!-- Unified Refresh & Auto-Sync Control -->
        <div class="relative flex items-stretch h-10 sm:h-9 w-full sm:w-auto rounded-xl border border-gray-800 bg-bgCard hover:border-gray-700 shadow-sm">
          <button
            type="button"
            @click="handleManualRefresh"
            :disabled="isRefreshing"
            title="Refresh Incident Board Now"
            class="px-3.5 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition flex items-center justify-center cursor-pointer border-r border-gray-800 rounded-l-xl flex-shrink-0 active:scale-95 disabled:opacity-50"
          >
            <font-awesome-icon icon="arrows-rotate" :spin="isRefreshing" class="text-xs transition-colors" :class="isRefreshing ? 'text-teal-400' : 'text-gray-400'" />
          </button>
          <CustomSelect
            v-model="refreshInterval"
            :options="refreshOptions"
            @change="updateRefreshInterval"
            button-class="!border-0 !bg-transparent rounded-r-xl rounded-l-none px-3 text-xs font-semibold !shadow-none"
            class="w-full sm:w-32 flex-1"
          />
        </div>
      </template>
    </PageHeader>

    <!-- Main View Tabs: Active Board vs In Triage -->
    <BaseTabs v-model="activeBoardTab" :tabs="dashboardTabs" />

    <!-- Main Content -->
    <LoadingSpinner v-if="loading && firstLoad" text="Loading incident board..." />

    <AlertBanner v-else-if="error" type="error" :message="error" />

    <div v-else-if="incidents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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

const statusFilter = ref('ALL');
const priorityFilter = ref('ALL');
const eventFilter = ref('ALL');
const refreshInterval = ref(parseInt(localStorage.getItem('first_assist_refresh_rate')) || 15000);
const pendingScreeningCount = ref(0);
const activeBoardCount = ref(0);

const dashboardTabs = computed(() => [
  { 
    id: 'ALL', 
    label: 'Active Board', 
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

const statusOptions = [
  { value: 'ALL', label: 'Active' },
  { value: 'PENDING_SCREENING', label: 'In Triage' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' }
];

const priorityOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' }
];

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
  { value: 'ALL', label: 'All' },
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

const fetchCounts = async () => {
  try {
    let eventParam = eventFilter.value !== 'ALL' ? `eventCode=${eventFilter.value}` : 'eventCode=ALL';
    const [resPending, resActive] = await Promise.all([
      fetch(getApiUrl(`/incidents?status=PENDING_SCREENING&${eventParam}`), {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch(getApiUrl(`/incidents?status=ALL&${eventParam}`), {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
    ]);

    if (resPending.ok) {
      const dataPending = await resPending.json();
      const listPending = dataPending.incidents || dataPending || [];
      pendingScreeningCount.value = listPending.length;
    }
    if (resActive.ok) {
      const dataActive = await resActive.json();
      const listActive = dataActive.incidents || dataActive || [];
      activeBoardCount.value = listActive.length;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchIncidents = async () => {
  error.value = null;
  await fetchCounts();
  try {
    let params = [];
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
    
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    const response = await fetch(getApiUrl(`/incidents${query}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to sync incidents log from API');
    const data = await response.json();

    incidents.value = data.incidents || data || [];
  } catch (err) {
    error.value = err.message || 'Failed to sync with API. Verify server connection.';
  } finally {
    loading.value = false;
    firstLoad.value = false;
  }
};

watch([statusFilter, priorityFilter, eventFilter], () => {
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

onMounted(() => {
  fetchEvents();
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
});
</script>
