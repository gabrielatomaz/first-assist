<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-bgCard w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-gray-700 flex flex-col space-y-5">
      <div class="flex justify-between items-start border-b border-gray-700 pb-4">
        <div>
          <h3 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <font-awesome-icon icon="circle-check" class="text-teal-400" />
            <span>Resolve Incident</span>
          </h3>
          <p class="text-xs text-gray-300 mt-1">Document the technical root cause and applied fix to close this ticket.</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition">
          <font-awesome-icon icon="xmark" class="text-lg" />
        </button>
      </div>

      <!-- Quick AI Suggestion Shortcut -->
      <div v-if="aiSuggestion" class="bg-accentPurple/10 border border-accentPurple/25 p-3 rounded-xl flex items-center justify-between">
        <div class="flex items-center space-x-2 text-xs text-purple-200 font-semibold">
          <font-awesome-icon icon="robot" class="text-sm text-accentPurple" />
          <span>AI diagnostic recommendation available</span>
        </div>
        <BaseButton
          type="button"
          @click="applyAISuggestion"
          variant="ai"
          size="sm"
          icon="wand-magic-sparkles"
        >
          Apply
        </BaseButton>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Root Cause Field -->
        <div>
          <label class="block text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Root Cause</label>
          <div class="relative">
            <textarea
              v-model="form.rootCause"
              required
              rows="3"
              placeholder="e.g. POE power cable loose terminal"
              class="w-full px-4 py-2.5 pb-10 rounded-xl bg-bgMain border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 text-sm font-medium resize-none"
            ></textarea>
            <button
              type="button"
              @click="isRecording && activeRecordingField === 'rootCause' ? stopRecording() : startRecording('rootCause')"
              :disabled="isTranscribing"
              :title="isTranscribing && activeRecordingField === 'rootCause' ? 'Transcribing audio...' : (isRecording && activeRecordingField === 'rootCause' ? 'Stop recording' : 'Record audio')"
              :class="isRecording && activeRecordingField === 'rootCause' ? 'bg-red-600 text-white animate-pulse border-red-500' : 'bg-bgCard text-gray-400 hover:text-white border-gray-600 hover:border-gray-500'"
              class="absolute right-3 bottom-3 w-8 h-8 rounded-lg border text-sm font-semibold flex items-center justify-center transition duration-150 shadow cursor-pointer"
            >
              <font-awesome-icon v-if="isTranscribing && activeRecordingField === 'rootCause'" icon="spinner" class="animate-spin text-sm" />
              <font-awesome-icon v-else icon="microphone" class="text-sm" />
            </button>
          </div>
        </div>

        <!-- Applied Solution Field -->
        <div>
          <label class="block text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Applied Solution</label>
          <div class="relative">
            <textarea
              v-model="form.appliedSolution"
              required
              rows="3"
              placeholder="e.g. Secured ethernet cable connector, added zip-tie support"
              class="w-full px-4 py-2.5 pb-10 rounded-xl bg-bgMain border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 text-sm font-medium resize-none"
            ></textarea>
            <button
              type="button"
              @click="isRecording && activeRecordingField === 'appliedSolution' ? stopRecording() : startRecording('appliedSolution')"
              :disabled="isTranscribing"
              :title="isTranscribing && activeRecordingField === 'appliedSolution' ? 'Transcribing audio...' : (isRecording && activeRecordingField === 'appliedSolution' ? 'Stop recording' : 'Record audio')"
              :class="isRecording && activeRecordingField === 'appliedSolution' ? 'bg-red-600 text-white animate-pulse border-red-500' : 'bg-bgCard text-gray-400 hover:text-white border-gray-600 hover:border-gray-500'"
              class="absolute right-3 bottom-3 w-8 h-8 rounded-lg border text-sm font-semibold flex items-center justify-center transition duration-150 shadow cursor-pointer"
            >
              <font-awesome-icon v-if="isTranscribing && activeRecordingField === 'appliedSolution'" icon="spinner" class="animate-spin text-sm" />
              <font-awesome-icon v-else icon="microphone" class="text-sm" />
            </button>
          </div>
        </div>

        <p v-if="audioError" class="text-xs text-accentCoral font-medium">{{ audioError }}</p>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            @click="$emit('close')"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="success"
            size="sm"
            :disabled="submitting"
            :loading="submitting"
            loading-text="Saving..."
          >
            Resolve
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { BaseButton } from './index';
import { useSpeechRecognition } from '../composables/useSpeechRecognition';
import { getApiUrl } from '../config/api';

const props = defineProps({
  incidentId: { type: String, required: true }
});

const emit = defineEmits(['close', 'resolved']);
const authStore = useAuthStore();

const form = ref({ rootCause: '', appliedSolution: '' });
const submitting = ref(false);
const aiSuggestion = ref(null);

const {
  isRecording,
  isTranscribing,
  audioError,
  activeField: activeRecordingField,
  startRecording: startSpeechRec,
  stopRecording: stopSpeechRec
} = useSpeechRecognition();

const fetchAISuggestion = async () => {
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/ai-suggestions`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        aiSuggestion.value = data.suggestions[0];
      }
    }
  } catch (err) {
    console.error('Failed to load AI suggestion for resolve modal:', err);
  }
};

const applyAISuggestion = () => {
  if (!aiSuggestion.value) return;
  if (aiSuggestion.value.suggestedCause) {
    form.value.rootCause = aiSuggestion.value.suggestedCause;
  }
  if (aiSuggestion.value.suggestedSolution) {
    form.value.appliedSolution = aiSuggestion.value.suggestedSolution;
  }
};

const startRecording = (field) => {
  startSpeechRec(field);
};

const stopRecording = async () => {
  const data = await stopSpeechRec();
  if (data && data.text && data.field) {
    if (form.value[data.field]) {
      form.value[data.field] += ' ' + data.text;
    } else {
      form.value[data.field] = data.text;
    }
  }
};

const handleSubmit = async () => {
  if (!form.value.rootCause.trim() || !form.value.appliedSolution.trim()) return;
  submitting.value = true;
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/resolve`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(form.value)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to resolve incident');
    emit('resolved', data);
  } catch (err) {
    alert(err.message);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchAISuggestion();
});
</script>
