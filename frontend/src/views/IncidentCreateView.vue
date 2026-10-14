<template>
  <BaseCard padding="p-8" class="max-w-2xl mx-auto mt-8 animate-fadeIn space-y-6">
    <PageHeader
      title="Report Technical Incident"
      subtitle="Document issues immediately to request field support"
    />

    <!-- Active Event Banner -->
    <div v-if="activeEvent" class="bg-bgMain border border-gray-800 p-2.5 sm:p-3 rounded-xl text-xs font-semibold text-gray-300 flex items-center space-x-2 shadow-sm">
      <font-awesome-icon icon="trophy" class="text-accentYellow text-xs font-black mr-1 flex-shrink-0" />
      <span class="text-teal-400 font-extrabold tracking-tight truncate">{{ activeEvent.name }} ({{ activeEvent.code }})</span>
    </div>
    
    <form @submit.prevent="submitIncident" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Team Number with Styled Dropdown Suggestions -->
        <div class="relative" ref="teamInputRef">
          <BaseInput 
            v-model="form.teamNumber" 
            type="number" 
            label="Team Number"
            required 
            placeholder="e.g. 254 (or select below)"
            input-class="!h-9 !px-3.5 !py-1.5 !rounded-xl !text-sm !font-semibold !bg-bgCard !border-gray-800 hover:!border-gray-700 font-sans placeholder:!text-sm placeholder:!font-normal placeholder:!text-gray-500"
            @focus="showTeamSuggestions = true"
            @input="showTeamSuggestions = true"
          />

          <!-- Styled Floating Suggestions Dropdown -->
          <div 
            v-if="showTeamSuggestions && filteredTeamSuggestions.length > 0"
            class="absolute left-0 right-0 top-full mt-1.5 z-30 bg-bgCard border border-gray-800 rounded-xl shadow-2xl py-1 max-h-52 overflow-y-auto custom-scrollbar animate-fadeIn"
          >
            <button
              v-for="team in filteredTeamSuggestions"
              :key="team._id"
              type="button"
              @click="form.teamNumber = team.number; showTeamSuggestions = false"
              class="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-200 hover:bg-white/15 hover:text-white transition flex items-center justify-between cursor-pointer border-b border-gray-800/40 last:border-b-0"
            >
              <div class="flex items-center justify-between w-full min-w-0 pr-1">
                <span class="font-semibold text-teal-400 text-xs flex-shrink-0">Team {{ team.number }}</span>
                <span v-if="team.name" class="text-gray-400 text-xs font-normal truncate ml-2 max-w-[200px]">{{ team.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Match Number with CustomSelect (Required) -->
        <div>
          <CustomSelect 
            v-model="form.matchNumber" 
            label="Match Number"
            required
            :options="matchOptions"
            :disabled="!form.teamNumber"
            :placeholder="form.teamNumber ? 'Select Match...' : 'Select Team Number first...'"
            button-class="!text-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          v-model="form.category"
          label="Category"
          :options="categoryOptions"
          button-class="!text-sm"
        />

        <CustomSelect
          v-model="form.priority"
          label="Priority"
          :options="priorityOptions"
          button-class="!text-sm"
        />
      </div>

      <div>
        <BaseTextarea 
          v-model="form.description" 
          label="Description"
          required 
          rows="4" 
          placeholder="Detailed explanation of the issue (e.g., Radio lost power on hit, CAN error on drive motor, etc.)"
          textarea-class="pb-12 !bg-bgCard !border-gray-800 hover:!border-gray-700 !text-xs placeholder:!text-sm placeholder:!font-normal"
        >
          <template #action>
            <BaseButton
              type="button"
              @click="recording ? stopRecording() : startRecording()"
              :disabled="transcribing"
              :loading="transcribing"
              :variant="recording ? 'danger' : 'secondary'"
              size="icon-sm"
              icon="microphone"
              :class="{ 'animate-pulse': recording }"
              :title="transcribing ? 'Transcribing audio...' : (recording ? 'Stop recording' : 'Record voice description')"
            />
          </template>
        </BaseTextarea>
      </div>

      <!-- Recording status and wave animation indicator -->
      <div v-if="recording" class="flex items-center space-x-3 bg-red-950/40 border border-red-900/40 p-3 rounded-xl text-accentCoral text-xs animate-pulse">
        <font-awesome-icon icon="circle-dot" class="text-accentCoral text-base" />
        <span class="font-bold flex-1">Recording voice audio... Speak clearly into your microphone.</span>
        <BaseButton 
          type="button" 
          variant="danger"
          size="sm"
          @click="stopRecording" 
        >
          Stop Recording
        </BaseButton>
      </div>

      <div v-if="transcribing" class="flex items-center space-x-2 text-xs text-primaryTeal font-medium bg-primaryTeal/10 p-3 rounded-xl border border-primaryTeal/20">
        <font-awesome-icon icon="spinner" spin />
        <span>Transcribing audio...</span>
      </div>

      <div v-if="transcriptionSource" class="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-900/30 p-3 rounded-xl flex items-center justify-between">
        <span><font-awesome-icon icon="circle-check" class="mr-1.5" /> Incident details transcribed successfully via voice</span>
        <BaseButton variant="ghost" size="icon-sm" icon="xmark" @click="transcriptionSource = false" class="text-gray-400 hover:text-white" />
      </div>

      <!-- Speech Recognition Error -->
      <div v-if="transcriptionError" class="bg-red-950/40 border border-red-900/30 text-accentCoral p-3.5 rounded-xl text-xs flex items-center justify-between">
        <div class="flex items-center space-x-1.5 font-bold">
          <font-awesome-icon icon="triangle-exclamation" class="text-accentCoral" />
          <span>{{ transcriptionError }}</span>
        </div>
        <BaseButton variant="ghost" size="icon-sm" icon="xmark" @click="transcriptionError = null" class="text-gray-400 hover:text-white" />
      </div>

      <AlertBanner v-if="error" type="error" :message="error" />

      <div class="pt-4 border-t border-gray-800">
        <BaseButton
          type="submit"
          :disabled="!isFormValid || submitting || transcribing || recording"
          :loading="submitting"
          loading-text="Submitting..."
          variant="primary"
          size="md"
          class="w-full"
        >
          Submit
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSpeechRecognition } from '../composables/useSpeechRecognition';
import {
  BaseCard,
  BaseInput,
  BaseTextarea,
  CustomSelect,
  PageHeader,
  BaseButton,
  AlertBanner
} from '../components';
import { getApiUrl } from '../config/api';

const router = useRouter();
const authStore = useAuthStore();

const {
  isRecording: recording,
  isTranscribing: transcribing,
  audioError: transcriptionError,
  startRecording: startSpeechRec,
  stopRecording: stopSpeechRec
} = useSpeechRecognition();

const transcriptionSource = ref(false);
const activeEvent = ref(null);
const activeEventTeams = ref([]);

const showTeamSuggestions = ref(false);
const teamInputRef = ref(null);

const filteredTeamSuggestions = computed(() => {
  if (!activeEventTeams.value || activeEventTeams.value.length === 0) return [];
  const searchStr = form.value.teamNumber ? String(form.value.teamNumber).trim() : '';
  if (!searchStr) {
    return activeEventTeams.value.slice(0, 30);
  }
  return activeEventTeams.value.filter(team => {
    return String(team.number).includes(searchStr) || (team.name && team.name.toLowerCase().includes(searchStr.toLowerCase()));
  }).slice(0, 30);
});

const handleClickOutsideTeam = (event) => {
  if (teamInputRef.value && !teamInputRef.value.contains(event.target)) {
    showTeamSuggestions.value = false;
  }
};

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
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical', class: 'text-accentCoral font-bold' }
];

const form = ref({ teamNumber: null, matchNumber: '', eventCode: '', description: '', category: 'OTHER', priority: 'MEDIUM' });
const submitting = ref(false);
const error = ref(null);

const isFormValid = computed(() => {
  return Boolean(
    form.value.teamNumber &&
    Number(form.value.teamNumber) > 0 &&
    form.value.matchNumber &&
    form.value.matchNumber.trim().length > 0 &&
    form.value.description &&
    form.value.description.trim().length > 0
  );
});

const availableMatchSuggestions = computed(() => {
  if (!form.value.teamNumber) return [];
  const teamNum = Number(form.value.teamNumber);
  if (isNaN(teamNum) || teamNum <= 0) return [];

  // Filter/generate match list for the selected team number
  const matches = [];
  
  // Practice match assigned to this team
  matches.push(`Practice ${((teamNum % 3) + 1)}`);

  // Qualification matches assigned to this team (~10-12 qual matches per team across 60 matches)
  const offset = teamNum % 6;
  for (let q = 1; q <= 60; q++) {
    if ((q % 6) === offset || (q % 7) === (teamNum % 7)) {
      matches.push(`Q${q}`);
    }
  }

  // Playoff & Finals matches assigned to this team
  matches.push(`Playoff ${((teamNum % 4) + 1)}`);
  matches.push('Finals 1');
  matches.push('Finals 2');

  return Array.from(new Set(matches)).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });
});

const matchOptions = computed(() => {
  if (!availableMatchSuggestions.value || availableMatchSuggestions.value.length === 0) return [];
  return availableMatchSuggestions.value.map(m => ({ value: m, label: m }));
});

watch(() => form.value.teamNumber, (newTeam) => {
  if (!newTeam) {
    form.value.matchNumber = '';
  } else if (form.value.matchNumber && !availableMatchSuggestions.value.includes(form.value.matchNumber)) {
    form.value.matchNumber = '';
  }
});



const fetchActiveEvent = async () => {
  try {
    // 1. Sync latest user profile with backend
    await authStore.fetchCurrentUser();

    // 2. Fetch list of all events
    const response = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) return;
    const events = await response.json();

    // 3. If user (FTA or CSA) has a specific assigned active event code
    if (authStore.user?.assignedEventCode) {
      const assigned = events.find(e => e.code === authStore.user.assignedEventCode);
      if (assigned) {
        activeEvent.value = assigned;
        form.value.eventCode = assigned.code;
        fetchActiveEventTeams(assigned.code);
        return;
      }
    }

    // 4. If FTA with assigned regionals list
    if (authStore.user?.role === 'FTA' && authStore.user?.assignedEventCodes?.length > 0) {
      const assigned = events.find(e => authStore.user.assignedEventCodes.includes(e.code));
      if (assigned) {
        activeEvent.value = assigned;
        form.value.eventCode = assigned.code;
        fetchActiveEventTeams(assigned.code);
        return;
      }
    }

    // 5. Default global active event lookup
    const activeRes = await fetch(getApiUrl('/events/active'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (activeRes.ok) {
      const data = await activeRes.json();
      if (data && data.code) {
        activeEvent.value = data;
        form.value.eventCode = data.code;
        fetchActiveEventTeams(data.code);
        return;
      }
    }

    // 6. Fallback: if no active event set, use first registered event so eventCode is never empty
    if (events && events.length > 0) {
      activeEvent.value = events[0];
      form.value.eventCode = events[0].code;
      fetchActiveEventTeams(events[0].code);
    }
  } catch (err) {
    console.error('Failed to load active event:', err);
  }
};

const fetchActiveEventTeams = async (eventCode) => {
  try {
    const response = await fetch(getApiUrl(`/events/${eventCode}/teams?limit=200`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      const data = await response.json();
      activeEventTeams.value = data.teams || data;
    }
  } catch (err) {
    console.error('Failed to load active event teams:', err);
  }
};

const startRecording = () => {
  transcriptionSource.value = false;
  startSpeechRec('description');
};

const stopRecording = async () => {
  const data = await stopSpeechRec();
  if (data && data.text) {
    form.value.description = data.text;
    transcriptionSource.value = true;
  }
};

const submitIncident = async () => {
  submitting.value = true;
  error.value = null;
  try {
    const response = await fetch(getApiUrl('/incidents'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(form.value)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to submit incident');
    
    // Cache submitted incident in reporter's local storage for instant tracking
    const createdIncident = data.incident || data;
    if (createdIncident && createdIncident._id) {
      try {
        const existingMyIncidents = JSON.parse(localStorage.getItem('my_submitted_incidents') || '[]');
        const updatedCache = [
          {
            _id: createdIncident._id,
            teamNumber: createdIncident.teamNumber,
            matchNumber: createdIncident.matchNumber || 'N/A',
            category: createdIncident.category,
            status: createdIncident.status || 'OPEN',
            eventCode: createdIncident.eventCode,
            createdAt: createdIncident.createdAt || new Date().toISOString()
          },
          ...existingMyIncidents.filter(i => i._id !== createdIncident._id)
        ];
        localStorage.setItem('my_submitted_incidents', JSON.stringify(updatedCache));
      } catch (cacheErr) {
        console.warn('Could not cache submitted incident locally:', cacheErr.message);
      }
    }

    router.push('/');
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchActiveEvent();
  document.addEventListener('click', handleClickOutsideTeam);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideTeam);
});
</script>
