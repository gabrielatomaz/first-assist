<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
    <div class="bg-bgCard border border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative my-auto overflow-hidden">
      <!-- Styled Cancellation Confirmation Modal Overlay -->
      <ConfirmationModal
        :model-value="!!incidentToCancel"
        @update:model-value="(val) => { if (!val) incidentToCancel = null; }"
        title="Cancel Technical Incident?"
        message="Are you sure you want to cancel this technical incident ticket? Event technicians will be notified that assistance is no longer needed."
        icon="triangle-exclamation"
        variant="danger"
        confirm-text="Yes, Cancel"
        confirm-icon="xmark"
        cancel-text="Keep Ticket"
        :loading="cancelingId === incidentToCancel"
        loading-text="Canceling..."
        @confirm="executeCancelIncident"
        @cancel="incidentToCancel = null"
      />

      <BaseButton 
        @click="$emit('close')" 
        variant="ghost"
        size="icon-sm"
        icon="xmark"
        class="absolute top-3.5 right-3.5 z-10 text-gray-400 hover:text-white"
        title="Close modal"
      />

      <!-- Header -->
      <div class="border-b border-gray-800 pb-3 pr-8">
        <h3 class="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
          <font-awesome-icon icon="clipboard-list" class="text-teal-400 text-base" />
          <span>Report Incident (Guest Mode)</span>
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">No login required. Tickets are submitted to the event triage queue.</p>
      </div>

      <!-- Navigation Tabs (Form vs My Cached Tickets) -->
      <BaseTabs v-model="viewMode" :tabs="modalTabs" />

      <!-- VIEW 1: Success Notification Screen -->
      <div v-if="viewMode === 'success' && successTicket" class="p-5 bg-bgMain/70 border border-emerald-500/30 rounded-2xl space-y-4 animate-fadeIn">
        <div class="flex flex-col items-center text-center space-y-1">
          <font-awesome-icon icon="circle-check" class="text-3xl text-emerald-400 mb-1" />
          <h4 class="text-base font-extrabold text-white">Incident Submitted Successfully!</h4>
          <p class="text-xs text-gray-300">
            Your ticket has been logged into the queue in <strong class="text-amber-400">In Triage</strong> status.
          </p>
        </div>

        <!-- Structured Ticket Summary (Team, Event, Match) -->
        <div class="bg-bgCard border border-gray-800 rounded-xl p-3.5 space-y-2.5 text-xs">
          <div class="grid grid-cols-3 gap-2 text-center border-b border-gray-800 pb-2.5">
            <div>
              <span class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Team</span>
              <span class="font-bold text-white text-sm font-mono">Team {{ successTicket.teamNumber }}</span>
            </div>
            <div>
              <span class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Event</span>
              <span class="font-bold text-teal-400 text-sm uppercase font-mono">
                {{ successTicket.eventCode || form.eventCode || 'N/A' }}
              </span>
            </div>
            <div>
              <span class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Match</span>
              <span class="font-bold text-accentYellow text-sm font-mono">
                {{ successTicket.matchNumber && successTicket.matchNumber !== 'N/A' ? successTicket.matchNumber : (form.matchNumber || 'Pit / Practice') }}
              </span>
            </div>
          </div>

          <div class="flex justify-between items-center text-xs pt-0.5">
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</span>
              <CategoryBadge :category="successTicket.category || form.category" size="xs" />
            </div>
            <StatusBadge :status="successTicket.status || 'IN_TRIAGE'" size="xs" />
          </div>
        </div>

        <p class="text-xs text-gray-400 text-center leading-relaxed">
          Saved to your browser's local cache. Event staff (CSA/FTA) will review and accept your ticket shortly.
        </p>

        <!-- Success Actions -->
        <div class="pt-2">
          <BaseButton 
            type="button"
            @click="resetForm" 
            variant="primary"
            size="md"
            icon="plus"
            class="w-full"
          >
            Report Another
          </BaseButton>
        </div>
      </div>

      <!-- VIEW 2: My Cached Incidents History Screen -->
      <div v-else-if="viewMode === 'history'" class="space-y-4 animate-fadeIn">
        <div class="flex justify-between items-center border-b border-gray-800 pb-2.5 min-h-[32px]">
          <div class="flex items-center space-x-2">
            <h4 class="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Cached Incidents on this Browser
            </h4>
            <span class="px-2 py-0.5 text-[10px] font-extrabold bg-bgMain text-gray-300 rounded-full font-mono border border-gray-800">
              {{ cachedIncidents.length }}
            </span>
          </div>
          <BaseButton 
            variant="ghost" 
            size="icon-sm" 
            icon="arrows-rotate" 
            :loading="refreshingStatus"
            @click="refreshCachedStatus" 
            title="Refresh Status"
          />
        </div>

        <!-- Empty State when 0 cached tickets -->
        <div v-if="cachedIncidents.length === 0" class="py-8 px-4 bg-bgMain/40 border border-gray-800 rounded-2xl text-center space-y-3">
          <div class="w-12 h-12 bg-gray-800/80 text-gray-400 border border-gray-800 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
            <font-awesome-icon icon="inbox" />
          </div>
          <div class="space-y-1">
            <h5 class="text-sm font-bold text-gray-200">No Cached Incidents</h5>
            <p class="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              No submitted incident tickets are currently stored on this browser.
            </p>
          </div>
          <div class="pt-1">
            <BaseButton 
              type="button" 
              @click="viewMode = 'form'" 
              variant="primary"
              size="sm"
              icon="plus"
            >
              Submit an Incident
            </BaseButton>
          </div>
        </div>

        <!-- Cached tickets list -->
        <div v-else class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          <div 
            v-for="inc in cachedIncidents" 
            :key="inc._id" 
            class="p-3 bg-bgMain rounded-xl border border-gray-800 hover:border-gray-700 transition space-y-2.5"
          >
            <div class="flex justify-between items-start gap-2">
              <div>
                <span class="font-extrabold text-white text-xs font-mono">Team {{ inc.teamNumber }}</span>
                <span class="text-gray-400 text-[11px] ml-1.5 font-mono uppercase font-semibold">
                  {{ inc.eventCode }} • {{ inc.matchNumber && inc.matchNumber !== 'N/A' ? inc.matchNumber : 'Pit / Practice' }}
                </span>
              </div>
              <StatusBadge :status="inc.status" size="xs" />
            </div>

            <p class="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{{ inc.description || 'No description provided' }}</p>

            <div class="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800">
              <div class="flex items-center space-x-2">
                <CategoryBadge :category="inc.category" size="xs" />
                <span class="text-gray-400">{{ formatTime(inc.createdAt) }}</span>
              </div>
              <button 
                v-if="canCancelIncident(inc.status)"
                type="button" 
                @click="incidentToCancel = inc._id" 
                :disabled="cancelingId === inc._id"
                class="text-xs font-semibold text-accentCoral hover:text-red-300 hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1"
                title="Cancel ticket"
              >
                <font-awesome-icon v-if="cancelingId === inc._id" icon="spinner" spin class="text-[10px]" />
                <font-awesome-icon v-else icon="xmark" class="text-[10px]" />
                <span>Cancel Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 3: Incident Report Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-3.5 animate-fadeIn">
        <!-- Team Number & TBA Search Button -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Team Number <span class="text-accentCoral ml-0.5">*</span></label>
          <div class="flex space-x-2">
            <BaseInput 
              v-model.number="form.teamNumber" 
              @input="handleTeamNumberChange"
              @keydown.enter.prevent="searchTeamOnTBA"
              type="number" 
              min="1"
              required 
              placeholder="e.g. 1156"
              input-class="font-mono"
              class="flex-1"
            />
            <BaseButton 
              type="button" 
              @click="searchTeamOnTBA"
              :disabled="!form.teamNumber || loadingEvents"
              :loading="loadingEvents"
              variant="primary"
              size="icon-md"
              icon="magnifying-glass"
              title="Search on TBA"
            />
          </div>

          <!-- Team Found Badge -->
          <div v-if="searchCompleted && teamFound && teamDetails" class="mt-2 flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-xl animate-fadeIn">
            <font-awesome-icon icon="circle-check" class="text-xs flex-shrink-0 text-emerald-400" />
            <span class="font-medium truncate text-xs">
              <strong class="text-white font-mono">Team {{ teamDetails.number }}</strong> — {{ teamDetails.name }}
              <span v-if="teamDetails.city || teamDetails.state" class="text-gray-400 text-[11px]">
                ({{ [teamDetails.city, teamDetails.state].filter(Boolean).join(', ') }})
              </span>
            </span>
          </div>

          <!-- Team Not Found Warning -->
          <div v-if="searchCompleted && !teamFound" class="mt-2 bg-red-950/40 border border-red-900/40 p-2.5 rounded-xl text-accentCoral text-xs font-medium flex items-center space-x-2 animate-fadeIn">
            <font-awesome-icon icon="triangle-exclamation" class="text-xs flex-shrink-0" />
            <span>Team {{ searchedTeamNumber }} was not found on The Blue Alliance.</span>
          </div>
        </div>

        <!-- Event Selection (only after TBA search completes and team is found) -->
        <div v-if="searchCompleted && teamFound" class="animate-fadeIn space-y-1.5">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Select Event ({{ currentYear }}) <span class="text-accentCoral ml-0.5">*</span>
          </label>
          <div v-if="teamEvents.length > 0">
            <CustomSelect 
              v-model="form.eventCode"
              :options="teamEventOptions"
              @change="handleEventChange"
              :disabled="loadingEvents"
            />
          </div>
          <div v-else class="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl text-amber-300 text-xs font-medium flex items-center space-x-2">
            <font-awesome-icon icon="triangle-exclamation" class="text-xs flex-shrink-0" />
            <span>Team {{ searchedTeamNumber }} is not listed for any competition events in {{ currentYear }}.</span>
          </div>
        </div>

        <!-- Match Selection -->
        <div v-if="searchCompleted && teamFound && form.eventCode" class="animate-fadeIn space-y-1.5">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider" title="Select match number">Match Number</label>
          <CustomSelect 
            v-model="form.matchNumber" 
            :options="matchOptions"
            :disabled="loadingMatches"
          />
        </div>

        <!-- Category & Priority -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</label>
            <CustomSelect 
              v-model="form.category" 
              :options="categoryOptions"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Priority</label>
            <CustomSelect 
              v-model="form.priority" 
              :options="priorityOptions"
            />
          </div>
        </div>

        <!-- Issue Description -->
        <BaseTextarea 
          v-model="form.description" 
          label="Issue Description"
          required 
          rows="3" 
          placeholder="Describe the issue observed during match or pit prep..."
        />

        <div v-if="error" class="bg-red-950/40 text-accentCoral p-3 rounded-xl text-xs font-medium border border-red-900/30">
          {{ error }}
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-2 pt-2 border-t border-gray-800">
          <BaseButton 
            type="button" 
            variant="secondary"
            size="md"
            @click="$emit('close')" 
          >
            Cancel
          </BaseButton>
          <BaseButton 
            v-if="isFormValid"
            type="submit" 
            variant="primary"
            size="md"
            :disabled="submitting || !form.eventCode || teamEvents.length === 0" 
            :loading="submitting"
            loading-text="Submitting..."
            class="animate-fadeIn"
          >
            Submit
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getApiUrl } from '../config/api';
import ConfirmationModal from './ConfirmationModal.vue';
import BaseButton from './common/BaseButton.vue';
import BaseTextarea from './common/BaseTextarea.vue';
import BaseInput from './common/BaseInput.vue';
import BaseTabs from './common/BaseTabs.vue';
import CustomSelect from './CustomSelect.vue';
import StatusBadge from './common/StatusBadge.vue';
import CategoryBadge from './common/CategoryBadge.vue';

const emit = defineEmits(['close']);

const currentYear = new Date().getFullYear();

const viewMode = ref('form'); // 'form' | 'success' | 'history'

const categoryOptions = [
  { value: 'RADIO_COMMS', label: 'Radio & Wireless Comms' },
  { value: 'ROBOTIC_POWER', label: 'Robot Power Path & Battery' },
  { value: 'CAN_BUS', label: 'CAN Bus Connection' },
  { value: 'MOTOR_CONTROLLER', label: 'Motor Controllers & Sensors' },
  { value: 'PNEUMATICS', label: 'Pneumatics & Air System' },
  { value: 'VISION_COPROCESSOR', label: 'Vision & Coprocessors' },
  { value: 'DRIVER_STATION', label: 'Driver Station & Controls' },
  { value: 'CODE_EXCEPTION', label: 'Robot User Code' },
  { value: 'MECHANICAL', label: 'Mechanical & Hardware' },
  { value: 'FIELD_NETWORK', label: 'Field & FMS Network' },
  { value: 'OTHER', label: 'Other Issues' }
];

const priorityOptions = [
  { value: 'LOW', label: 'LOW' },
  { value: 'MEDIUM', label: 'MEDIUM' },
  { value: 'HIGH', label: 'HIGH' },
  { value: 'CRITICAL', label: 'CRITICAL' }
];

const form = ref({
  teamNumber: '',
  eventCode: '',
  matchNumber: '',
  category: 'RADIO_COMMS',
  priority: 'MEDIUM',
  description: ''
});

const searchedTeamNumber = ref(null);
const teamFound = ref(false);
const teamDetails = ref(null);
const teamEvents = ref([]);
const eventMatches = ref([]);
const loadingEvents = ref(false);
const loadingMatches = ref(false);
const submitting = ref(false);
const error = ref(null);
const successTicket = ref(null);
const searchCompleted = ref(false);

const isFormValid = computed(() => {
  return Boolean(
    form.value.teamNumber &&
    Number(form.value.teamNumber) > 0 &&
    form.value.eventCode &&
    form.value.description &&
    form.value.description.trim().length > 0
  );
});

const cachedIncidents = ref([]);
const refreshingStatus = ref(false);

const modalTabs = computed(() => [
  { id: 'form', label: 'New Incident', icon: 'plus' },
  {
    id: 'history',
    label: 'My Submitted Tickets',
    icon: 'clock-rotate-left',
    count: cachedIncidents.value.length || undefined
  }
]);

const teamEventOptions = computed(() => [
  { value: '', label: '-- Select Competition Event --' },
  ...teamEvents.value.map(ev => ({
    value: ev.code,
    label: `${ev.name} (${ev.code.toUpperCase()})${ev.location ? ` - ${ev.location}` : ''}`
  }))
]);

const matchOptions = computed(() => [
  { value: '', label: 'Select match number' },
  ...eventMatches.value.map(m => ({
    value: m.key,
    label: m.label
  }))
]);

const loadCachedIncidents = () => {
  try {
    const raw = localStorage.getItem('my_submitted_incidents');
    cachedIncidents.value = raw ? JSON.parse(raw) : [];
  } catch {
    cachedIncidents.value = [];
  }
};

const handleTeamNumberChange = () => {
  if (searchedTeamNumber.value && form.value.teamNumber !== searchedTeamNumber.value) {
    searchCompleted.value = false;
    teamFound.value = false;
    teamDetails.value = null;
    teamEvents.value = [];
    eventMatches.value = [];
    form.value.eventCode = '';
    form.value.matchNumber = '';
  }
};

const searchTeamOnTBA = async () => {
  if (!form.value.teamNumber || form.value.teamNumber <= 0) return;

  const num = form.value.teamNumber;
  searchedTeamNumber.value = num;
  loadingEvents.value = true;
  searchCompleted.value = false;
  teamFound.value = false;
  teamDetails.value = null;
  teamEvents.value = [];
  eventMatches.value = [];
  form.value.eventCode = '';
  form.value.matchNumber = '';
  error.value = null;

  try {
    const response = await fetch(getApiUrl(`/incidents/public/team-events?teamNumber=${num}&year=${currentYear}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        teamEvents.value = data;
        teamFound.value = data.length > 0;
        teamDetails.value = teamFound.value ? { number: num, name: `Team ${num}` } : null;
      } else {
        teamFound.value = Boolean(data.found);
        teamDetails.value = data.team || (data.found ? { number: num, name: `Team ${num}` } : null);
        teamEvents.value = data.events || [];
      }

      if (teamEvents.value.length > 0) {
        form.value.eventCode = teamEvents.value[0].code;
        fetchMatchesForTeam(num, form.value.eventCode);
      }
    } else {
      teamFound.value = false;
    }
  } catch (err) {
    console.warn('Error looking up team events on TBA:', err.message);
    teamFound.value = false;
  } finally {
    loadingEvents.value = false;
    searchCompleted.value = true;
  }
};

const handleEventChange = () => {
  form.value.matchNumber = '';
  if (form.value.teamNumber && form.value.eventCode) {
    fetchMatchesForTeam(form.value.teamNumber, form.value.eventCode);
  }
};

const fetchMatchesForTeam = async (num, eventCode) => {
  loadingMatches.value = true;
  try {
    const response = await fetch(getApiUrl(`/incidents/public/team-matches?teamNumber=${num}&eventCode=${eventCode}`));
    if (response.ok) {
      const data = await response.json();
      eventMatches.value = data || [];
    }
  } catch (err) {
    console.warn('Error looking up team matches:', err.message);
  } finally {
    loadingMatches.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;
  try {
    const response = await fetch(getApiUrl('/incidents/public'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to submit request');

    const createdIncident = data.incident || data;
    if (createdIncident && createdIncident._id) {
      try {
        const existingMyIncidents = JSON.parse(localStorage.getItem('my_submitted_incidents') || '[]');
        const updatedCache = [
          {
            _id: createdIncident._id,
            teamNumber: createdIncident.teamNumber,
            matchNumber: createdIncident.matchNumber || form.value.matchNumber || 'Pit / Practice',
            category: createdIncident.category || form.value.category,
            priority: createdIncident.priority || form.value.priority,
            status: createdIncident.status || 'PENDING_SCREENING',
            eventCode: createdIncident.eventCode || form.value.eventCode,
            description: createdIncident.description || form.value.description,
            createdAt: createdIncident.createdAt || new Date().toISOString()
          },
          ...existingMyIncidents.filter(i => i._id !== createdIncident._id)
        ];
        localStorage.setItem('my_submitted_incidents', JSON.stringify(updatedCache));
        cachedIncidents.value = updatedCache;
      } catch (cacheErr) {
        console.warn('Could not cache public incident locally:', cacheErr.message);
      }
    }

    successTicket.value = createdIncident;
    viewMode.value = 'success';
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  form.value = {
    teamNumber: '',
    eventCode: '',
    matchNumber: '',
    category: 'RADIO_COMMS',
    priority: 'MEDIUM',
    description: ''
  };
  searchedTeamNumber.value = null;
  teamFound.value = false;
  teamDetails.value = null;
  teamEvents.value = [];
  eventMatches.value = [];
  searchCompleted.value = false;
  successTicket.value = null;
  error.value = null;
  viewMode.value = 'form';
};

const refreshCachedStatus = async () => {
  refreshingStatus.value = true;
  try {
    loadCachedIncidents();
    if (cachedIncidents.value.length > 0) {
      const ids = cachedIncidents.value.map(i => i._id).filter(Boolean);
      if (ids.length > 0) {
        const res = await fetch(getApiUrl('/incidents/public/status'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        });
        if (res.ok) {
          const updatedList = await res.json();
          if (Array.isArray(updatedList) && updatedList.length > 0) {
            const updateMap = new Map(updatedList.map(item => [String(item._id), item]));
            cachedIncidents.value = cachedIncidents.value.map(cached => {
              const fresh = updateMap.get(String(cached._id));
              return fresh ? { ...cached, ...fresh } : cached;
            });
            localStorage.setItem('my_submitted_incidents', JSON.stringify(cachedIncidents.value));
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to refresh cached ticket status from server:', err);
  } finally {
    setTimeout(() => {
      refreshingStatus.value = false;
    }, 450);
  }
};

const incidentToCancel = ref(null);
const cancelingId = ref(null);

const canCancelIncident = (status) => {
  const s = (status || '').toUpperCase();
  return s === 'PENDING_SCREENING' || s === 'IN_TRIAGE' || s === 'OPEN' || s === 'WAITING';
};

const executeCancelIncident = async () => {
  const incidentId = incidentToCancel.value;
  if (!incidentId) return;
  
  cancelingId.value = incidentId;
  try {
    const res = await fetch(getApiUrl(`/incidents/public/${incidentId}/cancel`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel incident');
    
    // Update cached incident in memory and local storage
    cachedIncidents.value = cachedIncidents.value.map(item => {
      if (String(item._id) === String(incidentId)) {
        return { ...item, status: 'CLOSED' };
      }
      return item;
    });
    localStorage.setItem('my_submitted_incidents', JSON.stringify(cachedIncidents.value));

    if (successTicket.value && String(successTicket.value._id) === String(incidentId)) {
      successTicket.value.status = 'CLOSED';
    }
    incidentToCancel.value = null;
  } catch (err) {
    alert(err.message || 'Failed to cancel ticket');
  } finally {
    cancelingId.value = null;
  }
};

const getStatusBadgeClass = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'RESOLVED' || s === 'CLOSED') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (s === 'IN_PROGRESS' || s === 'ASSIGNED') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  if (s === 'REJECTED') return 'bg-red-500/20 text-red-300 border-red-500/30';
  return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
};

const formatStatus = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'PENDING_SCREENING') return 'IN_TRIAGE';
  if (s === 'IN_PROGRESS') return 'IN_PROGRESS';
  return s || 'IN_TRIAGE';
};

const formatTime = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

onMounted(() => {
  loadCachedIncidents();
  refreshCachedStatus();
});
</script>
