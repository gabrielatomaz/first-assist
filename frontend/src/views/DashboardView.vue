<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-primaryNavy tracking-tight">Technical Incidents</h2>
        <p class="text-sm text-gray-500 mt-1">Real-time status tracking and CSA assignments for FRC teams</p>
      </div>

      <!-- Filters (Status & Event) -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Event Code Filter (Epic 11 / Epic 16) -->
        <select v-model="eventFilter" @change="fetchIncidents" class="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-white font-semibold">
          <option value="ALL">All Competitions</option>
          <option v-for="ev in events" :key="ev._id" :value="ev.code">
            {{ ev.name }} ({{ ev.code }})
          </option>
        </select>

        <!-- Status Filter (Epic 16) -->
        <select v-model="statusFilter" @change="fetchIncidents" class="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-white font-semibold">
          <option value="ALL">All Active Issues</option>
          <option value="OPEN">Open Queue</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING">Waiting</option>
          <option value="RESOLVED">Resolved Tickets</option>
          <option value="CLOSED">Closed Tickets</option>
        </select>

        <button
          @click="fetchIncidents"
          class="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border rounded-lg text-xs font-semibold shadow-sm transition duration-150"
        >
          &#8635; Refresh
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
        
        <div v-if="incidents.length === 0" class="col-span-full text-center py-16 bg-bgCard rounded-2xl border border-dashed border-gray-200">
          <p class="text-gray-400 text-sm font-medium">No incidents match the active filters. The field is clear!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { IncidentCard } from '../components';

const authStore = useAuthStore();
const incidents = ref([]);
const events = ref([]);
const loading = ref(true);
const firstLoad = ref(true);
const error = ref(null);

const statusFilter = ref('ALL');
const eventFilter = ref('ALL');

let pollInterval = null;

const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
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
    const response = await fetch(`http://localhost:3000/api/incidents${query}`, {
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
  fetchIncidents();
  
  // Real-time polling updates every 3000ms (Epic 14)
  pollInterval = setInterval(() => {
    fetchIncidents();
  }, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
