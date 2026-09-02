<template>
  <div class="max-w-5xl mx-auto space-y-8 mt-8 animate-fadeIn text-textMain">
    <!-- Header -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">System Logs & Monitoring</h2>
        <p class="text-sm text-gray-400 font-medium mt-1">Audit trail tracking, application security, and server health diagnostics</p>
      </div>
      <router-link to="/users" class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-bold px-4 py-2 rounded-lg text-xs transition">
        👥 Manage Users
      </router-link>
    </div>

    <!-- Health Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-green-400">ONLINE</span>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Backend Node API Status</span>
      </div>
      <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-primaryTeal">{{ auditLogs.length }}</span>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Logged System Actions</span>
      </div>
      <div class="bg-bgCard p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col items-center justify-center">
        <span class="text-3xl font-extrabold text-accentPurple">CONNECTED</span>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">MongoDB Atlas Cluster</span>
      </div>
    </div>

    <!-- System Audit Logs Section -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-3">
        <h3 class="text-base font-bold text-primaryTeal tracking-tight">System Audit Log History</h3>
        
        <!-- Filter Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-xs font-bold text-gray-400 uppercase">Action Filter:</label>
          <select v-model="actionFilter" class="px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-bold">
            <option value="ALL">All Actions</option>
            <option value="TBA_EVENT_IMPORT">TBA Event Import</option>
            <option value="EVENT_CREATION">Event Creation</option>
            <option value="EVENT_ACTIVATION">Event Activation</option>
            <option value="EVENT_TEAM_ADDED">Team Added to Event</option>
            <option value="EVENT_TEAM_REMOVED">Team Removed from Event</option>
            <option value="INCIDENT_STATUS_CHANGE">Status Changes</option>
          </select>
        </div>
      </div>

      <div class="max-h-[500px] overflow-y-auto space-y-3 pr-1">
        <div v-if="filteredAuditLogs.length === 0" class="text-center py-12 text-xs text-gray-400 font-medium">
          No audit log entries matching selected criteria.
        </div>
        <div 
          v-for="log in filteredAuditLogs" 
          :key="log._id"
          class="p-4 rounded-xl border border-gray-800 bg-bgMain flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
        >
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="text-[9px] bg-accentPurple/10 text-accentPurple font-extrabold uppercase font-mono px-2 py-0.5 rounded border border-accentPurple/20">
                {{ log.action }}
              </span>
              <span class="font-bold text-white">{{ log.details || 'System event recorded' }}</span>
            </div>
            <p class="text-[10px] text-gray-400 font-mono">
              User: <span class="text-gray-300">{{ log.userId?.name || 'System Auto' }}</span> ({{ log.userId?.email || 'N/A' }})
            </p>
          </div>
          <span class="text-[10px] text-gray-400 font-mono whitespace-nowrap">{{ formatDate(log.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();
const auditLogs = ref([]);
const actionFilter = ref('ALL');

const fetchAuditLogs = async () => {
  try {
    const res = await fetch(getApiUrl('/admin/audit-logs'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      auditLogs.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load system audit logs:', err);
  }
};

const filteredAuditLogs = computed(() => {
  if (actionFilter.value === 'ALL') return auditLogs.value;
  return auditLogs.value.filter(l => l.action === actionFilter.value);
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchAuditLogs();
});
</script>
