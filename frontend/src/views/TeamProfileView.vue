<template>
  <div class="max-w-4xl mx-auto space-y-6 mt-8 animate-fadeIn">
    <!-- Header -->
    <PageHeader
      :title="'Team ' + teamNumber"
      :subtitle="'Rookie Year: ' + (team ? team.rookieYear || 'N/A' : 'N/A')"
      :card="true"
    >
      <template #actions>
        <router-link to="/" class="text-xs text-teal-400 hover:underline font-bold uppercase tracking-wider">
          Back to Dashboard
        </router-link>
      </template>
    </PageHeader>

    <!-- History stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Total Reported Incidents" :value="incidents.length" variant="teal" />
      <StatCard title="Resolved Issues" :value="resolvedCount" variant="green" />
      <StatCard title="Open/Active issues" :value="openCount" variant="coral" />
    </div>

    <!-- History Timeline List -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
      <div class="border-b border-gray-800 pb-3">
        <h3 class="text-lg font-bold text-textMain tracking-tight">Incident History Log</h3>
      </div>

      <LoadingSpinner v-if="loading" text="Loading historical tickets..." />
      
      <EmptyState
        v-else-if="incidents.length === 0"
        icon="clipboard-list"
        title="No Previous Logs"
        :description="'No previous incident logs found for Team ' + teamNumber + '.'"
      />

      <div v-else class="space-y-4">
        <div 
          v-for="inc in incidents" 
          :key="inc._id"
          class="p-4 rounded-xl border border-gray-800 bg-bgMain hover:border-gray-700 hover:shadow-md transition flex flex-col space-y-3"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold font-mono text-gray-400 uppercase">Match {{ inc.matchNumber || 'N/A' }}</span>
              <CategoryBadge :category="inc.category" />
            </div>
            <StatusBadge :status="inc.status" size="xs" />
          </div>

          <p class="text-xs text-gray-200 leading-relaxed font-medium">{{ inc.description }}</p>

          <div v-if="inc.rootCause || inc.appliedSolution" class="p-3 bg-bgCard rounded-lg border border-gray-800 space-y-1.5 text-xs">
            <div v-if="inc.rootCause">
              <span class="font-bold text-teal-400">Root Cause:</span>
              <span class="text-gray-300 ml-1">{{ inc.rootCause }}</span>
            </div>
            <div v-if="inc.appliedSolution">
              <span class="font-bold text-emerald-400">Fix:</span>
              <span class="text-gray-300 ml-1">{{ inc.appliedSolution }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-1">
            <span>Reported by: {{ inc.reportedBy?.name || 'Anonymous' }}</span>
            <span>{{ formatTime(inc.createdAt) }}</span>
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
import {
  PageHeader,
  StatCard,
  CategoryBadge,
  StatusBadge,
  LoadingSpinner,
  EmptyState
} from '../components';

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

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchTeamDetails();
  fetchHistory();
});
</script>
