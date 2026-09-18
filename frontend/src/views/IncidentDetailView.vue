<template>
  <LoadingSpinner v-if="loading" text="Loading incident details..." />

  <AlertBanner v-else-if="error" type="error" :message="error" />

  <div v-else-if="incident" class="space-y-8 animate-fadeIn max-w-5xl mx-auto">
    <!-- Quick Triage Action Banner on Top of the Incident Detail -->
    <div v-if="incident.status === 'PENDING_SCREENING' && (authStore.isAdmin || authStore.isFTA || authStore.isCSA)" class="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fadeIn">
      <div class="flex items-center space-x-2.5 text-amber-300 text-xs font-bold">
        <font-awesome-icon icon="shield-halved" class="text-base text-amber-400" />
        <div>
          <p class="text-white font-extrabold text-sm">This ticket is currently In Triage</p>
          <p class="text-gray-400 text-xs font-normal">Review details and accept into the active board or reject.</p>
        </div>
      </div>
      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <BaseButton
          @click="acceptTriage"
          variant="success"
          size="sm"
          icon="check"
          :loading="triageLoading === 'accept'"
          loading-text="Accepting..."
          :disabled="triageLoading !== null"
          title="Accept ticket into Open queue"
          class="flex-1 sm:flex-initial"
        >
          Accept Ticket
        </BaseButton>
        <BaseButton
          @click="rejectTriage"
          variant="danger"
          size="sm"
          icon="xmark"
          :loading="triageLoading === 'reject'"
          loading-text="Rejecting..."
          :disabled="triageLoading !== null"
          title="Reject ticket"
          class="flex-1 sm:flex-initial"
        >
          Reject Ticket
        </BaseButton>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between md:items-start gap-4">
      <div class="space-y-2">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight whitespace-nowrap">Team {{ incident.teamNumber }}</h2>

        <div class="flex flex-wrap items-center gap-2 pt-0.5">
          <StatusBadge :status="incident.status" />
          <PriorityBadge :priority="incident.priority" />
          <CategoryBadge :category="incident.category" />
        </div>

        <p class="text-sm text-gray-400 font-medium sm:whitespace-nowrap pt-0.5">
          Event: <span class="font-bold text-gray-200 uppercase">{{ incident.eventCode || 'N/A' }}</span> | Match: <span class="font-bold text-gray-200">{{ incident.matchNumber || 'N/A' }}</span> | Reported: <span class="text-gray-400">{{ formatTime(incident.createdAt) }}</span>
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
        <!-- 1. Technician selection dropdown (with "Assign to Me") -->
        <div v-if="authStore.isAdmin || authStore.isFTA || authStore.user" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-1.5 w-full sm:w-auto flex-shrink-0">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Technician:</label>
          <CustomSelect
            v-model="selectedAssignee"
            :options="technicianOptions"
            @change="assignTechnician"
            class="w-full sm:w-44 text-xs font-semibold"
          />
        </div>

        <!-- 2. Status update select dropdown -->
        <div v-if="authStore.isAdmin || authStore.isFTA || isAssignee" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-1.5 w-full sm:w-auto flex-shrink-0">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status:</label>
          <CustomSelect
            v-model="selectedStatus"
            :options="statusOptions"
            @change="updateStatus"
            class="w-full sm:w-36 text-xs font-semibold"
          />
        </div>

        <!-- 3 & 4. Action icon buttons group (Expanded on mobile, compact on desktop) -->
        <div v-if="canDelete || (incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING')" class="flex items-center space-x-2 w-full sm:w-auto flex-shrink-0">
          <BaseButton
            v-if="canDelete"
            @click="showDeleteModal = true"
            variant="danger"
            size="icon-sm"
            icon="trash-can"
            title="Delete Incident"
            class="flex-1 sm:flex-initial h-9 sm:h-8"
          />

          <BaseButton
            v-if="incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING'"
            @click="showResolveModal = true"
            variant="success"
            size="icon-sm"
            icon="check"
            title="Resolve Incident"
            class="flex-1 sm:flex-initial h-9 sm:h-8"
          />
        </div>
      </div>
    </div>

    <!-- Detail Box -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Mobile Technical Assignee Header Card (Visible on mobile only, above Issue Description) -->
      <div class="block md:hidden bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
        <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
          <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Technical Assignee</h3>
          <RoleBadge v-if="incident.assignedTo" :role="incident.assignedTo?.role" />
        </div>
        <div v-if="incident.assignedTo" class="flex items-center space-x-3 pt-2">
          <UserAvatar :icon="incident.assignedTo?.avatarIcon" :color="incident.assignedTo?.avatarColor" size="md" :has-bg="true" />
          <p class="text-sm font-bold text-white leading-tight">{{ incident.assignedTo?.name }}</p>
        </div>
        <p v-else class="text-xs text-gray-400 font-medium">Unassigned queue</p>
      </div>

      <div class="md:col-span-2 space-y-6">
        <!-- Description -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-3">
          <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Issue Description</h3>
          <p class="text-sm text-gray-200 mt-2 whitespace-pre-wrap leading-relaxed">{{ incident.description }}</p>
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
          <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
            <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Technical Assignee</h3>
            <RoleBadge v-if="incident.assignedTo" :role="incident.assignedTo?.role" />
          </div>
          <div v-if="incident.assignedTo" class="flex items-center space-x-3 pt-2">
            <UserAvatar :icon="incident.assignedTo?.avatarIcon" :color="incident.assignedTo?.avatarColor" size="md" :has-bg="true" />
            <p class="text-sm font-bold text-white leading-tight">{{ incident.assignedTo?.name }}</p>
          </div>
          <p v-else class="text-xs text-gray-400 font-medium">Unassigned queue</p>
        </div>

        <!-- Resolution Details Card -->
        <div v-if="incident.status === 'RESOLVED' || incident.status === 'CLOSED'" class="bg-accentGreen/10 border border-accentGreen/30 p-6 rounded-2xl space-y-4">
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-accentGreen/30 pb-2">Resolution details</h3>
          <div>
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Root Cause</h4>
            <p class="text-xs text-gray-200 leading-relaxed font-medium bg-bgMain p-2.5 rounded border border-accentGreen/30">{{ incident.rootCause }}</p>
          </div>
          <div>
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Applied Fix</h4>
            <p class="text-xs text-gray-200 leading-relaxed font-medium bg-bgMain p-2.5 rounded border border-accentGreen/30">{{ incident.appliedSolution }}</p>
          </div>
        </div>

        <!-- Collapsible Audit Timeline spanning edge to edge when closed -->
        <div class="bg-bgCard rounded-2xl shadow border border-gray-800 overflow-hidden transition">
          <button 
            @click="toggleAuditTimeline"
            class="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-800/30 transition cursor-pointer group select-none"
          >
            <div class="flex items-center space-x-2">
              <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Audit Timeline</h3>
              <span v-if="auditLogs.length" class="text-[10px] bg-bgMain text-gray-300 px-1.5 py-0.5 rounded font-mono font-bold border border-gray-700">
                {{ auditLogs.length }}
              </span>
            </div>
            <font-awesome-icon 
              icon="chevron-down" 
              class="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200"
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

    <!-- Confirm Reject Triage Modal overlay -->
    <ConfirmationModal
      v-model="showRejectModal"
      title="Reject Technical Incident?"
      :message="`Are you sure you want to reject this incident ticket for Team ${incident.teamNumber}? It will be marked as rejected and removed from the active triage queue.`"
      icon="triangle-exclamation"
      variant="danger"
      confirm-text="Yes, Reject"
      confirm-icon="xmark"
      cancel-text="Cancel"
      :loading="triageLoading === 'reject'"
      loading-text="Rejecting..."
      @confirm="executeRejectTriage"
    />

    <!-- Confirm Delete Modal overlay -->
    <ConfirmationModal
      v-model="showDeleteModal"
      title="Delete Incident?"
      :message="`Are you sure you want to permanently delete this incident ticket for Team ${incident.teamNumber}? This action cannot be undone.`"
      icon="trash-can"
      variant="danger"
      confirm-text="Delete"
      confirm-icon="trash-can"
      cancel-text="Cancel"
      :loading="deleting"
      loading-text="Deleting..."
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  BaseButton,
  CommentSection,
  AISuggestionPanel,
  ResolveIncidentModal,
  CustomSelect,
  UserAvatar,
  ConfirmationModal,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  RoleBadge,
  LoadingSpinner,
  AlertBanner
} from '../components';
import { getApiUrl } from '../config/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const triageLoading = ref(null);

const statusOptions = computed(() => {
  const options = [
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'WAITING', label: 'Waiting' }
  ];
  if (incident.value?.status === 'RESOLVED') {
    options.push({ value: 'RESOLVED', label: 'Resolved' });
  } else {
    options.push({ value: 'RESOLVED', label: 'Resolved', disabled: true });
  }
  return options;
});

const technicianOptions = computed(() => {
  const options = [{ value: null, label: 'Unassigned' }];
  if (authStore.user) {
    options.push({
      value: authStore.user._id,
      label: `Assign to Me (${userRoleLabel.value})`,
      class: 'text-accentYellow font-bold'
    });
  }
  technicians.value
    .filter(u => u._id !== authStore.user?._id)
    .forEach(u => {
      options.push({
        value: u._id,
        label: `${u.name} (${u.role})`
      });
    });
  return options;
});

const incident = ref(null);
const auditLogs = ref([]);
const loading = ref(true);
const error = ref(null);
const showResolveModal = ref(false);
const showDeleteModal = ref(false);
const showRejectModal = ref(false);
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

const isAuditTimelineOpen = ref(false);

const isAssignee = computed(() => {
  return incident.value?.assignedTo?._id === authStore.user?._id;
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

const acceptTriage = async () => {
  triageLoading.value = 'accept';
  try {
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: 'OPEN' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to accept ticket');
    incident.value = data;
    selectedStatus.value = data.status;
  } catch (err) {
    alert(err.message);
  } finally {
    triageLoading.value = null;
  }
};

const rejectTriage = () => {
  showRejectModal.value = true;
};

const executeRejectTriage = async () => {
  triageLoading.value = 'reject';
  try {
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: 'REJECTED' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to reject ticket');
    incident.value = data;
    selectedStatus.value = data.status;
    showRejectModal.value = false;
  } catch (err) {
    alert(err.message);
  } finally {
    triageLoading.value = null;
  }
};

const handleIncidentResolved = (resolvedData) => {
  incident.value = resolvedData;
  selectedStatus.value = resolvedData.status;
  showResolveModal.value = false;
};

const toggleAuditTimeline = () => {
  isAuditTimelineOpen.value = !isAuditTimelineOpen.value;
  if (isAuditTimelineOpen.value) {
    fetchAuditLogs();
  }
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

const formatCategory = (cat) => {
  if (!cat) return 'OTHER';
  return cat.replace('_', ' ');
};

let pollInterval = null;

onMounted(() => {
  console.log('onMounted IncidentDetailView. User Role:', authStore.user?.role, 'isAdmin:', authStore.isAdmin, 'isFTA:', authStore.isFTA);
  fetchDetails();
  if (isAuditTimelineOpen.value) {
    fetchAuditLogs();
  }
  if (authStore.isAdmin || authStore.isFTA) {
    fetchTechnicians();
  }
  
  // Real-time updates (Epic 14) refetches details/logs silently every 3000ms
  pollInterval = setInterval(() => {
    fetchDetails(true);
    if (isAuditTimelineOpen.value) {
      fetchAuditLogs();
    }
  }, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
