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
        <div class="flex items-center space-x-3 flex-nowrap">
          <span :class="statusBadgeClass" class="px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider uppercase flex-shrink-0">
            {{ incident.status }}
          </span>
          <span :class="priorityBadgeClass" class="px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider uppercase flex-shrink-0">
            {{ incident.priority }}
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-primaryTeal tracking-tight whitespace-nowrap">Team {{ incident.teamNumber }}</h2>
        </div>
        <p class="text-sm text-gray-400 font-medium sm:whitespace-nowrap">
          Event: <span class="font-extrabold text-primaryTeal uppercase">{{ incident.eventCode || 'N/A' }}</span> | Match: <span class="font-bold text-gray-300">{{ incident.matchNumber || 'N/A' }}</span> | Reported: {{ formatTime(incident.createdAt) }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
        <!-- 1. Technician selection dropdown (with "Assign to Me") -->
        <div v-if="authStore.isAdmin || authStore.isFTA || authStore.user" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-1.5 w-full sm:w-auto flex-shrink-0">
          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Technician:</label>
          <select
            v-model="selectedAssignee"
            @change="assignTechnician"
            class="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-bgCard font-semibold text-textMain cursor-pointer shadow-sm hover:border-gray-600 transition"
          >
            <option :value="null" class="bg-bgCard text-textMain py-1.5 font-semibold">Unassigned</option>
            <option 
              v-if="authStore.user" 
              :value="authStore.user._id" 
              class="bg-bgCard text-accentYellow font-bold py-1.5"
            >
              Assign to Me ({{ userRoleLabel }})
            </option>
            <option 
              v-for="user in technicians.filter(u => u._id !== authStore.user?._id)" 
              :key="user._id" 
              :value="user._id" 
              class="bg-bgCard text-textMain py-1.5 font-semibold"
            >
              {{ user.name }} ({{ user.role }})
            </option>
          </select>
        </div>

        <!-- 2. Status update select dropdown -->
        <div v-if="authStore.isAdmin || authStore.isFTA || isAssignee" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-1.5 w-full sm:w-auto flex-shrink-0">
          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status:</label>
          <select
            v-model="selectedStatus"
            @change="updateStatus"
            class="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs bg-bgCard font-semibold text-textMain cursor-pointer shadow-sm hover:border-gray-600 transition"
          >
            <option value="OPEN" class="bg-bgCard text-primaryTeal font-bold py-1.5">Open</option>
            <option value="ASSIGNED" class="bg-bgCard text-accentYellow font-bold py-1.5">Assigned</option>
            <option value="IN_PROGRESS" class="bg-bgCard text-accentPurple font-bold py-1.5">In Progress</option>
            <option value="WAITING" class="bg-bgCard text-gray-400 font-semibold py-1.5">Waiting</option>
            <option value="RESOLVED" disabled class="bg-bgCard text-green-500 font-bold py-1.5">Resolved</option>
            <option value="CLOSED" disabled class="bg-bgCard text-gray-500 font-semibold py-1.5">Closed</option>
          </select>
        </div>

        <!-- 3 & 4. Action icon buttons group (Expanded on mobile, compact on desktop) -->
        <div v-if="canDelete || (incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING')" class="flex items-center space-x-2 w-full sm:w-auto flex-shrink-0">
          <button
            v-if="canDelete"
            @click="showDeleteModal = true"
            class="flex-1 sm:flex-initial h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-accentCoral/20 hover:bg-accentCoral text-accentCoral hover:text-white border border-accentCoral/40 rounded-lg transition duration-150 cursor-pointer"
            title="Delete Incident"
          >
            <font-awesome-icon icon="trash-can" class="text-xs" />
          </button>

          <button
            v-if="incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING'"
            @click="showResolveModal = true"
            class="flex-1 sm:flex-initial h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-150 shadow hover:shadow-md cursor-pointer"
            title="Resolve Incident"
          >
            <font-awesome-icon icon="check" class="text-xs" />
          </button>
        </div>

        <button
          v-if="incident.status === 'RESOLVED' && (authStore.isAdmin || authStore.isFTA)"
          @click="closeIncident"
          class="w-full sm:w-auto bg-primaryNavy hover:bg-primaryNavy/90 text-white font-semibold py-1.5 px-3 rounded-lg text-[11px] shadow hover:shadow-md transition duration-150 text-center flex-shrink-0 flex items-center justify-center space-x-1 cursor-pointer"
        >
          <font-awesome-icon icon="circle-xmark" class="mr-1 text-xs" />
          <span>Close Incident</span>
        </button>
      </div>
    </div>

    <!-- Detail Box -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Mobile Technical Assignee Header Card (Visible on mobile only, above Issue Description) -->
      <div class="block md:hidden bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
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

      <!-- Desktop Sidebar Column -->
      <div class="space-y-6">
        <!-- Desktop Assignee Card info -->
        <div class="hidden md:block bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
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

        <!-- Resolution Details Card -->
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

        <!-- Collapsible Audit Timeline spanning edge to edge when closed -->
        <div class="bg-bgCard rounded-2xl shadow border border-gray-800 overflow-hidden transition">
          <button 
            @click="isAuditTimelineOpen = !isAuditTimelineOpen"
            class="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-800/30 transition cursor-pointer group select-none"
          >
            <div class="flex items-center space-x-2">
              <h3 class="text-xs font-bold text-primaryTeal uppercase tracking-wider">Audit Timeline</h3>
              <span v-if="auditLogs.length" class="text-[10px] bg-bgMain text-primaryTeal px-1.5 py-0.5 rounded font-mono font-bold border border-gray-800">
                {{ auditLogs.length }}
              </span>
            </div>
            <font-awesome-icon 
              icon="chevron-down" 
              class="w-3.5 h-3.5 text-gray-400 group-hover:text-primaryTeal transition-transform duration-200"
              :class="{ 'rotate-180': isAuditTimelineOpen }"
            />
          </button>

          <!-- Collapsible Content with Vertical Timeline Line -->
          <div v-show="isAuditTimelineOpen" class="px-6 pb-6 pt-3 border-t border-gray-800 space-y-4">
            <div v-if="auditLogs.length === 0" class="text-center py-4 text-xs text-gray-400 font-medium">
              No events logged yet for this incident.
            </div>

            <!-- Vertical Timeline Track -->
            <div v-else class="relative border-l-2 border-primaryTeal/30 ml-2.5 space-y-4 my-1">
              <div 
                v-for="log in auditLogs" 
                :key="log._id" 
                class="relative pl-5 text-xs group/log"
              >
                <!-- Timeline Dot Node -->
                <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primaryTeal ring-4 ring-bgCard shadow-sm transition group-hover/log:scale-125"></div>

                <!-- Event Log Item Card -->
                <div class="bg-bgMain border border-gray-800 hover:border-gray-700 p-3 rounded-xl shadow-sm transition space-y-1">
                  <div class="flex items-center justify-between">
                    <span 
                      class="font-extrabold text-xs"
                      :class="{
                        'text-accentYellow': log.userId?.role === 'ADMIN',
                        'text-primaryTeal': log.userId?.role === 'FTA',
                        'text-accentPurple': log.userId?.role === 'CSA',
                        'text-gray-300': !['ADMIN', 'FTA', 'CSA'].includes(log.userId?.role)
                      }"
                    >
                      {{ log.userId?.name || 'System' }}
                    </span>
                    <span class="text-[10px] text-gray-400 font-mono">{{ formatTime(log.timestamp) }}</span>
                  </div>

                  <p class="text-xs text-gray-300 font-medium leading-normal pt-0.5">{{ log.details }}</p>
                </div>
              </div>
            </div>
          </div>
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

    <!-- Confirm Delete Modal overlay -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-bgCard border border-gray-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center space-x-3 text-accentCoral">
          <font-awesome-icon icon="triangle-exclamation" class="text-2xl text-accentCoral" />
          <h3 class="text-lg font-bold">Delete Incident</h3>
        </div>
        <p class="text-sm text-gray-300">Are you sure you want to permanently delete this incident ticket for <strong>Team {{ incident.teamNumber }}</strong>? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3 pt-2">
          <button @click="showDeleteModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-bgMain text-gray-300 hover:text-white border border-gray-700">Cancel</button>
          <button @click="handleDelete" :disabled="deleting" class="px-4 py-2 rounded-xl text-xs font-bold bg-accentCoral hover:bg-accentCoral/90 text-white shadow">
            {{ deleting ? 'Deleting...' : 'Delete Incident' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { CommentSection, AISuggestionPanel, ResolveIncidentModal } from '../components';
import { getApiUrl } from '../config/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const incident = ref(null);
const auditLogs = ref([]);
const loading = ref(true);
const error = ref(null);
const showResolveModal = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);

const canDelete = computed(() => {
  if (!incident.value || !authStore.user) return false;
  if (authStore.isFTA || authStore.isAdmin) return true;
  const creatorId = typeof incident.value.reportedBy === 'object' 
    ? incident.value.reportedBy?._id 
    : incident.value.reportedBy;
  return creatorId === authStore.user._id;
});

const userRoleLabel = computed(() => {
  const role = authStore.user?.role;
  if (!role) return 'Admin';
  if (role === 'ADMIN' || role.toLowerCase().includes('admin')) return 'Admin';
  return role;
});

const handleDelete = async () => {
  try {
    deleting.value = true;
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete incident');
    }
    router.push('/');
  } catch (err) {
    alert(err.message);
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

const selectedAssignee = ref(null);
const selectedStatus = ref('OPEN');
const technicians = ref([]);

const diagnosisText = ref('');
const editingDiagnosis = ref(false);
const savingDiagnosis = ref(false);
const isAuditTimelineOpen = ref(false);

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

    // Refresh technicians list scoped to this event
    if (authStore.isAdmin || authStore.isFTA) {
      fetchTechnicians();
    }

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
      const eventCode = incident.value?.eventCode;
      
      technicians.value = allUsers.filter(u => {
        const role = (u.role || '').toUpperCase();
        if (role !== 'CSA' && role !== 'FTA') return false;

        // If incident event code is missing, allow all FTAs/CSAs
        if (!eventCode) return true;

        // User must be assigned to this specific event (assignedEventCode or in assignedEventCodes array)
        const isAssignedToEvent =
          u.assignedEventCode === eventCode ||
          (Array.isArray(u.assignedEventCodes) && u.assignedEventCodes.includes(eventCode));

        return isAssignedToEvent;
      });
      console.log(`Filtered technicians for event ${eventCode}:`, technicians.value.length);
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
