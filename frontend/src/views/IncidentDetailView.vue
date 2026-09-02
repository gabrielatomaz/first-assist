<template>
  <div v-if="loading" class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primaryTeal border-t-transparent"></div>
    <p class="text-sm text-gray-500 mt-2">Loading incident details...</p>
  </div>

  <div v-else-if="error" class="bg-red-50 text-accentCoral p-4 rounded-xl text-center text-sm font-medium">
    {{ error }}
  </div>

  <div v-else-if="incident" class="space-y-8 animate-fadeIn max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between md:items-start gap-4">
      <div class="space-y-2">
        <div class="flex items-center space-x-3">
          <span :class="statusBadgeClass" class="px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider uppercase">
            {{ incident.status }}
          </span>
          <span :class="priorityBadgeClass" class="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest font-mono uppercase">
            {{ incident.priority }}
          </span>
          <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">Team {{ incident.teamNumber }}</h2>
        </div>
        <p class="text-sm text-gray-400 font-medium">
          Event: <span class="font-extrabold text-primaryTeal uppercase">{{ incident.eventCode || 'N/A' }}</span> | Match: <span class="font-bold text-gray-300">{{ incident.matchNumber || 'N/A' }}</span> | Reported: {{ formatTime(incident.createdAt) }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
        <!-- Assign selection menu for Admin/FTA -->
        <div v-if="authStore.isAdmin || authStore.isFTA" class="flex items-center space-x-2 bg-bgCard px-3 py-1.5 rounded-lg border border-gray-700">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Technician</label>
          <select v-model="selectedAssignee" @change="assignTechnician" class="text-xs bg-transparent focus:outline-none font-semibold text-textMain select-none">
            <option :value="null" class="bg-bgCard">Unassigned</option>
            <option v-for="user in technicians" :key="user._id" :value="user._id" class="bg-bgCard">{{ user.name }} ({{ user.role }})</option>
          </select>
        </div>

        <!-- Status update select menu -->
        <div v-if="authStore.isAdmin || authStore.isFTA || isAssignee" class="flex items-center space-x-2 bg-bgCard px-3 py-1.5 rounded-lg border border-gray-700">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Status</label>
          <select v-model="selectedStatus" @change="updateStatus" class="text-xs bg-transparent focus:outline-none font-semibold text-textMain">
            <option value="OPEN" class="bg-bgCard">Open</option>
            <option value="ASSIGNED" class="bg-bgCard">Assigned</option>
            <option value="IN_PROGRESS" class="bg-bgCard">In Progress</option>
            <option value="WAITING" class="bg-bgCard">Waiting</option>
            <option value="RESOLVED" disabled class="bg-bgCard">Resolved</option>
            <option value="CLOSED" disabled class="bg-bgCard">Closed</option>
          </select>
        </div>

        <!-- Action triggers -->
        <button
          v-if="incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && incident.assignedTo?._id !== authStore.user?._id"
          @click="assignToMe"
          class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition duration-150"
        >
          Assign to Me
        </button>

        <button
          v-if="incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING'"
          @click="showResolveModal = true"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition duration-150"
        >
          Resolve
        </button>

        <button
          v-if="incident.status === 'RESOLVED' && (authStore.isAdmin || authStore.isFTA)"
          @click="closeIncident"
          class="bg-primaryNavy hover:bg-primaryNavy/90 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition duration-150"
        >
          Close Incident
        </button>
      </div>
    </div>

    <!-- Detail Box -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-6">
        <!-- Description -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-3">
          <h3 class="text-xs font-bold text-primaryTeal uppercase tracking-wider">Issue Description</h3>
          <p class="text-sm text-gray-200 mt-2 whitespace-pre-wrap">{{ incident.description }}</p>
        </div>

        <!-- Technical Diagnosis Notes -->
        <div v-if="incident.status === 'RESOLVED' || incident.status === 'CLOSED'" class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
          <div class="flex justify-between items-center border-b border-gray-800 pb-2">
            <h3 class="text-xs font-bold text-primaryTeal uppercase tracking-wider">Diagnosis Details</h3>
            <button
              v-if="isAssignee"
              @click="editingDiagnosis = !editingDiagnosis"
              class="text-xs text-primaryTeal hover:underline font-semibold"
            >
              {{ editingDiagnosis ? 'Cancel' : 'Edit Notes' }}
            </button>
          </div>

          <div v-if="editingDiagnosis" class="space-y-3">
            <textarea
              v-model="diagnosisText"
              rows="3"
              placeholder="Record technical reasoning, diagnostic observations..."
              class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500"
            ></textarea>
            <div class="flex justify-end">
              <button
                @click="saveDiagnosis"
                :disabled="savingDiagnosis"
                class="bg-primaryTeal text-white text-xs font-bold py-1.5 px-4 rounded shadow hover:bg-opacity-90 disabled:opacity-50"
              >
                {{ savingDiagnosis ? 'Saving...' : 'Save Diagnosis' }}
              </button>
            </div>
          </div>

          <div v-else>
            <p v-if="incident.diagnosis" class="text-sm text-gray-200 leading-relaxed font-medium bg-bgMain p-3 rounded-lg border border-gray-800">
              {{ incident.diagnosis }}
            </p>
            <p v-else class="text-xs text-gray-400 font-medium italic">No technical diagnosis notes recorded yet.</p>
          </div>
        </div>

        <!-- AI Assistant Suggestions -->
        <AISuggestionPanel :incident-id="incident._id" />

        <!-- Comments & coordination thread -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800">
          <CommentSection :incident-id="incident._id" />
        </div>
      </div>

      <!-- Assignee Card info -->
      <div class="space-y-6">
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
          <h3 class="text-xs font-bold text-primaryTeal uppercase tracking-wider border-b border-gray-800 pb-2">Technical Assignee</h3>
          <div v-if="incident.assignedTo" class="flex items-center space-x-3 pt-2">
            <div class="w-10 h-10 rounded-full bg-primaryTeal/10 flex items-center justify-center font-bold text-primaryTeal text-sm uppercase">
              {{ incident.assignedTo?.name?.charAt(0) || '?' }}
            </div>
            <div>
              <p class="text-sm font-bold text-white leading-tight">{{ incident.assignedTo?.name }}</p>
              <p class="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{{ incident.assignedTo?.role }}</p>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 font-medium">Unassigned queue</p>
        </div>

        <div v-if="incident.status === 'RESOLVED' || incident.status === 'CLOSED'" class="bg-green-950/20 border border-green-900/30 p-6 rounded-2xl space-y-4">
          <h3 class="text-xs font-bold text-green-400 uppercase tracking-wider border-b border-green-900/30 pb-2">Resolution details</h3>
          <div>
            <h4 class="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Root Cause</h4>
            <p class="text-xs text-textMain leading-relaxed font-medium bg-bgMain p-2.5 rounded border border-green-900/30">{{ incident.rootCause }}</p>
          </div>
          <div>
            <h4 class="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Applied Fix</h4>
            <p class="text-xs text-textMain leading-relaxed font-medium bg-bgMain p-2.5 rounded border border-green-900/30">{{ incident.appliedSolution }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Timeline (Epic 15 / US-AUDIT-001) -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4 mt-6">
      <h3 class="text-xs font-bold text-primaryTeal uppercase tracking-wider border-b border-gray-800 pb-2">Incident Event Timeline</h3>
      <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
        <div v-if="auditLogs.length === 0" class="text-center py-6 text-xs text-gray-400">
          No events logged yet.
        </div>
        <div 
          v-for="log in auditLogs" 
          :key="log._id" 
          class="flex items-start justify-between space-x-3 text-xs leading-relaxed p-2.5 rounded-lg bg-bgMain border border-gray-800 hover:shadow-sm transition"
        >
          <div class="flex items-start space-x-3">
            <div class="w-1.5 h-1.5 rounded-full bg-primaryTeal mt-1.5 flex-shrink-0 animate-pulse"></div>
            <div class="flex-grow">
              <span class="font-extrabold text-textMain">{{ log.userId?.name || 'System' }}</span>
              <span class="text-[9px] bg-gray-800 text-gray-400 font-extrabold uppercase font-mono px-1 rounded ml-1">
                {{ log.userId?.role || 'SYSTEM' }}
              </span>
              <span class="text-gray-300 font-medium ml-2">{{ log.details }}</span>
            </div>
          </div>
          <span class="text-[10px] text-gray-400 font-mono">{{ formatTime(log.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- Resolution Modal overlay -->
    <ResolveIncidentModal
      v-if="showResolveModal"
      :incident-id="incident._id"
      @close="showResolveModal = false"
      @resolved="handleIncidentResolved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { CommentSection, AISuggestionPanel, ResolveIncidentModal } from '../components';
import { getApiUrl } from '../config/api';

const route = useRoute();
const authStore = useAuthStore();

const incident = ref(null);
const auditLogs = ref([]);
const loading = ref(true);
const error = ref(null);
const showResolveModal = ref(false);

const selectedAssignee = ref(null);
const selectedStatus = ref('OPEN');
const technicians = ref([]);

const diagnosisText = ref('');
const editingDiagnosis = ref(false);
const savingDiagnosis = ref(false);

const isAssignee = computed(() => {
  return incident.value?.assignedTo?._id === authStore.user?._id;
});

const statusBadgeClass = computed(() => {
  if (!incident.value) return '';
  switch (incident.value.status) {
    case 'OPEN': return 'bg-primaryTeal/10 text-primaryTeal border border-primaryTeal/25';
    case 'ASSIGNED': return 'bg-accentYellow/10 text-accentYellow border border-accentYellow/25';
    case 'IN_PROGRESS': return 'bg-accentPurple/10 text-accentPurple border border-accentPurple/25';
    case 'WAITING': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'RESOLVED': return 'bg-green-950/40 text-green-400 border border-green-900/30';
    case 'CLOSED': return 'bg-gray-800/80 text-gray-500 border border-gray-700/50';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});

const priorityBadgeClass = computed(() => {
  if (!incident.value) return '';
  switch (incident.value.priority) {
    case 'LOW': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'MEDIUM': return 'bg-blue-950/40 text-blue-400 border border-blue-900/30';
    case 'HIGH': return 'bg-accentCoral/10 text-accentCoral border border-accentCoral/20';
    case 'CRITICAL': return 'bg-red-950/40 text-red-400 border border-red-900/30 animate-pulse';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});

const fetchDetails = async (isBackground = false) => {
  if (!isBackground) {
    loading.value = true;
  }
  error.value = null;
  try {
    const response = await fetch(getApiUrl(`/incidents/${route.params.id}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to load incident detail parameters');
    const data = await response.json();
    
    // Update incident data
    incident.value = data;
    selectedAssignee.value = data.assignedTo?._id || null;
    selectedStatus.value = data.status;

    // Only update diagnosis text if user is NOT currently editing
    if (!editingDiagnosis.value) {
      diagnosisText.value = data.diagnosis || '';
    }
  } catch (err) {
    if (!isBackground) {
      error.value = err.message;
    }
  } finally {
    if (!isBackground) {
      loading.value = false;
    }
  }
};

const fetchTechnicians = async () => {
  console.log('fetchTechnicians called. Token present:', !!authStore.token);
  try {
    const response = await fetch(getApiUrl('/users'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    console.log('fetchTechnicians response status:', response.status);
    if (response.ok) {
      const allUsers = await response.json();
      console.log('All users fetched:', allUsers.length);
      technicians.value = allUsers.filter(u => {
        const role = (u.role || '').toUpperCase();
        return role === 'CSA' || role === 'FTA';
      });
      console.log('Filtered technicians:', technicians.value.length);
    } else {
      const errText = await response.text();
      console.error('Failed to fetch technicians:', response.status, errText);
    }
  } catch (err) {
    console.error('Error fetching technicians:', err);
  }
};

const assignTechnician = async () => {
  try {
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: incident.value.status, assignedTo: selectedAssignee.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to reassign technician');
    incident.value = data;
    selectedStatus.value = data.status;
  } catch (err) {
    alert(err.message);
    selectedAssignee.value = incident.value.assignedTo?._id || null;
  }
};

const assignToMe = async () => {
  try {
    const nextStatus = incident.value.status === 'OPEN' ? 'ASSIGNED' : incident.value.status;
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: nextStatus, assignedTo: authStore.user._id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to claim incident');
    incident.value = data;
    selectedStatus.value = data.status;
    selectedAssignee.value = data.assignedTo?._id || null;
  } catch (err) {
    alert(err.message);
  }
};

const updateStatus = async () => {
  try {
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: selectedStatus.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to change ticket status');
    incident.value = data;
  } catch (err) {
    alert(err.message);
    selectedStatus.value = incident.value.status;
  }
};

const saveDiagnosis = async () => {
  savingDiagnosis.value = true;
  try {
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/diagnosis`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ diagnosis: diagnosisText.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to save diagnosis details');
    incident.value = data;
    editingDiagnosis.value = false;
  } catch (err) {
    alert(err.message);
  } finally {
    savingDiagnosis.value = false;
  }
};

const closeIncident = async () => {
  try {
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/close`), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to close incident ticket');
    incident.value = data;
    selectedStatus.value = data.status;
  } catch (err) {
    alert(err.message);
  }
};

const handleIncidentResolved = (resolvedData) => {
  incident.value = resolvedData;
  selectedStatus.value = resolvedData.status;
  showResolveModal.value = false;
};

const fetchAuditLogs = async () => {
  try {
    const response = await fetch(getApiUrl(`/incidents/${route.params.id}/audit-logs`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      auditLogs.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to load incident audit timeline:', err);
  }
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

let pollInterval = null;

onMounted(() => {
  console.log('onMounted IncidentDetailView. User Role:', authStore.user?.role, 'isAdmin:', authStore.isAdmin, 'isFTA:', authStore.isFTA);
  fetchDetails();
  fetchAuditLogs();
  if (authStore.isAdmin || authStore.isFTA) {
    fetchTechnicians();
  }
  
  // Real-time updates (Epic 14) refetches details/logs silently every 3000ms
  pollInterval = setInterval(() => {
    fetchDetails(true);
    fetchAuditLogs();
  }, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
