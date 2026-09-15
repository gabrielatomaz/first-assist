<template>
  <div class="max-w-4xl mx-auto space-y-6 mt-8 animate-fadeIn">
    <!-- Header -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">Team {{ teamNumber }}</h2>
        <p class="text-sm text-gray-400 font-medium mt-1">
          Rookie Year: <span class="font-bold text-gray-300">{{ team ? team.rookieYear || 'N/A' : 'N/A' }}</span>
        </p>
      </div>
      <router-link to="/" class="text-xs text-primaryTeal hover:underline font-bold uppercase tracking-wider">
        Back to Dashboard
      </router-link>
    </div>

    <!-- History stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-primaryTeal">{{ incidents.length }}</span>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Reported Incidents</span>
      </div>
      <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-accentGreen">{{ resolvedCount }}</span>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Resolved Issues</span>
      </div>
      <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-accentCoral">{{ openCount }}</span>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Open/Active issues</span>
      </div>
    </div>

    <!-- History Timeline List -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
      <div class="border-b border-gray-800 pb-3">
        <h3 class="text-lg font-bold text-textMain tracking-tight">Incident History Log</h3>
      </div>

      <div v-if="loading" class="text-center py-6 text-xs text-gray-400 font-bold">
        Loading historical tickets...
      </div>
      
      <div v-else-if="incidents.length === 0" class="text-center py-6 text-xs text-gray-400 font-medium">
        No previous incident logs found for Team {{ teamNumber }}.
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="inc in incidents" 
          :key="inc._id"
          class="p-4 rounded-xl border border-gray-800 bg-bgCard hover:shadow-md transition flex flex-col space-y-3"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold font-mono text-gray-500 uppercase">Match {{ inc.matchNumber || 'N/A' }}</span>
              <span class="text-[10px] bg-primaryTeal/10 text-primaryTeal font-extrabold font-mono tracking-widest px-2 py-0.5 rounded uppercase">
                {{ inc.category }}
              </span>
            </div>
            <span :class="statusBadgeClass(inc.status)" class="text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
              {{ inc.status }}
            </span>
          </div>

          <p class="text-xs text-gray-200 leading-relaxed font-medium">{{ inc.description }}</p>

          <div v-if="inc.rootCause || inc.appliedSolution" class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bgMain p-3 rounded-lg text-xs mt-1 border border-gray-800">
            <div>
              <span class="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Root Cause</span>
              <span class="text-gray-200 font-medium leading-relaxed">{{ inc.rootCause || 'N/A' }}</span>
            </div>
            <div>
              <span class="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Applied Solution</span>
              <span class="text-gray-200 font-medium leading-relaxed">{{ inc.appliedSolution || 'N/A' }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center text-[10px] text-gray-400 font-semibold border-t pt-2 mt-1">
            <span>Reported by: {{ inc.reportedBy?.name || 'Unknown' }}</span>
            <span>Date: {{ formatTime(inc.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const route = useRoute();
const authStore = useAuthStore();

const teamNumber = computed(() => Number(route.params.number));
const team = ref(null);
const incidents = ref([]);
const loading = ref(true);

const resolvedCount = computed(() => incidents.value.filter(i => i.status === 'RESOLVED').length);
const openCount = computed(() => incidents.value.filter(i => i.status !== 'RESOLVED').length);

const fetchTeamDetails = async () => {
  try {
    const response = await fetch(getApiUrl(`/teams/search?q=${teamNumber.value}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) team.value = data[0];
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchHistory = async () => {
  loading.value = true;
  try {
    const response = await fetch(getApiUrl(`/teams/${teamNumber.value}/history`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      incidents.value = await response.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-primaryTeal/10 text-primaryTeal border border-primaryTeal/25';
    case 'ASSIGNED': return 'bg-accentYellow/10 text-accentYellow border border-accentYellow/25';
    case 'IN_PROGRESS': return 'bg-accentPurple/10 text-accentPurple border border-accentPurple/25';
    case 'WAITING': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'RESOLVED': return 'bg-accentGreen/10 text-accentGreen border border-accentGreen/30';
    case 'CLOSED': return 'bg-gray-800/80 text-gray-500 border border-gray-700/50';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchTeamDetails();
  fetchHistory();
});
</script>
