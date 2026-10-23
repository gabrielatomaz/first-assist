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
          class="flex-1 sm:w-36 justify-center"
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
          class="flex-1 sm:w-36 justify-center"
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
          Event: <span class="font-bold text-gray-200 uppercase">{{ incident.eventCode || 'N/A' }}</span> | 
          <span v-if="incident.matchNumber && !['pit', 'pit prep', 'pit area', 'n/a'].includes(String(incident.matchNumber).toLowerCase())">
            Match: <span class="font-bold text-gray-200">{{ incident.matchNumber }}</span>
          </span>
          <span v-else class="text-teal-400 font-bold">
            <font-awesome-icon icon="wrench" class="text-xs mr-0.5" /> Pit Area
          </span>
          | Reported: <span class="text-gray-400">{{ formatTime(incident.createdAt) }}</span>
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
        <!-- 1a. Technician selection dropdown for FTA / Admin -->
        <div v-if="authStore.isAdmin || authStore.isFTA" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-1.5 w-full sm:w-auto flex-shrink-0">
          <label class="text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">Technician:</label>
          <CustomSelect
            v-model="selectedAssignee"
            :options="technicianOptions"
            @change="assignTechnician"
            class="w-full sm:w-44 text-xs font-semibold"
          />
        </div>



        <!-- 2. Status update select dropdown -->
        <div v-if="authStore.isAdmin || authStore.isFTA || isAssignee" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-1.5 w-full sm:w-auto flex-shrink-0">
          <label class="text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">Status:</label>
          <CustomSelect
            v-model="selectedStatus"
            :options="statusOptions"
            @change="updateStatus"
            class="w-full sm:w-36 text-xs font-semibold"
          />
        </div>

        <!-- 3 & 4. Action buttons group (Side by Side full width on mobile, matching dropdown height) -->
        <div v-if="canDelete || (incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING')" class="flex items-center gap-2 w-full sm:w-auto">
          <BaseButton
            v-if="incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS' || incident.status === 'WAITING'"
            @click="showResolveModal = true"
            variant="success"
            size="md"
            icon="check"
            title="Resolve Incident"
            class="flex-1 sm:flex-initial sm:w-9 !h-9 sm:p-0 justify-center"
          />

          <BaseButton
            v-if="canDelete"
            @click="showDeleteModal = true"
            variant="danger"
            size="md"
            icon="trash-can"
            title="Delete Incident"
            class="flex-1 sm:flex-initial sm:w-9 !h-9 sm:p-0 justify-center"
          />
        </div>
      </div>
    </div>

    <!-- Detail Box -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <!-- Mobile Technical Assignee Header Card (Visible on mobile only, above Issue Description) -->
      <BaseCard class="block md:hidden space-y-3">
        <div class="flex items-center justify-between border-b border-gray-800 pb-2 min-h-[32px]">
          <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Technical Assignee</h3>
          <RoleBadge v-if="incident.assignedTo" :role="incident.assignedTo?.role" />
        </div>

        <div v-if="incident.assignedTo" class="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div class="flex items-center space-x-3 min-w-0">
            <UserAvatar :icon="incident.assignedTo?.avatarIcon" :color="incident.assignedTo?.avatarColor" size="md" :has-bg="true" />
            <p class="text-sm font-bold text-white leading-tight break-words" :title="incident.assignedTo?.name">{{ incident.assignedTo?.name }}</p>
          </div>
          <BaseButton
            v-if="!authStore.isAdmin && !authStore.isFTA && isAssignee"
            variant="secondary"
            size="sm"
            icon="user-minus"
            @click="unassignMe"
            title="Withdraw assignment"
            class="font-bold whitespace-nowrap text-accentCoral hover:text-red-300 w-full justify-center"
          >
            Withdraw
          </BaseButton>
        </div>

        <div v-else class="pt-1">
          <p v-if="authStore.isAdmin || authStore.isFTA" class="text-xs text-gray-400 font-medium italic">Unassigned</p>
          <BaseButton
            v-if="!authStore.isAdmin && !authStore.isFTA && authStore.user"
            variant="primary"
            size="md"
            icon="user-check"
            @click="assignToMe"
            class="w-full justify-center font-bold"
          >
            Assign to Me
          </BaseButton>
        </div>
      </BaseCard>

      <div class="md:col-span-2 space-y-6">
        <!-- Description -->
        <BaseCard class="space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-2 min-h-[32px]">
            <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Issue Description</h3>
          </div>
          <p class="text-sm text-gray-200 mt-2 whitespace-pre-wrap leading-relaxed">{{ incident.description }}</p>
        </BaseCard>

        <!-- Mobile Resolution Details Card (Visible on mobile only, above AI Assistant Diagnosis) -->
        <BaseCard v-if="incident.status === 'RESOLVED' || incident.status === 'CLOSED'" class="block md:hidden space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-2 min-h-[32px]">
            <div class="flex items-center space-x-2">
              <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
              <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Resolution Details</h3>
            </div>
            <StatusBadge :status="incident.status" />
          </div>
          <div class="space-y-3">
            <!-- Root Cause Block (KB Color Matched) -->
            <div class="p-3.5 bg-teal-500/10 rounded-xl border border-teal-500/25 space-y-1.5">
              <div class="flex items-center space-x-1.5 text-teal-300 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="lightbulb" class="text-teal-300 text-xs" />
                <span>Root Cause</span>
              </div>
              <p class="text-xs text-teal-100 leading-relaxed font-medium whitespace-pre-wrap">{{ incident.rootCause || 'None provided' }}</p>
            </div>

            <!-- Applied Fix Block (KB Color Matched) -->
            <div class="p-3.5 bg-accentGreen/10 rounded-xl border border-accentGreen/30 space-y-1.5">
              <div class="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
                <span>Applied Fix</span>
              </div>
              <p class="text-xs text-emerald-200 leading-relaxed font-semibold whitespace-pre-wrap">{{ incident.appliedSolution || 'None provided' }}</p>
            </div>
          </div>
        </BaseCard>

        <!-- AI Assistant Suggestions -->
        <AISuggestionPanel :incident-id="incident._id" />

        <!-- Comments & coordination thread -->
        <BaseCard>
          <CommentSection :incident-id="incident._id" />
        </BaseCard>
      </div>

      <!-- Desktop Sidebar Column -->
      <div class="space-y-6">
        <!-- Desktop Assignee Card info -->
        <BaseCard class="hidden md:block space-y-3">
          <div class="flex items-center justify-between border-b border-gray-800 pb-2 min-h-[32px]">
            <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Technical Assignee</h3>
            <RoleBadge v-if="incident.assignedTo" :role="incident.assignedTo?.role" />
          </div>

          <div v-if="incident.assignedTo" class="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div class="flex items-center space-x-3 min-w-0">
              <UserAvatar :icon="incident.assignedTo?.avatarIcon" :color="incident.assignedTo?.avatarColor" size="md" :has-bg="true" />
              <p class="text-sm font-bold text-white leading-tight break-words" :title="incident.assignedTo?.name">{{ incident.assignedTo?.name }}</p>
            </div>
            <BaseButton
              v-if="!authStore.isAdmin && !authStore.isFTA && isAssignee"
              variant="secondary"
              size="sm"
              icon="user-minus"
              @click="unassignMe"
              title="Withdraw assignment"
              class="font-bold whitespace-nowrap text-accentCoral hover:text-red-300 w-full justify-center"
            >
              Withdraw
            </BaseButton>
          </div>

          <div v-else class="pt-1">
            <p v-if="authStore.isAdmin || authStore.isFTA" class="text-xs text-gray-400 font-medium italic">Unassigned</p>
            <BaseButton
              v-if="!authStore.isAdmin && !authStore.isFTA && authStore.user"
              variant="primary"
              size="md"
              icon="user-check"
              @click="assignToMe"
              class="w-full justify-center font-bold"
            >
              Assign to Me
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Desktop Resolution Details Card (Visible on desktop only) -->
        <BaseCard v-if="incident.status === 'RESOLVED' || incident.status === 'CLOSED'" class="hidden md:block space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-2 min-h-[32px]">
            <div class="flex items-center space-x-2">
              <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
              <h3 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Resolution Details</h3>
            </div>
            <StatusBadge :status="incident.status" />
          </div>
          <div class="space-y-3">
            <!-- Root Cause Block (KB Color Matched) -->
            <div class="p-3.5 bg-teal-500/10 rounded-xl border border-teal-500/25 space-y-1.5">
              <div class="flex items-center space-x-1.5 text-teal-300 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="lightbulb" class="text-teal-300 text-xs" />
                <span>Root Cause</span>
              </div>
              <p class="text-xs text-teal-100 leading-relaxed font-medium whitespace-pre-wrap">{{ incident.rootCause || 'None provided' }}</p>
            </div>

            <!-- Applied Fix Block (KB Color Matched) -->
            <div class="p-3.5 bg-accentGreen/10 rounded-xl border border-accentGreen/30 space-y-1.5">
              <div class="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
                <span>Applied Fix</span>
              </div>
              <p class="text-xs text-emerald-200 leading-relaxed font-semibold whitespace-pre-wrap">{{ incident.appliedSolution || 'None provided' }}</p>
            </div>
          </div>
        </BaseCard>

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
                v-for="log in sortedAuditLogs" 
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
  BaseCard,
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

  // CSAs can ONLY assign incidents to themselves or view current assignee
  if (!authStore.isAdmin && !authStore.isFTA) {
    if (authStore.user) {
      options.push({
        value: authStore.user._id,
        label: `Assign to Me (${userRoleLabel.value})`,
        class: 'text-accentYellow font-bold'
      });
    }
    if (incident.value?.assignedTo && String(incident.value.assignedTo._id) !== String(authStore.user?._id)) {
      options.unshift({
        value: incident.value.assignedTo._id,
        label: `${incident.value.assignedTo.name} (${incident.value.assignedTo.role || 'Tech'})`,
        disabled: true
      });
    }
    return options;
  }

  // FTAs and ADMINs can assign any active technician/CSA assigned to this event
  if (authStore.user) {
    options.push({
      value: authStore.user._id,
      label: `Assign to Me (${userRoleLabel.value})`,
      class: 'text-accentYellow font-bold'
    });
  }

  technicians.value
    .filter(u => String(u._id) !== String(authStore.user?._id))
    .forEach(u => {
      options.push({
        value: u._id,
        label: `${u.name} (${u.role})`
      });
    });

  if (incident.value?.assignedTo && !options.some(o => String(o.value) === String(incident.value.assignedTo._id))) {
    options.push({
      value: incident.value.assignedTo._id,
      label: `${incident.value.assignedTo.name} (${incident.value.assignedTo.role || 'Tech'})`
    });
  }

  return options;
});

const incident = ref(null);
const auditLogs = ref([]);
const sortedAuditLogs = computed(() => {
  return [...auditLogs.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});
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

    // Refresh technicians list scoped to this event for FTA/Admin
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
  try {
    const response = await fetch(getApiUrl('/users'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      const allUsersData = await response.json();
      const allUsers = Array.isArray(allUsersData) ? allUsersData : (allUsersData.users || []);
      const eventCode = incident.value?.eventCode;
      
      technicians.value = allUsers.filter(u => {
        const role = (u.role || '').toUpperCase();
        const status = (u.status || 'ACTIVE').toUpperCase();
        
        // Exclude inactive user accounts
        if (status === 'INACTIVE') return false;

        // FTAs can ONLY assign CSAs for that event
        if (authStore.isFTA && !authStore.isAdmin) {
          if (role !== 'CSA') return false;
        } else if (authStore.isAdmin) {
          // Admins can assign any FTA, CSA, or Admin
          if (role !== 'CSA' && role !== 'FTA' && role !== 'ADMIN') return false;
        }

        // Admins are always available for assignment
        if (role === 'ADMIN') return true;

        // If incident event code is missing, allow
        if (!eventCode) return true;

        const cleanEventCode = eventCode.trim().toUpperCase();
        const userEventCode = (u.assignedEventCode || '').trim().toUpperCase();
        const userEventCodes = Array.isArray(u.assignedEventCodes)
          ? u.assignedEventCodes.map(c => (c || '').trim().toUpperCase())
          : [];

        const isAssignedToEvent =
          userEventCode === cleanEventCode ||
          userEventCodes.includes(cleanEventCode);

        return isAssignedToEvent;
      });
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
    if (!response.ok) throw new Error(data.error || 'Failed to reassign technician');
    incident.value = data;
    selectedStatus.value = data.status;
  } catch (err) {
    alert(err.message);
    selectedAssignee.value = incident.value.assignedTo?._id || null;
  }
};

const assignToMe = async () => {
  try {
    const currentUserId = authStore.user?._id || authStore.user?.id;
    if (!currentUserId) throw new Error('User information not found');
    const nextStatus = (incident.value.status === 'OPEN' || incident.value.status === 'PENDING_SCREENING') ? 'ASSIGNED' : incident.value.status;
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: nextStatus, assignedTo: currentUserId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to claim incident');
    incident.value = data;
    selectedStatus.value = data.status;
    selectedAssignee.value = data.assignedTo?._id || null;
  } catch (err) {
    alert(err.message);
  }
};

const unassignMe = async () => {
  try {
    const nextStatus = incident.value.status === 'ASSIGNED' ? 'OPEN' : incident.value.status;
    const response = await fetch(getApiUrl(`/incidents/${incident.value._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: nextStatus, assignedTo: null })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to unassign incident');
    incident.value = data;
    selectedStatus.value = data.status;
    selectedAssignee.value = null;
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
    if (!response.ok) throw new Error(data.error || 'Failed to change ticket status');
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
