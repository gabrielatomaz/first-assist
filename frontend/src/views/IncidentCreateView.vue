<template>
  <BaseCard padding="p-8" class="max-w-2xl mx-auto mt-8 animate-fadeIn space-y-6">
    <PageHeader
      title="Report Technical Incident"
      subtitle="Document issues immediately to request field support"
    />

    <!-- Active Event Banner -->
    <div v-if="activeEvent" class="bg-bgMain border border-gray-800 p-3 rounded-xl text-xs font-semibold text-gray-400 flex items-center space-x-1.5 shadow-sm">
      <font-awesome-icon icon="trophy" class="text-accentYellow font-black mr-1" />
      <span class="text-teal-400 font-extrabold">{{ activeEvent.name }} ({{ activeEvent.code }})</span>
    </div>
    
    <form @submit.prevent="submitIncident" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <BaseInput 
            v-model="form.teamNumber" 
            type="number" 
            label="Team Number"
            list="eventTeamsList" 
            required 
            placeholder="e.g. 254 (or select below)"
            input-class="font-mono"
          />
          <datalist id="eventTeamsList">
            <option v-for="team in activeEventTeams" :key="team._id" :value="team.number">
              Team {{ team.number }} — {{ team.name }}
            </option>
          </datalist>
        </div>
        <div>
          <BaseInput 
            v-model="form.matchNumber" 
            label="Match Number"
            list="matchSuggestionsList" 
            :disabled="!form.teamNumber"
            :placeholder="form.teamNumber ? 'e.g. Q12 (select match)' : 'Select Team Number first...'"
            input-class="font-mono"
          />
          <datalist id="matchSuggestionsList">
            <option v-for="m in availableMatchSuggestions" :key="m" :value="m">{{ m }}</option>
          </datalist>
          <p v-if="!form.teamNumber" class="text-[10px] text-gray-400 mt-1">Select a team number first to filter matches for that team.</p>
          <p v-else-if="availableMatchSuggestions.length" class="text-[10px] text-teal-400 font-medium mt-1">Showing {{ availableMatchSuggestions.length }} matches assigned to Team {{ form.teamNumber }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div>
        <BaseTextarea 
          v-model="form.description" 
          label="Description"
          required 
          rows="4" 
          placeholder="Detailed explanation of the issue (e.g., Radio lost power on hit, CAN error on drive motor, etc.)"
          textarea-class="pb-12"
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
import { ref, computed, watch, onMounted } from 'vue';
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
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical Alert', class: 'text-accentCoral font-bold' }
];

const form = ref({ teamNumber: null, matchNumber: '', eventCode: '', description: '', category: 'OTHER', priority: 'MEDIUM' });
const submitting = ref(false);
const error = ref(null);

const isFormValid = computed(() => {
  return Boolean(
    form.value.teamNumber &&
    Number(form.value.teamNumber) > 0 &&
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
});
</script>
