<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-bgCard w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-gray-800 flex flex-col space-y-5">
      <div class="flex justify-between items-start border-b border-gray-800 pb-4">
        <div>
          <h3 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <font-awesome-icon icon="circle-check" class="text-teal-400" />
            <span>Resolve</span>
          </h3>
          <p class="text-xs text-gray-300 mt-1">Document the technical root cause and applied fix to close this ticket.</p>
        </div>
        <BaseButton 
          @click="$emit('close')" 
          variant="ghost" 
          size="icon-sm" 
          icon="xmark"
          class="text-gray-400 hover:text-white"
          title="Close modal"
        />
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
        <BaseTextarea
          v-model="form.rootCause"
          label="Root Cause"
          required
          rows="3"
          placeholder="e.g. POE power cable loose terminal"
          textarea-class="pb-12"
        >
          <template #action>
            <BaseButton
              type="button"
              @click="isRecording && activeRecordingField === 'rootCause' ? stopRecording() : startRecording('rootCause')"
              :disabled="isTranscribing"
              :loading="isTranscribing && activeRecordingField === 'rootCause'"
              :variant="isRecording && activeRecordingField === 'rootCause' ? 'danger' : 'secondary'"
              size="icon-sm"
              icon="microphone"
              :class="{ 'animate-pulse': isRecording && activeRecordingField === 'rootCause' }"
              :title="isTranscribing && activeRecordingField === 'rootCause' ? 'Transcribing audio...' : (isRecording && activeRecordingField === 'rootCause' ? 'Stop recording' : 'Record audio')"
            />
          </template>
        </BaseTextarea>

        <!-- Applied Solution Field -->
        <BaseTextarea
          v-model="form.appliedSolution"
          label="Applied Solution"
          required
          rows="3"
          placeholder="e.g. Secured ethernet cable connector, added zip-tie support"
          textarea-class="pb-12"
        >
          <template #action>
            <BaseButton
              type="button"
              @click="isRecording && activeRecordingField === 'appliedSolution' ? stopRecording() : startRecording('appliedSolution')"
              :disabled="isTranscribing"
              :loading="isTranscribing && activeRecordingField === 'appliedSolution'"
              :variant="isRecording && activeRecordingField === 'appliedSolution' ? 'danger' : 'secondary'"
              size="icon-sm"
              icon="microphone"
              :class="{ 'animate-pulse': isRecording && activeRecordingField === 'appliedSolution' }"
              :title="isTranscribing && activeRecordingField === 'appliedSolution' ? 'Transcribing audio...' : (isRecording && activeRecordingField === 'appliedSolution' ? 'Stop recording' : 'Record audio')"
            />
          </template>
        </BaseTextarea>

        <p v-if="audioError" class="text-xs text-accentCoral font-medium">{{ audioError }}</p>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-800">
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
            variant="primary"
            size="sm"
            icon="circle-check"
            :disabled="submitting || !form.rootCause || !form.appliedSolution"
            :loading="submitting"
            loading-text="Resolving..."
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
import { BaseButton, BaseTextarea } from './index';
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
