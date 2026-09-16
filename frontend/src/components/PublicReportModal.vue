<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
    <div class="bg-bgCard border border-gray-700/80 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative my-auto">
      <!-- Header -->
      <div class="border-b border-gray-700/80 pb-3">
        <h3 class="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
          <font-awesome-icon icon="clipboard-list" class="text-primaryTeal text-base" />
          <span>Report Incident (Guest Mode)</span>
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">No login required. Tickets are submitted to the event triage queue.</p>
      </div>

      <!-- Navigation Tabs (Form vs My Cached Tickets) -->
      <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
        <button
          type="button"
          @click="viewMode = 'form'"
          :class="viewMode === 'form' ? 'bg-primaryTeal/20 text-primaryTeal border-primaryTeal/40 font-bold' : 'text-gray-400 hover:text-gray-200 border-transparent font-medium'"
          class="px-3 py-1.5 rounded-lg text-xs border transition cursor-pointer flex items-center space-x-1.5"
        >
          <font-awesome-icon icon="plus" class="text-xs" />
          <span>New Incident</span>
        </button>
        <button
          type="button"
          @click="viewMode = 'history'"
          :class="viewMode === 'history' ? 'bg-primaryTeal/20 text-primaryTeal border-primaryTeal/40 font-bold' : 'text-gray-400 hover:text-gray-200 border-transparent font-medium'"
          class="px-3 py-1.5 rounded-lg text-xs border transition cursor-pointer flex items-center space-x-1.5"
        >
          <font-awesome-icon icon="clock-rotate-left" class="text-xs" />
          <span>My Cached Tickets</span>
          <span v-if="cachedIncidents.length > 0" class="px-1.5 py-0.2 bg-primaryTeal text-slate-950 font-bold rounded-full text-[10px] ml-1 font-mono">
            {{ cachedIncidents.length }}
          </span>
        </button>
      </div>

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
        <div class="bg-bgCard border border-gray-700/80 rounded-xl p-3.5 space-y-2.5 text-xs">
          <div class="grid grid-cols-3 gap-2 text-center border-b border-gray-700/60 pb-2.5">
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team</span>
              <span class="font-bold text-white text-sm font-mono">Team {{ successTicket.teamNumber }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event</span>
              <span class="font-bold text-primaryTeal text-sm uppercase font-mono">
                {{ successTicket.eventCode || form.eventCode || 'N/A' }}
              </span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Match</span>
              <span class="font-bold text-accentYellow text-sm font-mono">
                {{ successTicket.matchNumber && successTicket.matchNumber !== 'N/A' ? successTicket.matchNumber : (form.matchNumber || 'Pit / Practice') }}
              </span>
            </div>
          </div>

          <div class="flex justify-between items-center text-[11px] pt-0.5">
            <span class="text-gray-400">Category: <strong class="text-gray-200">{{ successTicket.category || form.category }}</strong></span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              IN TRIAGE
            </span>
          </div>
        </div>

        <p class="text-[11px] text-gray-400 text-center leading-relaxed">
          Saved to your browser's local cache. Event staff (CSA/FTA) will review and accept your ticket shortly.
        </p>

        <!-- Success Actions -->
        <div class="flex flex-col sm:flex-row gap-2 pt-1">
          <button 
            type="button"
            @click="viewMode = 'history'" 
            class="flex-1 py-2.5 px-4 bg-primaryTeal hover:bg-primaryTeal/90 text-white font-bold rounded-xl transition text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
          >
            <font-awesome-icon icon="clock-rotate-left" class="text-xs" />
            <span>Check My Cached Incidents ({{ cachedIncidents.length }})</span>
          </button>
          <button 
            type="button"
            @click="resetForm" 
            class="py-2.5 px-4 bg-bgMain hover:bg-bgMain/80 text-gray-300 hover:text-white font-semibold rounded-xl border border-gray-700 transition text-xs cursor-pointer"
          >
            Report Another
          </button>
        </div>
      </div>

      <!-- VIEW 2: My Cached Incidents History Screen -->
      <div v-else-if="viewMode === 'history'" class="space-y-3 animate-fadeIn">
        <div class="flex justify-between items-center">
          <h4 class="text-xs font-bold text-primaryTeal uppercase tracking-wider">
            Cached Incidents on this Browser ({{ cachedIncidents.length }})
          </h4>
          <button 
            v-if="cachedIncidents.length > 0"
            type="button" 
            @click="refreshCachedStatus" 
            :disabled="refreshingStatus"
            class="text-[11px] text-primaryTeal hover:underline flex items-center space-x-1 cursor-pointer disabled:opacity-50"
          >
            <font-awesome-icon icon="arrows-rotate" :spin="refreshingStatus" class="text-[10px]" />
            <span>Refresh Status</span>
          </button>
        </div>

        <div v-if="cachedIncidents.length === 0" class="p-6 bg-bgMain/40 border border-gray-800 rounded-xl text-center space-y-2">
          <font-awesome-icon icon="inbox" class="text-2xl text-gray-600" />
          <p class="text-xs text-gray-400 font-medium">No cached incidents found on this device.</p>
          <button 
            type="button"
            @click="viewMode = 'form'" 
            class="mt-2 px-3 py-1.5 bg-primaryTeal text-white font-bold rounded-lg text-xs hover:bg-primaryTeal/90 transition cursor-pointer"
          >
            Submit an Incident
          </button>
        </div>

        <div v-else class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          <div 
            v-for="inc in cachedIncidents" 
            :key="inc._id" 
            class="p-3 bg-bgMain rounded-xl border border-gray-700/70 hover:border-gray-600 transition space-y-2"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="font-extrabold text-white text-xs font-mono">Team {{ inc.teamNumber }}</span>
                <span class="text-gray-400 text-[11px] ml-1.5 font-mono uppercase font-semibold">
                  {{ inc.eventCode }} • {{ inc.matchNumber && inc.matchNumber !== 'N/A' ? inc.matchNumber : 'Pit / Practice' }}
                </span>
              </div>
              <span 
                :class="getStatusBadgeClass(inc.status)"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono uppercase"
              >
                {{ formatStatus(inc.status) }}
              </span>
            </div>

            <p class="text-[11px] text-gray-300 line-clamp-2">{{ inc.description || 'No description provided' }}</p>

            <div class="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-gray-800">
              <span>Category: <strong class="text-gray-400">{{ inc.category }}</strong></span>
              <span>{{ formatTime(inc.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 3: Incident Report Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-3.5 animate-fadeIn">
        <!-- Team Number & TBA Search Button -->
        <div>
          <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider mb-1.5">Team Number *</label>
          <div class="flex space-x-2">
            <div class="relative flex-1">
              <input 
                v-model.number="form.teamNumber" 
                @input="handleTeamNumberChange"
                @keydown.enter.prevent="searchTeamOnTBA"
                type="number" 
                min="1"
                required 
                placeholder="e.g. 1156"
                class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition"
              >
            </div>
            <button 
              type="button" 
              @click="searchTeamOnTBA"
              :disabled="!form.teamNumber || loadingEvents"
              class="w-10 h-[38px] flex items-center justify-center bg-primaryTeal/20 hover:bg-primaryTeal/30 text-primaryTeal font-bold border border-primaryTeal/40 rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-sm"
              title="Search on TBA"
            >
              <font-awesome-icon v-if="loadingEvents" icon="spinner" spin class="text-sm" />
              <font-awesome-icon v-else icon="magnifying-glass" class="text-sm" />
            </button>
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
        <div v-if="searchCompleted && teamFound" class="animate-fadeIn">
          <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider mb-1.5">
            Select Event ({{ currentYear }}) *
          </label>
          <div v-if="teamEvents.length > 0" class="relative">
            <select 
              v-model="form.eventCode"
              @change="handleEventChange"
              required
              :disabled="loadingEvents"
              class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition cursor-pointer"
            >
              <option value="" disabled>-- Select Competition Event --</option>
              <option v-for="ev in teamEvents" :key="ev.code" :value="ev.code">
                {{ ev.name }} ({{ ev.code.toUpperCase() }}) {{ ev.location ? `- ${ev.location}` : '' }}
              </option>
            </select>
          </div>
          <div v-else class="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl text-amber-300 text-xs font-medium flex items-center space-x-2">
            <font-awesome-icon icon="triangle-exclamation" class="text-xs flex-shrink-0" />
            <span>Team {{ searchedTeamNumber }} is not listed for any competition events in {{ currentYear }}.</span>
          </div>
        </div>

        <!-- Match Selection -->
        <div v-if="searchCompleted && teamFound && form.eventCode" class="animate-fadeIn">
          <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider mb-1.5" title="Select match number">Match Number</label>
          <div class="relative">
            <select 
              v-model="form.matchNumber" 
              :disabled="loadingMatches"
              title="Select match number"
              class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition cursor-pointer"
            >
              <option value="">Select match number</option>
              <option v-for="m in eventMatches" :key="m.key" :value="m.key">
                {{ m.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Category & Priority -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider mb-1.5">Category</label>
            <select 
              v-model="form.category" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition cursor-pointer"
            >
              <option value="RADIO_COMMS">RADIO COMMS</option>
              <option value="ROBOTIC_POWER">ROBOTIC POWER</option>
              <option value="CAN_BUS">CAN BUS</option>
              <option value="MECHANICAL">MECHANICAL</option>
              <option value="CODE_EXCEPTION">CODE EXCEPTION</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider mb-1.5">Priority</label>
            <select 
              v-model="form.priority" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition cursor-pointer"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <!-- Issue Description -->
        <div>
          <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider mb-1.5">Issue Description *</label>
          <textarea 
            v-model="form.description" 
            required 
            rows="3" 
            placeholder="Describe the issue observed during match or pit prep..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-gray-700 bg-bgMain text-textMain text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primaryTeal/30 focus:border-primaryTeal transition resize-none"
          ></textarea>
        </div>

        <div v-if="error" class="bg-red-950/40 text-accentCoral p-3 rounded-xl text-xs font-medium border border-red-900/30">
          {{ error }}
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-2 pt-2 border-t border-gray-700/60">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-bgMain text-gray-300 hover:text-white border border-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="submitting || !form.eventCode || teamEvents.length === 0" 
            class="px-6 py-2.5 rounded-xl text-xs font-bold bg-primaryTeal hover:bg-primaryTeal/90 text-white shadow-md transition disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
          >
            <font-awesome-icon v-if="submitting" icon="spinner" spin class="text-xs" />
            <span>{{ submitting ? 'Submitting...' : 'Submit' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getApiUrl } from '../config/api';

const emit = defineEmits(['close']);

const currentYear = new Date().getFullYear();

const viewMode = ref('form'); // 'form' | 'success' | 'history'

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

const cachedIncidents = ref([]);
const refreshingStatus = ref(false);

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
  if (cachedIncidents.value.length === 0) return;
  refreshingStatus.value = true;
  try {
    loadCachedIncidents();
  } finally {
    refreshingStatus.value = false;
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
  if (s === 'PENDING_SCREENING') return 'In Triage';
  if (s === 'IN_PROGRESS') return 'In Progress';
  return s || 'In Triage';
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
});
</script>
