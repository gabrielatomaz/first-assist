<template>
  <div class="max-w-2xl mx-auto bg-bgCard p-8 rounded-2xl shadow border border-gray-800 mt-8 animate-fadeIn space-y-6">
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
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Team Number</label>
          <input 
            v-model.number="form.teamNumber" 
            type="number" 
            list="eventTeamsList" 
            required 
            class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm placeholder-gray-500 font-mono" 
            placeholder="e.g. 254 (or select below)"
          >
          <datalist id="eventTeamsList">
            <option v-for="team in activeEventTeams" :key="team._id" :value="team.number">
              Team {{ team.number }} — {{ team.name }}
            </option>
          </datalist>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" title="Select match number">Match Number</label>
          <input 
            v-model="form.matchNumber" 
            type="text" 
            list="matchSuggestionsList" 
            :disabled="!form.teamNumber"
            title="Select match number"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm placeholder-gray-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed" 
            :placeholder="form.teamNumber ? 'e.g. Q12 (select match)' : 'Select Team Number first...'"
          >
          <datalist id="matchSuggestionsList">
            <option v-for="m in availableMatchSuggestions" :key="m" :value="m">{{ m }}</option>
          </datalist>
          <p v-if="!form.teamNumber" class="text-[10px] text-gray-400 mt-1">Select a team number first to filter matches for that team.</p>
          <p v-else-if="availableMatchSuggestions.length" class="text-[10px] text-teal-400 font-medium mt-1">Showing {{ availableMatchSuggestions.length }} matches assigned to Team {{ form.teamNumber }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Category</label>
          <CustomSelect
            v-model="form.category"
            :options="categoryOptions"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Priority</label>
          <CustomSelect
            v-model="form.priority"
            :options="priorityOptions"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Description</label>
        <textarea 
          v-model="form.description" 
          required 
          rows="4" 
          class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm placeholder-gray-500 leading-relaxed" 
          placeholder="Detailed explanation of the issue (e.g., Radio lost power on hit, CAN error on drive motor, etc.)"
        ></textarea>
      </div>

      <!-- Recording status and wave animation indicator -->
      <div v-if="recording" class="flex items-center space-x-3 bg-red-950/40 border border-red-900/40 p-3 rounded-xl text-accentCoral text-xs animate-pulse">
        <font-awesome-icon icon="circle-dot" class="text-accentCoral text-base" />
        <span class="font-bold flex-1">Recording voice audio... Speak clearly into your microphone.</span>
        <button 
          type="button" 
          @click="stopRecording" 
          class="px-3 py-1 bg-accentCoral text-white font-bold rounded-lg text-xs shadow hover:bg-opacity-90 cursor-pointer"
        >
          Stop Recording
        </button>
      </div>

      <div v-if="transcribing" class="flex items-center space-x-2 text-xs text-primaryTeal font-medium bg-primaryTeal/10 p-3 rounded-xl border border-primaryTeal/20">
        <font-awesome-icon icon="spinner" spin />
        <span>Transcribing audio with Gemini Flash...</span>
      </div>

      <div v-if="transcriptionSource" class="text-xs text-emerald-400 font-medium bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/30 flex items-center justify-between">
        <span><font-awesome-icon icon="circle-check" class="mr-1.5" /> Incident details transcribed successfully via voice</span>
        <button type="button" @click="transcriptionSource = false" class="text-gray-400 hover:text-white text-xs">✕</button>
      </div>

      <!-- Transcription Error with Graceful Retry / Circuit-Breaker options -->
      <div v-if="transcriptionError" class="bg-red-950/40 border border-red-900/30 text-accentCoral p-3.5 rounded-xl space-y-2 text-xs">
        <div class="flex items-center space-x-1.5 font-bold">
          <font-awesome-icon icon="triangle-exclamation" class="text-accentCoral" />
          <span>{{ transcriptionError }}</span>
        </div>
        <div class="flex items-center space-x-2 pt-1">
          <button
            type="button"
            @click="retryTranscription(true)"
            class="bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold py-1.5 px-3 rounded shadow border border-purple-500/30 transition cursor-pointer"
          >
            Force Fail Retry
          </button>
          <button
            type="button"
            @click="retryTranscription(false)"
            class="bg-primaryTeal hover:brightness-110 text-gray-200 text-xs font-bold py-1.5 px-3 rounded shadow transition cursor-pointer border border-primaryTeal/30"
          >
            Retry Transcription
          </button>
        </div>
      </div>

      <AlertBanner v-if="error" type="error" :message="error" />

      <div class="flex items-center justify-between pt-4 border-t border-gray-800">
        <button
          type="button"
          @click="startRecording"
          :disabled="recording || transcribing"
          class="w-10 h-10 flex items-center justify-center rounded-xl text-teal-400 hover:bg-teal-500/10 disabled:opacity-50 transition border border-teal-500/30 shadow-sm flex-shrink-0 cursor-pointer"
          title="Voice Record"
        >
          <font-awesome-icon icon="microphone" class="text-sm" />
        </button>

        <BaseButton
          type="submit"
          :disabled="submitting || transcribing"
          :loading="submitting"
          loading-text="Submitting..."
          variant="primary"
          size="md"
        >
          Submit
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  CustomSelect,
  PageHeader,
  AlertBanner,
  BaseButton
} from '../components';
import { getApiUrl } from '../config/api';

const router = useRouter();
const authStore = useAuthStore();

const categoryOptions = [
  { value: 'RADIO_COMMS', label: 'Radio & Comms' },
  { value: 'ROBOTIC_POWER', label: 'Robot Power Path' },
  { value: 'CAN_BUS', label: 'CAN Bus Connection' },
  { value: 'MECHANICAL', label: 'Mechanical Issue' },
  { value: 'CODE_EXCEPTION', label: 'Robot User Code' },
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

const recording = ref(false);
const transcribing = ref(false);
const transcriptionError = ref(null);
const transcriptionSource = ref(false);
const activeEvent = ref(null);
const activeEventTeams = ref([]);

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

let mediaRecorder = null;
let audioChunks = [];
let cachedAudioBlob = null;

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

const startRecording = async () => {
  audioChunks = [];
  transcriptionError.value = null;
  transcriptionSource.value = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      cachedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      await sendAudioForTranscription(cachedAudioBlob);
    };

    mediaRecorder.start();
    recording.value = true;
  } catch (err) {
    transcriptionError.value = "Microphone access denied. Please allow microphone permissions.";
  }
};

const stopRecording = () => {
  if (mediaRecorder && recording.value) {
    mediaRecorder.stop();
    recording.value = false;
  }
};

const sendAudioForTranscription = async (audioBlob, forceError = false) => {
  transcribing.value = true;
  transcriptionError.value = null;
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'incident.webm');
    
    const errorParam = forceError ? '?simulate_error=true' : '';
    const response = await fetch(getApiUrl(`/incidents/transcribe${errorParam}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to process audio transcription');
    }
    
    form.value.description = data.text;
    if (data.teamNumber) form.value.teamNumber = data.teamNumber;
    if (data.matchNumber) form.value.matchNumber = data.matchNumber;
    if (data.category) form.value.category = data.category;
    if (data.priority) form.value.priority = data.priority;
    transcriptionSource.value = true;
  } catch (err) {
    transcriptionError.value = err.message;
  } finally {
    transcribing.value = false;
  }
};

const retryTranscription = async (forceFail = false) => {
  if (cachedAudioBlob) {
    await sendAudioForTranscription(cachedAudioBlob, forceFail);
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
