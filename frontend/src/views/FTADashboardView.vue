<template>
  <div class="max-w-5xl mx-auto space-y-8 mt-8 animate-fadeIn text-textMain">
    <!-- Top Header & Sub-Navigation Selector -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">FTA Control Panel</h2>
        <p class="text-sm text-gray-400 font-medium mt-1">Operational tools for FRC events, team rosters, and CSA context assignments</p>
      </div>

      <!-- Navigation Dropdown / Tab Selector -->
      <div class="flex items-center space-x-2 w-full md:w-auto">
        <CustomSelect
          v-model="activeTab"
          :options="tabOptions"
          class="w-full md:w-60 font-bold"
        />
      </div>
    </div>

    <!-- Alert Banner -->
    <div v-if="alertMessage" :class="alertType === 'error' ? 'bg-red-950/40 text-accentCoral border-red-900/30' : 'bg-green-950/40 text-green-400 border-green-900/30'" class="p-4 rounded-xl border text-sm font-medium flex justify-between items-center">
      <span>{{ alertMessage }}</span>
      <button @click="alertMessage = null" class="text-xs font-bold opacity-75 hover:opacity-100">✕</button>
    </div>

    <!-- Prominent Full-Screen Event Sync Loading Modal Overlay -->
    <div v-if="importingTBAEvent || creatingEvent" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div class="bg-bgCard border border-primaryTeal/40 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-5">
        <div class="inline-block animate-spin rounded-full h-14 w-14 border-4 border-primaryTeal border-t-transparent"></div>
        <div class="space-y-2">
          <h3 class="text-xl font-extrabold text-white">Importing Event & Roster...</h3>
          <p class="text-xs text-gray-300 leading-relaxed font-medium">
            Fetching official event metadata and bulk-syncing participating team rosters from <span class="text-accentPurple font-bold">The Blue Alliance API</span>.
          </p>
        </div>
        <div class="p-3 bg-bgMain rounded-xl border border-gray-800 text-[11px] text-accentYellow font-mono font-bold animate-pulse">
          <font-awesome-icon icon="bolt" class="mr-1 text-accentYellow" /> Please wait — Do not close or refresh this browser tab
        </div>
      </div>
    </div>

    <!-- SUB-VIEW 1: MANAGE EVENT TEAMS (PAGINATED & SEARCHABLE) -->
    <div v-if="activeTab === 'manage-teams'" class="space-y-6">
      <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto max-w-full">
            <label class="text-xs font-bold text-gray-400 uppercase">Select Event:</label>
            <div class="flex items-center space-x-2 w-full min-w-0">
              <CustomSelect
                v-model="selectedEventCode"
                :options="ftaEventOptions"
                @change="loadEventTeams(1)"
                class="w-full sm:w-72 font-bold"
              />
              <button 
                v-if="selectedEventCode" 
                @click="handleSetActiveEvent(selectedEventCode)" 
                title="Set Active Competition Event"
                class="flex-shrink-0 bg-accentYellow/20 hover:bg-accentYellow/30 text-accentYellow border border-accentYellow/40 px-3 py-2 rounded-lg transition cursor-pointer flex items-center justify-center shadow-sm"
              >
                <font-awesome-icon icon="star" class="text-accentYellow text-sm" />
              </button>
            </div>
          </div>

          <!-- Add Team to Event inline input -->
          <form @submit.prevent="handleAddTeamToEvent" class="flex items-center space-x-2 w-full sm:w-auto">
            <input 
              v-model.number="newTeamNumber" 
              type="number" 
              placeholder="Team #" 
              required
              class="w-28 px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs placeholder-gray-500"
            >
            <button 
              type="submit" 
              title="Add Team to Roster" 
              class="w-9 h-9 flex items-center justify-center bg-primaryTeal hover:bg-primaryTeal/90 text-white rounded-lg transition shadow-sm cursor-pointer flex-shrink-0"
            >
              <font-awesome-icon icon="plus" class="text-sm" />
            </button>
          </form>
        </div>

        <!-- Search Bar -->
        <div class="flex items-center space-x-3 bg-bgMain px-4 py-2.5 rounded-xl border border-gray-800">
          <font-awesome-icon icon="magnifying-glass" class="text-gray-400" />
          <input 
            v-model="teamSearchQuery" 
            type="text" 
            placeholder="Search by team number or name..." 
            @input="debouncedSearch"
            class="w-full bg-transparent text-xs text-textMain placeholder-gray-500 focus:outline-none"
          >
          <button v-if="teamSearchQuery" @click="teamSearchQuery = ''; loadEventTeams(1)" class="text-xs text-accentYellow font-bold">
            Clear
          </button>
        </div>

        <!-- Paginated Teams Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-primaryTeal">
                <th class="px-4 py-3">Team #</th>
                <th class="px-4 py-3">Team Name</th>
                <th class="px-4 py-3">Rookie Year</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 text-xs">
              <tr v-if="loadingTeams">
                <td colspan="4" class="text-center py-8 text-gray-400">Loading attending roster...</td>
              </tr>
              <tr v-else-if="eventTeams.length === 0">
                <td colspan="4" class="text-center py-8 text-gray-400">No teams found for this event search query.</td>
              </tr>
              <tr v-for="team in eventTeams" :key="team._id" class="hover:bg-bgMain/30 transition">
                <td class="px-4 py-3 font-bold text-white font-mono">Team {{ team.number }}</td>
                <td class="px-4 py-3 font-semibold text-gray-200">{{ team.name }}</td>
                <td class="px-4 py-3 text-gray-400 font-mono">{{ team.rookieYear || 'N/A' }}</td>
                <td class="px-4 py-3 text-right">
                  <button 
                    @click="handleRemoveTeamFromEvent(team.number)"
                    class="bg-red-950/40 hover:bg-red-900/60 text-accentCoral border border-red-900/30 px-2.5 py-1 rounded text-[10px] font-bold transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex justify-between items-center border-t border-gray-800 pt-4 text-xs text-gray-400">
          <span>Showing Page {{ currentPage }} of {{ totalPages }} ({{ totalTeamsCount }} Total Teams)</span>
          <div class="flex space-x-2">
            <button 
              :disabled="currentPage === 1" 
              @click="loadEventTeams(currentPage - 1)" 
              class="w-8 h-8 rounded-lg bg-bgMain border border-gray-700 disabled:opacity-40 font-bold flex items-center justify-center text-textMain hover:border-gray-500 transition cursor-pointer"
              title="Previous Page"
            >
              <font-awesome-icon icon="chevron-left" class="text-xs" />
            </button>
            <button 
              :disabled="currentPage === totalPages" 
              @click="loadEventTeams(currentPage + 1)" 
              class="w-8 h-8 rounded-lg bg-bgMain border border-gray-700 disabled:opacity-40 font-bold flex items-center justify-center text-textMain hover:border-gray-500 transition cursor-pointer"
              title="Next Page"
            >
              <font-awesome-icon icon="chevron-right" class="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-VIEW 2: ADD TEAM (TBA SYNC) -->
    <div v-if="activeTab === 'add-team'" class="max-w-xl mx-auto">
      <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
        <div class="border-b border-gray-800 pb-3 flex justify-between items-center">
          <h3 class="text-lg font-bold text-primaryTeal">Register FRC Team</h3>
          <span class="text-[10px] bg-primaryTeal/10 text-primaryTeal font-bold px-2 py-0.5 rounded font-mono">TBA API Enabled</span>
        </div>

        <form @submit.prevent="handleRegisterTeam" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">Team Number</label>
            <div class="flex space-x-2">
              <input v-model.number="teamForm.number" type="number" required placeholder="e.g. 254" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm">
              <button type="button" @click="fetchFromTBA" :disabled="fetchingTBA" class="bg-accentPurple/20 hover:bg-accentPurple/30 text-accentPurple border border-accentPurple/30 font-bold px-4 py-2.5 rounded-lg text-xs whitespace-nowrap transition">
                <font-awesome-icon icon="bolt" class="mr-1" /> {{ fetchingTBA ? 'Syncing...' : 'Lookup TBA' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">Team Name / Nickname</label>
            <input v-model="teamForm.name" type="text" required placeholder="e.g. The Cheesy Poofs" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">Rookie Year</label>
            <input v-model.number="teamForm.rookieYear" type="number" placeholder="e.g. 1999" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm">
          </div>

          <button type="submit" class="w-full bg-primaryTeal hover:bg-primaryTeal/90 text-white font-bold py-3 rounded-lg shadow text-sm transition">
            Save Team to System
          </button>
        </form>
      </div>
    </div>

    <!-- SUB-VIEW 3: ADD EVENT (TBA SYNC) -->
    <div v-if="activeTab === 'add-event'" class="max-w-xl mx-auto space-y-6">
      <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
        <div class="border-b border-gray-800 pb-3 flex justify-between items-center">
          <h3 class="text-lg font-bold text-primaryTeal">Register FRC Event Context</h3>
          <span class="text-[10px] bg-accentPurple/10 text-accentPurple font-bold px-2 py-0.5 rounded font-mono">TBA 1-Click Import</span>
        </div>

        <!-- TBA Event Import Section -->
        <div class="p-4 bg-bgMain rounded-xl border border-gray-800 space-y-3">
          <label class="block text-xs font-bold text-primaryTeal uppercase">Import Event & Roster from TBA</label>
          <div class="flex space-x-2">
            <input v-model="tbaEventKey" type="text" placeholder="Enter TBA Event Key (e.g. 2026brsp)" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgCard text-textMain text-xs font-mono">
            <button 
              @click="handleImportTBAEvent" 
              :disabled="importingTBAEvent" 
              title="Import Event and Attending Teams from TBA"
              class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-extrabold px-3.5 py-2 rounded-lg text-sm transition cursor-pointer flex items-center justify-center shadow-sm"
            >
              <font-awesome-icon icon="download" />
            </button>
          </div>
        </div>

        <div class="text-center text-xs text-gray-500 font-bold uppercase">— OR Manual Creation —</div>

        <form @submit.prevent="handleCreateEvent" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">Event Key/Code</label>
            <input v-model="eventForm.code" type="text" required placeholder="e.g. 2026brsp" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">Event Name</label>
            <input v-model="eventForm.name" type="text" required placeholder="e.g. Brazil Regional" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">Location</label>
            <input v-model="eventForm.location" type="text" placeholder="e.g. Sao Paulo, Brazil" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm">
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="eventForm.isActive" type="checkbox" id="isActiveEvent" class="rounded text-primaryTeal focus:ring-primaryTeal">
            <label for="isActiveEvent" class="text-xs text-gray-300 font-medium">Set as Active Competition Event</label>
          </div>

          <button type="submit" class="w-full bg-primaryTeal hover:bg-primaryTeal/90 text-white font-bold py-3 rounded-lg shadow text-sm transition">
            Create Event Record
          </button>
        </form>
      </div>
    </div>

    <!-- SUB-VIEW 4: ASSIGN CSA EVENT CONTEXTS -->
    <div v-if="activeTab === 'csa-assignment'" class="space-y-6">
      <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
        <div class="border-b border-gray-800 pb-3">
          <h3 class="text-lg font-bold text-primaryTeal">Assign Active Event Contexts to CSAs</h3>
          <p class="text-xs text-gray-400 mt-1">Set specific competition events for Control System Advisors so their dashboards filter to their assigned venue.</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-primaryTeal">
                <th class="px-4 py-3">CSA Name</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Role</th>
                <th class="px-4 py-3">Assigned Event Context</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 text-xs">
              <tr v-for="csa in csaUsers" :key="csa._id" class="hover:bg-bgMain/30 transition">
                <td class="px-4 py-3 font-bold text-white">{{ csa.name }}</td>
                <td class="px-4 py-3 text-gray-400 font-mono">{{ csa.email }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-primaryTeal/10 text-primaryTeal border border-primaryTeal/20">
                    {{ csa.role }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <CustomSelect
                    v-model="csa.assignedEventCode"
                    :options="csaEventOptions"
                    class="w-60 font-bold"
                  />
                </td>
                <td class="px-4 py-3 text-right">
                  <button @click="saveCSAEventAssignment(csa)" class="bg-primaryTeal text-white font-bold px-3 py-1 rounded text-xs hover:bg-opacity-90 transition">
                    Save
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { CustomSelect } from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();
const activeTab = ref('manage-teams');

const tabOptions = [
  { value: 'manage-teams', label: 'Manage Event Teams' },
  { value: 'add-team', label: 'Register Team (TBA Sync)' },
  { value: 'add-event', label: 'Register Event (TBA Sync)' },
  { value: 'csa-assignment', label: 'Assign CSA Event Contexts' }
];

const availableFTAEvents = computed(() => {
  if (authStore.isAdmin) return events.value;
  if (authStore.isFTA) {
    const assigned = authStore.user?.assignedEventCodes || [];
    if (assigned.length > 0) {
      return events.value.filter(e => assigned.includes(e.code));
    }
  }
  return events.value;
});

const ftaEventOptions = computed(() => 
  availableFTAEvents.value.map(ev => ({
    value: ev.code,
    label: `${ev.name} (${ev.code}) ${ev.isActive ? '(Active)' : ''}`
  }))
);

const csaEventOptions = computed(() => [
  { value: null, label: 'Global (All Events)' },
  ...availableFTAEvents.value.map(ev => ({
    value: ev.code,
    label: `${ev.name} (${ev.code})`
  }))
]);

const alertMessage = ref(null);
const alertType = ref('success');

const showAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => { alertMessage.value = null; }, 4000);
};

// Data state
const events = ref([]);
const selectedEventCode = ref('');
const eventTeams = ref([]);
const loadingTeams = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const totalTeamsCount = ref(0);
const teamSearchQuery = ref('');
const newTeamNumber = ref('');
let debounceTimer = null;

// Forms
const teamForm = ref({ number: '', name: '', rookieYear: '' });
const fetchingTBA = ref(false);

const eventForm = ref({ code: '', name: '', location: '', isActive: false });
const tbaEventKey = ref('');
const importingTBAEvent = ref(false);
const creatingEvent = ref(false);

const csaUsers = ref([]);

// API calls
const loadEvents = async () => {
  try {
    await authStore.fetchCurrentUser();
    const res = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      events.value = await res.json();
      const list = availableFTAEvents.value;
      if (!selectedEventCode.value && list.length > 0) {
        const active = list.find(e => e.isActive);
        selectedEventCode.value = active ? active.code : list[0].code;
        loadEventTeams(1);
      }
    }
  } catch (err) {
    console.error('Failed to fetch events:', err);
  }
};

const loadEventTeams = async (page = 1) => {
  if (!selectedEventCode.value) return;
  loadingTeams.value = true;
  currentPage.value = page;
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: '10',
      search: teamSearchQuery.value.trim()
    });
    const res = await fetch(getApiUrl(`/events/${selectedEventCode.value}/teams?${params}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      eventTeams.value = data.teams;
      totalPages.value = data.totalPages;
      totalTeamsCount.value = data.total;
    }
  } catch (err) {
    showAlert('Failed to load event team roster', 'error');
  } finally {
    loadingTeams.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { loadEventTeams(1); }, 300);
};

const handleAddTeamToEvent = async () => {
  if (!newTeamNumber.value || !selectedEventCode.value) return;
  try {
    const res = await fetch(getApiUrl(`/events/${selectedEventCode.value}/teams`), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teamNumber: newTeamNumber.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add team');
    showAlert(`Team ${newTeamNumber.value} added to roster!`);
    newTeamNumber.value = '';
    loadEventTeams(currentPage.value);
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

const handleRemoveTeamFromEvent = async (teamNum) => {
  if (!confirm(`Remove Team ${teamNum} from event roster?`)) return;
  try {
    const res = await fetch(getApiUrl(`/events/${selectedEventCode.value}/teams/${teamNum}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!res.ok) throw new Error('Failed to remove team');
    showAlert(`Team ${teamNum} removed from roster`);
    loadEventTeams(currentPage.value);
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

// TBA Lookup for Team
const fetchFromTBA = async () => {
  if (!teamForm.value.number) return showAlert('Please enter a team number first', 'error');
  fetchingTBA.value = true;
  try {
    const res = await fetch(getApiUrl(`/tba/teams/${teamForm.value.number}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'TBA lookup failed');
    teamForm.value.name = data.name;
    teamForm.value.rookieYear = data.rookieYear;
    showAlert(`Synced Team ${data.number} data from TBA!`);
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    fetchingTBA.value = false;
  }
};

const handleRegisterTeam = async () => {
  try {
    const res = await fetch(getApiUrl('/teams'), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamForm.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register team');
    showAlert(`Team ${data.number} registered successfully!`);
    teamForm.value = { number: '', name: '', rookieYear: '' };
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

// Import Event from TBA
const handleImportTBAEvent = async () => {
  if (!tbaEventKey.value) return showAlert('Enter TBA Event Key', 'error');
  importingTBAEvent.value = true;
  try {
    const res = await fetch(getApiUrl(`/tba/import-event/${tbaEventKey.value}`), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    showAlert(data.message);
    const importedCode = data.event?.code || tbaEventKey.value.toLowerCase();
    tbaEventKey.value = '';
    await loadEvents();
    
    // Auto navigate directly to Manage Event Teams tab with imported event selected
    selectedEventCode.value = importedCode;
    activeTab.value = 'manage-teams';
    loadEventTeams(1);
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    importingTBAEvent.value = false;
  }
};

const handleCreateEvent = async () => {
  creatingEvent.value = true;
  try {
    const res = await fetch(getApiUrl('/events'), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventForm.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create event');
    showAlert(`Event ${data.name} (${data.code}) created!`);
    const createdCode = data.code;
    eventForm.value = { code: '', name: '', location: '', isActive: false };
    await loadEvents();
    
    // Auto navigate directly to Manage Event Teams tab with created event selected
    selectedEventCode.value = createdCode;
    activeTab.value = 'manage-teams';
    loadEventTeams(1);
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    creatingEvent.value = false;
  }
};

const handleSetActiveEvent = async (code) => {
  try {
    // 1. Update FTA user's assigned active event in backend profile
    const userRes = await fetch(getApiUrl(`/users/${authStore.user._id}/assigned-event`), {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assignedEventCode: code })
    });
    if (!userRes.ok) throw new Error('Failed to update user assigned event context');

    // 2. Mark event active in database
    await fetch(getApiUrl(`/events/${code}/active`), {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });

    showAlert(`Active competition event context set to ${code}!`);
    await authStore.fetchCurrentUser();
    await loadEvents();
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

// CSA Event Assignment (FTAs assign active event context to CSAs)
const loadCSAUsers = async () => {
  try {
    const res = await fetch(getApiUrl('/users'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const allUsers = await res.json();
      csaUsers.value = allUsers.filter(u => u.role === 'CSA');
    }
  } catch (err) {
    console.error('Failed to load users:', err);
  }
};

const saveCSAEventAssignment = async (csaUser) => {
  try {
    const res = await fetch(getApiUrl(`/users/${csaUser._id}/assigned-event`), {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assignedEventCode: csaUser.assignedEventCode || null })
    });
    if (!res.ok) throw new Error('Failed to update assigned event context');
    showAlert(`Assigned event context updated for ${csaUser.name}!`);
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

onMounted(() => {
  loadEvents();
  loadCSAUsers();
});
</script>
