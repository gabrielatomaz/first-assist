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

        <!-- Refresh Controls with CustomSelect -->
        <div class="flex items-center space-x-1 sm:w-auto">
          <button
            @click="fetchIncidents"
            title="Refresh Incident Board Now"
            class="h-9 px-2.5 bg-bgCard hover:bg-gray-800 text-primaryTeal border border-gray-700 hover:border-gray-600 rounded-lg transition text-xs font-bold shadow-sm flex items-center justify-center cursor-pointer"
          >
            <font-awesome-icon icon="arrows-rotate" :spin="loading && !firstLoad" class="text-xs" />
          </button>
          <CustomSelect
            v-model.number="refreshInterval"
            :options="refreshOptions"
            @change="updateRefreshInterval"
            class="w-36"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="loading && firstLoad" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primaryTeal border-t-transparent"></div>
      <p class="text-gray-500 mt-3 text-sm">Loading incident board...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-accentCoral p-4 rounded-xl text-center text-sm font-medium">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
        <router-link
          v-for="incident in incidents"
          :key="incident._id"
          :to="`/incidents/${incident._id}`"
          class="block hover:scale-[1.02] active:scale-[0.98] transition duration-200"
        >
          <IncidentCard :incident="incident" />
        </router-link>
        
        <div v-if="incidents.length === 0" class="col-span-full text-center py-16 px-6 bg-bgCard rounded-2xl border border-dashed border-gray-800 space-y-3">
          <div><font-awesome-icon icon="clipboard-list" class="text-4xl text-gray-500 mb-2" /></div>
          <h3 class="text-base font-extrabold text-white">No Technical Incidents Reported</h3>
          <p class="text-xs text-gray-400 font-medium max-w-md mx-auto">
            There are currently no active or reported technical incidents matching this event context. The competition field is clear!
          </p>
        </div>
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

const statusOptions = [
  { value: 'ALL', label: 'Active', class: 'text-textMain font-semibold' },
  { value: 'OPEN', label: 'Open', class: 'text-primaryTeal font-bold' },
  { value: 'ASSIGNED', label: 'Assigned', class: 'text-accentYellow font-bold' },
  { value: 'IN_PROGRESS', label: 'In Progress', class: 'text-accentPurple font-bold' },
  { value: 'WAITING', label: 'Waiting', class: 'text-gray-400 font-semibold' },
  { value: 'RESOLVED', label: 'Resolved', class: 'text-green-400 font-bold' },
  { value: 'CLOSED', label: 'Closed', class: 'text-gray-500 font-semibold' }
];

const refreshOptions = [
  { value: 0, label: 'Manual Sync' },
  { value: 5000, label: 'Every 5s', class: 'text-primaryTeal font-bold' },
  { value: 15000, label: 'Every 15s', class: 'text-primaryTeal font-bold' },
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
  { value: 'ALL', label: authStore.isAdmin ? 'All Competitions' : 'All My Regionals' },
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

const fetchIncidents = async () => {
  error.value = null;
  try {
    let params = [];
    if (statusFilter.value !== 'ALL') params.push(`status=${statusFilter.value}`);
    if (eventFilter.value !== 'ALL') params.push(`eventCode=${eventFilter.value}`);
    
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    const response = await fetch(getApiUrl(`/incidents${query}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to sync incidents log from API');
    incidents.value = await response.json();
  } catch (err) {
    error.value = err.message || 'Failed to sync with API. Verify server connection.';
  } finally {
    loading.value = false;
    firstLoad.value = false;
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
