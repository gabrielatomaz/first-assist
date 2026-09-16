<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">Technical Incidents</h2>
        <p class="text-sm text-gray-400 mt-1">Real-time status tracking and CSA assignments for FRC teams</p>
      </div>

      <!-- Filters (Status & Event) -->
      <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
        <!-- Event Code Filter (Visible ONLY for Admin and FTA) -->
        <CustomSelect
          v-if="authStore.isAdmin || authStore.isFTA"
          v-model="eventFilter"
          :options="eventOptions"
          @change="fetchIncidents"
          class="w-full sm:w-64"
        />

        <!-- CSA Active Event Context Badge (CSAs have 1 event, no dropdown) -->
        <div v-else-if="authStore.user?.assignedEventCode" class="px-3.5 py-2 rounded-lg border border-primaryTeal/40 bg-primaryTeal/10 text-primaryTeal text-xs font-bold font-mono">
          <font-awesome-icon icon="trophy" class="mr-1 text-accentYellow" /> Active Event: {{ authStore.user.assignedEventCode }}
        </div>

        <!-- Status Filter -->
        <CustomSelect
          v-model="statusFilter"
          :options="statusOptions"
          @change="fetchIncidents"
          class="w-full sm:w-36"
        />

        <!-- Unified Refresh & Auto-Sync Control -->
        <div class="relative flex items-stretch w-full sm:w-auto rounded-lg border border-gray-700 bg-bgCard hover:border-gray-600 shadow-sm">
          <button
            @click="fetchIncidents"
            title="Refresh Incident Board Now"
            class="px-3.5 py-2 text-textMain hover:bg-white/10 text-xs font-semibold transition flex items-center justify-center cursor-pointer border-r border-gray-700 rounded-l-lg flex-shrink-0"
          >
            <font-awesome-icon icon="arrows-rotate" :spin="loading && !firstLoad" class="text-xs text-gray-400" />
          </button>
          <CustomSelect
            v-model="refreshInterval"
            :options="refreshOptions"
            @change="updateRefreshInterval"
            button-class="!border-0 !bg-transparent rounded-r-lg rounded-l-none px-3 py-2 text-xs font-semibold !shadow-none"
            class="w-full sm:w-32 flex-1"
          />
        </div>
      </div>
    </div>

    <!-- Main View Tabs: Active Board vs In Triage -->
    <div class="flex items-center space-x-2 border-b border-gray-800 pb-3">
      <button
        type="button"
        @click="statusFilter = 'ALL'; fetchIncidents();"
        :class="statusFilter !== 'PENDING_SCREENING' ? 'bg-primaryTeal/20 text-primaryTeal border-primaryTeal/40 shadow-sm' : 'bg-bgCard text-gray-400 border-gray-800 hover:text-white'"
        class="px-4 py-2 rounded-lg text-xs font-bold border transition flex items-center space-x-2 cursor-pointer"
      >
        <font-awesome-icon icon="list-check" class="text-xs" />
        <span>Active Board</span>
      </button>

      <button
        type="button"
        @click="statusFilter = 'PENDING_SCREENING'; fetchIncidents();"
        :class="statusFilter === 'PENDING_SCREENING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm' : 'bg-bgCard text-gray-400 border-gray-800 hover:text-white'"
        class="px-4 py-2 rounded-lg text-xs font-bold border transition flex items-center space-x-2 cursor-pointer relative"
      >
        <font-awesome-icon icon="shield-halved" class="text-xs" />
        <span>In Triage</span>
        <span 
          v-if="pendingScreeningCount > 0" 
          class="bg-amber-400 text-gray-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full ml-1"
        >
          {{ pendingScreeningCount }}
        </span>
      </button>
    </div>

    <!-- Main Content -->
    <div v-if="loading && firstLoad" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primaryTeal border-t-transparent"></div>
      <p class="text-gray-500 mt-3 text-sm">Loading incident board...</p>
    </div>

    <div v-else-if="error" class="bg-red-950/40 text-accentCoral p-4 rounded-xl border border-red-900/30 text-xs text-center font-medium">
      {{ error }}
    </div>

    <div v-else-if="incidents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      <router-link
        v-for="incident in incidents"
        :key="incident._id"
        :to="`/incidents/${incident._id}`"
        class="h-full flex flex-col hover:scale-[1.01] active:scale-[0.99] transition duration-150 cursor-pointer"
      >
        <IncidentCard 
          :incident="incident" 
          @accept-triage="handleAcceptTriage"
          @reject-triage="handleRejectTriage"
          class="h-full" 
        />
      </router-link>
    </div>

    <div v-else class="text-center py-20 bg-bgCard rounded-2xl border border-gray-800 shadow">
      <div class="max-w-md mx-auto space-y-3">
        <font-awesome-icon icon="check-circle" class="text-4xl text-primaryTeal/40" />
        <h3 class="text-base font-extrabold text-white">No Technical Incidents Reported</h3>
        <p class="text-xs text-gray-400 font-medium max-w-md mx-auto">
          There are currently no active or reported technical incidents matching this event context. The competition field is clear!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { IncidentCard, CustomSelect } from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();
const incidents = ref([]);
const events = ref([]);
const loading = ref(true);
const firstLoad = ref(true);
const error = ref(null);

const statusFilter = ref('ALL');
const eventFilter = ref('ALL');
const refreshInterval = ref(parseInt(localStorage.getItem('first_assist_refresh_rate')) || 15000);
const pendingScreeningCount = ref(0);

const statusOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' }
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

const fetchPendingCount = async () => {
  try {
    let params = ['status=PENDING_SCREENING'];
    if (eventFilter.value !== 'ALL') {
      params.push(`eventCode=${eventFilter.value}`);
    }
    const response = await fetch(getApiUrl(`/incidents?${params.join('&')}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      const data = await response.json();
      const list = data.incidents || data || [];
      pendingScreeningCount.value = list.length;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchIncidents = async () => {
  error.value = null;
  fetchPendingCount();
  try {
    let params = [];
    if (statusFilter.value !== 'ALL') {
      params.push(`status=${statusFilter.value}`);
    }
    if (eventFilter.value !== 'ALL') {
      params.push(`eventCode=${eventFilter.value}`);
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

const handleAcceptTriage = async (incidentId) => {
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
  }
};

const handleRejectTriage = async (incidentId) => {
  if (!confirm('Are you sure you want to reject this incident ticket?')) return;
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
    await fetchIncidents();
  } catch (err) {
    alert(err.message);
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
