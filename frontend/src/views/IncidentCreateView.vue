<template>
  <div class="max-w-2xl mx-auto bg-bgCard p-8 rounded-2xl shadow border border-gray-100 mt-8 animate-fadeIn">
    <h2 class="text-3xl font-extrabold text-primaryNavy tracking-tight mb-2">Report Technical Incident</h2>
    <p class="text-sm text-gray-500 mb-6">Document issues immediately to request field support</p>

    <!-- Active Event Banner -->
    <div v-if="activeEvent" class="bg-gray-50 border p-3 rounded-lg text-xs font-semibold text-gray-600 mb-4 flex items-center space-x-1.5 shadow-sm">
      <span>🏆 Submitting to Active Event context:</span>
      <span class="text-primaryNavy font-extrabold">{{ activeEvent.name }} ({{ activeEvent.code }})</span>
    </div>
    
    <form @submit.prevent="submitIncident" class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider mb-2">Team Number</label>
          <input v-model="form.teamNumber" type="number" required class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm" placeholder="e.g. 254">
        </div>
        <div>
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider mb-2">Match Number</label>
          <input v-model="form.matchNumber" type="text" class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm" placeholder="e.g. Q12">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider mb-2">Category</label>
          <select v-model="form.category" required class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm bg-white">
            <option value="RADIO_COMMS">Radio & Comms</option>
            <option value="ROBOTIC_POWER">Robot Power Path</option>
            <option value="CAN_BUS">CAN Bus Connection</option>
            <option value="MECHANICAL">Mechanical Issue</option>
            <option value="CODE_EXCEPTION">Robot User Code</option>
            <option value="OTHER">Other Issues</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider mb-2">Priority</label>
          <select v-model="form.priority" required class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm bg-white">
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="CRITICAL">Critical Alert</option>
          </select>
        </div>
      </div>
      
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider">Issue Description</label>
          <span v-if="transcriptionSource" class="text-[10px] text-primaryTeal bg-primaryTeal/10 px-2 py-0.5 rounded font-bold uppercase font-mono tracking-wider">
            Transcribed (Review Details below)
          </span>
        </div>
        <textarea v-model="form.description" required rows="4" class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm" placeholder="Describe the problem..."></textarea>
      </div>

      <!-- Recording status banner -->
      <div v-if="recording" class="bg-red-50 border border-accentCoral/30 p-4 rounded-xl flex items-center justify-between animate-pulse">
        <div class="flex items-center space-x-2 text-xs text-accentCoral font-bold">
          <span class="w-2.5 h-2.5 bg-accentCoral rounded-full animate-ping"></span>
          <span>Recording microphone audio... Speak clearly.</span>
        </div>
        <button type="button" @click="stopRecording" class="bg-accentCoral text-white text-xs font-bold py-1 px-3 rounded shadow hover:bg-opacity-90">
          Stop Recording
        </button>
      </div>

      <!-- Transcribing loading indicator -->
      <div v-if="transcribing" class="text-xs text-primaryTeal font-bold flex items-center space-x-2 p-3 bg-primaryTeal/5 border border-primaryTeal/15 rounded-xl">
        <div class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-primaryTeal border-t-transparent"></div>
        <span>Converting audio to text transcription... Please wait.</span>
      </div>

      <!-- Transcription Error and Retry -->
      <div v-if="transcriptionError" class="bg-red-50 border border-accentCoral/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <span class="text-xs text-accentCoral font-semibold">{{ transcriptionError }}</span>
        <div class="flex space-x-2">
          <button
            type="button"
            @click="retryTranscription(true)"
            class="bg-accentPurple text-white text-xs font-bold py-1.5 px-3 rounded shadow hover:bg-opacity-90 transition"
          >
            Force Fail Retry
          </button>
          <button
            type="button"
            @click="retryTranscription(false)"
            class="bg-primaryTeal text-white text-xs font-bold py-1.5 px-3 rounded shadow hover:bg-opacity-90 transition"
          >
            Retry Transcription
          </button>
        </div>
      </div>

      <div v-if="error" class="text-accentCoral text-xs font-medium p-3 bg-red-50 rounded">
        {{ error }}
      </div>

      <div class="flex items-center justify-between pt-4 border-t">
        <button
          type="button"
          @click="startRecording"
          :disabled="recording || transcribing"
          class="flex items-center space-x-2 text-primaryTeal hover:text-accentPurple disabled:opacity-50 transition font-semibold text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>Use Voice Record</span>
        </button>

        <button
          type="submit"
          :disabled="submitting || transcribing"
          class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 text-sm"
        >
          {{ submitting ? 'Submitting...' : 'Submit Ticket' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ teamNumber: null, matchNumber: '', eventCode: '', description: '', category: 'OTHER', priority: 'MEDIUM' });
const submitting = ref(false);
const error = ref(null);

const recording = ref(false);
const transcribing = ref(false);
const transcriptionError = ref(null);
const transcriptionSource = ref(false);
const activeEvent = ref(null);

let mediaRecorder = null;
let audioChunks = [];
let cachedAudioBlob = null;

const fetchActiveEvent = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events/active', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      const data = await response.json();
      activeEvent.value = data;
      form.value.eventCode = data.code;
    }
  } catch (err) {
    console.error('Failed to load active event:', err);
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
    const response = await fetch(`http://localhost:3000/api/incidents/transcribe${errorParam}`, {
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
    const response = await fetch('http://localhost:3000/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(form.value)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to submit incident');
    
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
