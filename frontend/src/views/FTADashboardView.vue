<template>
  <div class="max-w-5xl mx-auto space-y-8 mt-8 animate-fadeIn text-textMain">
    <!-- Top Header & Sub-Navigation Selector -->
    <PageHeader
      title="FTA Control Panel"
      subtitle="Operational tools for FRC events, team rosters, and CSA context assignments"
      :card="true"
    >
      <template #actions>
        <CustomSelect
          v-model="activeTab"
          :options="tabOptions"
          class="w-full md:w-60 font-bold"
        />
      </template>
    </PageHeader>


    <!-- Confirm Remove Team Modal Overlay -->
    <ConfirmationModal
      :model-value="!!teamToRemove"
      @update:model-value="(val) => { if (!val) teamToRemove = null; }"
      title="Remove Team from Event?"
      :message="`Are you sure you want to remove Team ${teamToRemove} from the event roster for ${selectedEventCode}?`"
      icon="trash-can"
      variant="danger"
      confirm-text="Yes, Remove"
      confirm-icon="trash-can"
      cancel-text="Cancel"
      :loading="removingTeam"
      loading-text="Removing..."
      @confirm="executeRemoveTeam"
      @cancel="teamToRemove = null"
    />

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
      <BaseCard class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto max-w-full">
            <label class="text-xs font-semibold text-gray-300 uppercase tracking-wider flex-shrink-0">Select Event:</label>
            <div class="flex items-center space-x-2 w-full min-w-0">
              <CustomSelect
                v-model="selectedEventCode"
                :options="ftaEventOptions"
                @change="loadEventTeams(1)"
                class="flex-1 min-w-0 sm:flex-initial sm:w-72 font-bold"
              />
              <BaseButton 
                v-if="selectedEventCode" 
                @click="handleSetActiveEvent(selectedEventCode)" 
                variant="ghost"
                size="icon-sm"
                icon="star"
                title="Set Active Competition Event"
                class="text-accentYellow border border-accentYellow/40 hover:bg-accentYellow/20 flex-shrink-0"
              />
            </div>
          </div>

          <!-- Add Team to Event inline input -->
          <form @submit.prevent="handleAddTeamToEvent" class="flex items-center space-x-2 w-full sm:w-auto">
            <BaseInput 
              v-model.number="newTeamNumber" 
              type="number" 
              placeholder="Team #" 
              required
              size="sm"
              input-class="font-mono"
              class="flex-1 min-w-0 sm:w-28"
            />
            <BaseButton 
              type="submit" 
              variant="primary"
              size="icon-sm"
              icon="plus"
              :disabled="!newTeamNumber || !selectedEventCode"
              title="Add Team to Roster" 
            />
          </form>
        </div>

        <!-- Alert Banner inside Manage Event Teams -->
        <AlertBanner 
          v-if="alertMessage" 
          :type="alertType === 'error' ? 'error' : 'success'" 
          :message="alertMessage" 
          :dismissible="true"
          @dismiss="alertMessage = null" 
        />

        <!-- Standardized Search Bar -->
        <SearchBar
          v-model="teamSearchQuery"
          placeholder="Search by team number or name..."
          :debounce-ms="300"
          @search="debouncedSearch"
          @clear="teamSearchQuery = ''; loadEventTeams(1)"
        />

        <!-- Paginated Teams Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-teal-400">
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
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button 
                    @click="handleRemoveTeamFromEvent(team.number)"
                    class="text-xs font-semibold text-accentCoral hover:text-red-300 hover:underline transition cursor-pointer"
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
            <BaseButton 
              :disabled="currentPage === 1" 
              @click="loadEventTeams(currentPage - 1)" 
              variant="secondary"
              size="icon-sm"
              icon="chevron-left"
              title="Previous Page"
            />
            <BaseButton 
              :disabled="currentPage === totalPages" 
              @click="loadEventTeams(currentPage + 1)" 
              variant="secondary"
              size="icon-sm"
              icon="chevron-right"
              title="Next Page"
            />
          </div>
        </div>
      </BaseCard>
    </div>



    <!-- SUB-VIEW 4: ASSIGN CSA EVENT CONTEXTS -->
    <div v-if="activeTab === 'csa-assignment'" class="space-y-6">
      <BaseCard class="space-y-6">
        <div class="border-b border-gray-800 pb-3 flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-teal-400 tracking-tight">Manage CSAs & Event Assignments</h3>
            <p class="text-xs text-gray-400 mt-0.5">Register Control System Advisors and assign specific competition event contexts.</p>
          </div>
          <BaseButton
            v-if="showCreateCsaForm"
            size="icon-sm"
            variant="secondary"
            icon="xmark"
            @click="showCreateCsaForm = false"
            title="Cancel"
          />
          <BaseButton
            v-else
            size="sm"
            variant="primary"
            icon="user-plus"
            @click="showCreateCsaForm = true"
            title="Register"
            class="w-8 h-8 sm:w-auto px-0 sm:px-3 flex-shrink-0"
          >
            <span class="hidden sm:inline">Register</span>
          </BaseButton>
        </div>

        <!-- Alert Banner inside Manage CSAs & Event Assignments -->
        <AlertBanner 
          v-if="alertMessage" 
          :type="alertType === 'error' ? 'error' : 'success'" 
          :message="alertMessage" 
          :dismissible="true" 
          @dismiss="alertMessage = null" 
        />

        <!-- Inline Register CSA Form -->
        <div v-if="showCreateCsaForm" class="p-5 bg-bgMain rounded-xl border border-gray-800 space-y-4 animate-fadeIn">
          <div>
            <h4 class="text-xs font-bold text-teal-400 uppercase tracking-wider">Register Control System Advisor (CSA)</h4>
          </div>
          <form @submit.prevent="handleRegisterCSA" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model="csaForm.name" label="Name" required placeholder="e.g. John Doe" />
              <BaseInput v-model="csaForm.email" type="email" label="Email" required placeholder="csa@first.org" />
              <BaseInput v-model="csaForm.password" type="password" label="Temporary Password" required placeholder="******" input-class="font-mono" />
              <BaseInput v-model="csaForm.confirmPassword" type="password" label="Confirm Password" required placeholder="******" input-class="font-mono" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Assigned Event Context</label>
              <CustomSelect v-model="csaForm.assignedEventCode" :options="csaEventOptions" />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <BaseButton 
                type="button" 
                variant="secondary" 
                size="sm" 
                @click="showCreateCsaForm = false"
              >
                Cancel
              </BaseButton>
              <BaseButton 
                type="submit" 
                variant="primary"
                size="sm"
                :disabled="registeringCSA || !csaForm.name || !csaForm.email || !csaForm.password || !csaForm.confirmPassword" 
                :loading="registeringCSA"
                loading-text="Registering..."
              >
                Register
              </BaseButton>
            </div>
          </form>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-teal-400">
                <th class="px-4 py-3">CSA Name</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Assigned Event Context</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 text-xs">
              <tr v-if="loadingCsaUsers">
                <td colspan="5" class="text-center py-8 text-gray-400">Loading CSAs list...</td>
              </tr>
              <tr v-else-if="!csaUsers || csaUsers.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">No Control System Advisors registered yet.</td>
              </tr>
              <tr v-else v-for="csa in csaUsers" :key="csa._id" class="hover:bg-bgMain/30 transition">
                <td class="px-4 py-3 font-bold text-white">{{ csa.name }}</td>
                <td class="px-4 py-3 text-gray-400 font-mono">{{ csa.email }}</td>
                <td class="px-4 py-3">
                  <StatusBadge :status="csa.status || 'ACTIVE'" />
                </td>
                <td class="px-4 py-3">
                  <CustomSelect
                    v-model="csa.assignedEventCode"
                    :options="csaEventOptions"
                    @change="saveCSAEventAssignment(csa)"
                    size="sm"
                    class="w-56 font-bold"
                  />
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    @click="toggleCSAStatus(csa)"
                    :disabled="updatingCsaStatus === csa._id"
                    :class="csa.status === 'ACTIVE' ? 'text-accentCoral hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'"
                    class="text-xs font-semibold hover:underline disabled:opacity-50 transition cursor-pointer"
                  >
                    <font-awesome-icon v-if="updatingCsaStatus === csa._id" icon="spinner" spin class="mr-1" />
                    {{ csa.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  BaseButton,
  BaseCard,
  BaseInput,
  RoleBadge,
  StatusBadge,
  CustomSelect,
  ConfirmationModal,
  PageHeader,
  AlertBanner,
  SearchBar
} from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();
const activeTab = ref('manage-teams');

const tabOptions = [
  { value: 'manage-teams', label: 'Manage Event Teams' },
  { value: 'csa-assignment', label: 'Manage CSAs' }
];

const availableFTAEvents = computed(() => {
  if (authStore.isAdmin) return events.value;
  
  const assigned = [];
  if (authStore.user?.assignedEventCode) {
    assigned.push(authStore.user.assignedEventCode);
  }
  if (Array.isArray(authStore.user?.assignedEventCodes)) {
    assigned.push(...authStore.user.assignedEventCodes);
  }
  const uniqueAssigned = Array.from(new Set(assigned.filter(Boolean)));

  return events.value.filter(e => uniqueAssigned.includes(e.code));
});

const ftaEventOptions = computed(() => 
  availableFTAEvents.value.map(ev => ({
    value: ev.code,
    label: `${ev.name} (${ev.code}) ${ev.isActive ? '(Active)' : ''}`
  }))
);

const csaEventOptions = computed(() => [
  { value: null, label: 'Unassigned' },
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
const loadingCsaUsers = ref(false);

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

const teamToRemove = ref(null);
const removingTeam = ref(false);

const handleRemoveTeamFromEvent = (teamNum) => {
  teamToRemove.value = teamNum;
};

const executeRemoveTeam = async () => {
  if (!teamToRemove.value) return;
  const teamNum = teamToRemove.value;
  removingTeam.value = true;
  try {
    const res = await fetch(getApiUrl(`/events/${selectedEventCode.value}/teams/${teamNum}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!res.ok) throw new Error('Failed to remove team');
    showAlert(`Team ${teamNum} removed from roster`);
    teamToRemove.value = null;
    loadEventTeams(currentPage.value);
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    removingTeam.value = false;
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
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error(userData.error || 'Failed to update user assigned event context');

    // 2. Mark event active in database
    const eventRes = await fetch(getApiUrl(`/events/${code}/active`), {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!eventRes.ok) {
      const eventData = await eventRes.json();
      throw new Error(eventData.error || 'Failed to set active competition event');
    }

    showAlert(`Active competition event context set to ${code}!`);
    await authStore.fetchCurrentUser();
    await loadEvents();
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

// CSA Event Assignment (FTAs assign active event context to CSAs)
const loadCSAUsers = async () => {
  loadingCsaUsers.value = true;
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
  } finally {
    loadingCsaUsers.value = false;
  }
};

const showCreateCsaForm = ref(false);
const registeringCSA = ref(false);
const updatingCsaStatus = ref(null);
const csaForm = ref({ name: '', email: '', password: '', confirmPassword: '', assignedEventCode: null });

const handleRegisterCSA = async () => {
  if (!csaForm.value.name || !csaForm.value.email || !csaForm.value.password) return;
  if (csaForm.value.password !== csaForm.value.confirmPassword) {
    return showAlert('Passwords do not match', 'error');
  }

  registeringCSA.value = true;
  try {
    const payload = {
      name: csaForm.value.name,
      email: csaForm.value.email,
      password: csaForm.value.password,
      role: 'CSA',
      assignedEventCode: csaForm.value.assignedEventCode || null
    };

    const res = await fetch(getApiUrl('/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register CSA');

    if (csaForm.value.assignedEventCode) {
      await fetch(getApiUrl(`/users/${data._id}/assigned-event`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ assignedEventCode: csaForm.value.assignedEventCode })
      });
    }

    showAlert(`CSA ${data.name} (${data.email}) registered successfully!`);
    csaForm.value = { name: '', email: '', password: '', confirmPassword: '', assignedEventCode: null };
    showCreateCsaForm.value = false;
    await loadCSAUsers();
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    registeringCSA.value = false;
  }
};

const toggleCSAStatus = async (csaUser) => {
  updatingCsaStatus.value = csaUser._id;
  const newStatus = csaUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const res = await fetch(getApiUrl(`/users/${csaUser._id}/status`), {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update account status');
    csaUser.status = data.status;
    showAlert(`CSA ${csaUser.name} account ${data.status.toLowerCase()}!`);
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    updatingCsaStatus.value = null;
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update assigned event context');
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
