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
        <select v-if="authStore.isAdmin || authStore.isFTA" v-model="eventFilter" @change="fetchIncidents" class="px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-bgCard font-semibold text-textMain">
          <option value="ALL">{{ authStore.isAdmin ? 'All Competitions' : 'All My Regionals' }}</option>
          <option v-for="ev in availableEvents" :key="ev._id" :value="ev.code">
            {{ ev.name }} ({{ ev.code }})
          </option>
        </select>

        <!-- CSA Active Event Context Badge (CSAs have 1 event, no dropdown) -->
        <div v-else-if="authStore.user?.assignedEventCode" class="px-3.5 py-2 rounded-lg border border-primaryTeal/40 bg-primaryTeal/10 text-primaryTeal text-xs font-bold font-mono">
          🏆 Active Event: {{ authStore.user.assignedEventCode }}
        </div>

        <!-- Status Filter (Epic 16) -->
        <select v-model="statusFilter" @change="fetchIncidents" class="px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-bgCard font-semibold text-textMain">
          <option value="ALL">All Active Issues</option>
          <option value="OPEN">Open Queue</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING">Waiting</option>
          <option value="RESOLVED">Resolved Tickets</option>
          <option value="CLOSED">Closed Tickets</option>
        </select>

        <!-- Auto Refresh Interval Dropdown (FEAT-015) -->
        <div class="flex items-center space-x-1.5 bg-bgCard px-3 py-1.5 rounded-lg border border-gray-700">
          <span class="text-[10px] font-bold text-gray-400 uppercase">Auto Sync:</span>
          <select 
            v-model.number="refreshInterval" 
            @change="updateRefreshInterval" 
            class="text-xs bg-transparent focus:outline-none font-bold text-primaryTeal cursor-pointer"
          >
            <option :value="0" class="bg-bgCard">Manual Only</option>
            <option :value="5000" class="bg-bgCard">Every 5s</option>
            <option :value="15000" class="bg-bgCard">Every 15s</option>
            <option :value="30000" class="bg-bgCard">Every 30s</option>
            <option :value="60000" class="bg-bgCard">Every 1 min</option>
            <option :value="300000" class="bg-bgCard">Every 5 min</option>
            <option :value="900000" class="bg-bgCard">Every 15 min</option>
          </select>
        </div>

        <button
          @click="fetchIncidents"
          title="Refresh Incident Board"
          class="bg-bgCard hover:bg-gray-800 text-textMain px-3 py-2 border border-gray-700 rounded-lg text-sm font-bold shadow-sm transition duration-150 cursor-pointer"
        >
          <span>&#8635;</span>
        </button>
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
          <div class="text-4xl">📋</div>
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
import { IncidentCard } from '../components';
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

watch(() => authStore.user, (user) => {
  if (user?.role === 'CSA' && user?.assignedEventCode) {
    eventFilter.value = user.assignedEventCode;
  } else if (user?.role === 'FTA' && user?.assignedEventCodes?.length > 0 && eventFilter.value === 'ALL') {
    eventFilter.value = user.assignedEventCodes[0];
  }
}, { immediate: true });

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
  // Role-based event active scoping:
  // 1. CSA: Locked to single active assigned regional context
  if (authStore.user?.role === 'CSA' && authStore.user?.assignedEventCode) {
    eventFilter.value = authStore.user.assignedEventCode;
  }
  // 2. FTA: Has one active regional at a time, but retains multi-regional access & switching
  else if (authStore.user?.role === 'FTA' && authStore.user?.assignedEventCodes?.length > 0) {
    eventFilter.value = authStore.user.assignedEventCodes[0];
  }
  fetchIncidents();
  startPollTimer();
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
