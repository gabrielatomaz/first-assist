import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const hasSpeechAPI = typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeechRecognition() {
  const authStore = useAuthStore();
  const isRecording = ref(false);
  const isTranscribing = ref(false);
  const audioError = ref(null);
  const activeField = ref(null);

  // --- Web Speech API state ---
  let recognition = null;
  let finalTranscript = '';

  // --- MediaRecorder fallback state ---
  let mediaRecorder = null;
  let audioChunks = [];
  let mediaStream = null;

  // ========================
  // Web Speech API path
  // ========================
  const startSpeechAPI = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;
    finalTranscript = '';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        audioError.value = 'Microphone permission was denied. Please allow microphone access.';
      } else if (event.error !== 'aborted') {
        audioError.value = `Speech recognition error: ${event.error}`;
      }
      isRecording.value = false;
      activeField.value = null;
    };

    recognition.onend = () => {
      if (isRecording.value) {
        isRecording.value = false;
        activeField.value = null;
      }
    };

    recognition.start();
    isRecording.value = true;
    activeField.value = fieldName;
    return true;
  };

  const stopSpeechAPI = () => {
    if (!recognition) return Promise.resolve(null);
    const fieldName = activeField.value;

    return new Promise((resolve) => {
      recognition.onend = () => {
        isRecording.value = false;
        activeField.value = null;
        const text = finalTranscript.trim();
        resolve(text ? { field: fieldName, text } : null);
        recognition = null;
      };
      recognition.stop();
    });
  };

  // ========================
  // MediaRecorder + backend fallback
  // ========================
  const startMediaRecorder = async (fieldName) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      audioError.value = 'Audio recording is not supported in this browser.';
      return false;
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
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
      if (event.data && event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.start();
    isRecording.value = true;
    activeField.value = fieldName;
    return true;
  };

  const stopMediaRecorder = () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return Promise.resolve(null);
    const fieldName = activeField.value;

    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        if (mediaStream) {
          mediaStream.getTracks().forEach((t) => t.stop());
          mediaStream = null;
        }
        isRecording.value = false;
        isTranscribing.value = true;

        try {
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunks, { type: mimeType });

          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('mode', 'resolve'); // raw text only

          const headers = {};
          if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`;

          const response = await fetch(getApiUrl('/incidents/transcribe'), {
            method: 'POST',
            headers,
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to transcribe audio.');
          }

          const data = await response.json();
          resolve({ field: fieldName, text: data.text });
        } catch (err) {
          audioError.value = err.message || 'Error during audio transcription.';
          resolve(null);
        } finally {
          isTranscribing.value = false;
          activeField.value = null;
        }
      };
      mediaRecorder.stop();
    });
  };

  // ========================
  // Unified public API
  // ========================
  const startRecording = async (fieldName = 'description') => {
    audioError.value = null;
    try {
      if (hasSpeechAPI) {
        return startSpeechAPI(fieldName);
      }
      return await startMediaRecorder(fieldName);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        audioError.value = 'Microphone permission was denied. Please allow microphone access.';
      } else {
        audioError.value = `Unable to start recording: ${err.message}`;
      }
      isRecording.value = false;
      activeField.value = null;
      return false;
    }
  };

  const stopRecording = () => {
    if (hasSpeechAPI) return stopSpeechAPI();
    return stopMediaRecorder();
  };

  const cancelRecording = () => {
    if (recognition) {
      recognition.onend = null;
      recognition.abort();
      recognition = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    isRecording.value = false;
    isTranscribing.value = false;
    activeField.value = null;
    finalTranscript = '';
    audioChunks = [];
  };

  return {
    isRecording,
    isTranscribing,
    audioError,
    activeField,
    startRecording,
    stopRecording,
    cancelRecording
  };
}
