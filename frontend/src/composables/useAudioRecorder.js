import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

export function useAudioRecorder() {
  const authStore = useAuthStore();
  const isRecording = ref(false);
  const isTranscribing = ref(false);
  const audioError = ref(null);
  const activeField = ref(null);
  const transcriptionResult = ref(null);

  let mediaRecorder = null;
  let audioChunks = [];
  let mediaStream = null;

  const startRecording = async (fieldName = 'description') => {
    audioError.value = null;
    transcriptionResult.value = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      audioError.value = 'Audio recording is not supported in this browser environment.';
      return false;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];

      // Determine best supported audio mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
      mediaRecorder = new MediaRecorder(mediaStream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start();
      isRecording.value = true;
      activeField.value = fieldName;
      return true;
    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        audioError.value = 'Microphone permission was denied. Please allow microphone access to record.';
      } else {
        audioError.value = `Unable to access microphone: ${err.message}`;
      }
      isRecording.value = false;
      activeField.value = null;
      return false;
    }
  };

  const stopRecordingAndTranscribe = async (mode = 'create') => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      return null;
    }

    const fieldName = activeField.value;

    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        // Stop all audio tracks to release microphone hardware
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          mediaStream = null;
        }

        isRecording.value = false;
        isTranscribing.value = true;

        try {
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunks, { type: mimeType });

          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('mode', mode);

          const headers = {};
          if (authStore.token) {
            headers['Authorization'] = `Bearer ${authStore.token}`;
          }

          const response = await fetch(getApiUrl('/incidents/transcribe'), {
            method: 'POST',
            headers,
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to transcribe audio. Please try again.');
          }

          const data = await response.json();
          transcriptionResult.value = data;
          resolve({ field: fieldName, ...data });
        } catch (err) {
          console.error('Transcription API error:', err);
          audioError.value = err.message || 'Error occurred during audio transcription.';
          resolve(null);
        } finally {
          isTranscribing.value = false;
          activeField.value = null;
        }
      };

      mediaRecorder.stop();
    });
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
    isRecording.value = false;
    isTranscribing.value = false;
    activeField.value = null;
    audioChunks = [];
  };

  return {
    isRecording,
    isTranscribing,
    audioError,
    activeField,
    transcriptionResult,
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording
  };
}
