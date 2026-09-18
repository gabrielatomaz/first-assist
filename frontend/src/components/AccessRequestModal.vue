<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fadeIn overflow-y-auto">
    <div class="bg-bgCard border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 relative my-auto">
      <BaseButton 
        @click="$emit('close')" 
        variant="ghost"
        size="icon-sm"
        icon="xmark"
        class="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
        title="Close modal"
      />

      <div class="space-y-1 pr-8">
        <h3 class="text-lg font-extrabold text-teal-400 flex items-center gap-2">
          <font-awesome-icon icon="id-card" class="text-teal-400 text-sm" />
          Request FTA Access
        </h3>
        <p class="text-xs text-gray-400 leading-normal">
          Submit a request to Administrators to receive FTA permissions for competition events.
        </p>
      </div>

      <div v-if="success" class="p-4 bg-emerald-950/40 border border-emerald-800/30 rounded-xl space-y-2 text-center">
        <font-awesome-icon icon="circle-check" class="text-3xl text-emerald-400" />
        <h4 class="text-sm font-bold text-white">Access Request Submitted!</h4>
        <p class="text-xs text-gray-300">
          An administrator will review your request. Once approved, your account will be updated with FTA privileges.
        </p>
        <BaseButton 
          variant="primary"
          size="sm"
          @click="$emit('close')" 
          class="mt-2 w-full sm:w-auto"
        >
          Close
        </BaseButton>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseInput 
            v-model="form.name" 
            label="Full Name" 
            required 
            placeholder="e.g. Alex Volunteer"
            size="sm"
          />

          <BaseInput 
            v-model="form.email" 
            type="email" 
            label="Email Address" 
            required 
            placeholder="alex@firstinspires.org"
            size="sm"
            input-class="font-mono"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseInput 
            v-model="form.password" 
            type="password" 
            label="Password" 
            required 
            placeholder="******"
            size="sm"
            input-class="font-mono"
          />
          <BaseInput 
            v-model="form.confirmPassword" 
            type="password" 
            label="Confirm Password" 
            required 
            placeholder="******"
            size="sm"
            input-class="font-mono"
          />
        </div>
        <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-[10px] text-accentCoral font-semibold flex items-center space-x-1 animate-fadeIn">
          <font-awesome-icon icon="circle-exclamation" class="text-[10px]" />
          <span>Passwords do not match.</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Registered Competition Event(s)</label>
            <div v-if="loadingEvents" class="text-xs text-gray-400 py-1">Loading events...</div>
            <div v-else-if="events.length === 0" class="text-xs text-gray-500 py-1 italic">No registered events available.</div>
            <div v-else class="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
              <label 
                v-for="ev in events" 
                :key="ev.code" 
                class="flex items-center space-x-2 p-2 rounded-lg bg-bgMain border border-gray-800 hover:border-gray-700 cursor-pointer transition text-xs"
              >
                <input 
                  type="checkbox" 
                  :value="ev.code" 
                  v-model="form.requestedEventCodes"
                  class="rounded border-gray-700 text-teal-400 focus:ring-teal-500/20 bg-bgCard"
                />
                <span class="text-textMain font-semibold text-xs">{{ ev.name }} ({{ ev.code }})</span>
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Or Request New Event (TBA Key)</label>
            <div class="flex space-x-1.5">
              <BaseInput 
                v-model="form.tbaEventKey" 
                @input="handleTbaKeyChange"
                @keydown.enter.prevent="validateTbaEvent"
                placeholder="e.g. 2026brba"
                size="sm"
                input-class="font-mono"
                class="flex-1"
              />
              <BaseButton 
                type="button" 
                @click="validateTbaEvent" 
                :disabled="!form.tbaEventKey || validatingEvent" 
                :loading="validatingEvent" 
                variant="purple" 
                size="icon-sm" 
                icon="magnifying-glass" 
                title="Validate on TBA" 
              />
            </div>

            <!-- Verified Event Badge -->
            <div v-if="verifiedEvent" class="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg animate-fadeIn">
              <font-awesome-icon icon="circle-check" class="text-xs flex-shrink-0 text-emerald-400" />
              <span class="font-medium truncate text-xs">
                <strong class="text-white font-mono uppercase">{{ verifiedEvent.code }}</strong> — {{ verifiedEvent.name }}
                <span v-if="verifiedEvent.location" class="text-gray-400 text-[10px]">({{ verifiedEvent.location }})</span>
              </span>
            </div>

            <!-- Event Validation Error -->
            <div v-else-if="eventError" class="text-[10px] text-accentCoral font-semibold flex items-center space-x-1">
              <font-awesome-icon icon="circle-exclamation" class="text-[10px]" />
              <span>{{ eventError }}</span>
            </div>
          </div>
        </div>

        <div>
          <BaseTextarea 
            v-model="form.notes" 
            label="Notes / Justification (Optional)"
            rows="2" 
            placeholder="Mention your volunteer assignment..."
          />
        </div>

        <div v-if="error && error !== eventError" class="p-2 bg-red-950/40 border border-red-900/30 text-accentCoral text-xs rounded-lg font-medium animate-fadeIn">
          {{ error }}
        </div>

        <div class="flex items-center justify-end space-x-2 pt-1">
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
            :disabled="submitting || (form.requestedEventCodes.length === 0 && !form.tbaEventKey) || (form.password !== form.confirmPassword)"
            :loading="submitting"
            loading-text="Submitting..."
          >
            Submit Request
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getApiUrl } from '../config/api';
import BaseButton from './common/BaseButton.vue';
import BaseInput from './common/BaseInput.vue';
import BaseTextarea from './common/BaseTextarea.vue';

const emit = defineEmits(['close']);

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  requestedEventCodes: [],
  tbaEventKey: '',
  notes: ''
});

const events = ref([]);
const loadingEvents = ref(true);
const submitting = ref(false);
const success = ref(false);
const error = ref(null);

const validatingEvent = ref(false);
const verifiedEvent = ref(null);
const eventError = ref(null);

const handleTbaKeyChange = () => {
  verifiedEvent.value = null;
  eventError.value = null;
  error.value = null;
};

const validateTbaEvent = async () => {
  if (!form.value.tbaEventKey || !form.value.tbaEventKey.trim()) return;
  validatingEvent.value = true;
  eventError.value = null;
  verifiedEvent.value = null;
  error.value = null;
  try {
    const key = form.value.tbaEventKey.trim().toLowerCase();
    const res = await fetch(getApiUrl(`/access-requests/validate-event/${key}`));
    const data = await res.json();
    if (!res.ok || !data.valid) {
      throw new Error(data.error || `Event '${key}' was not found on The Blue Alliance.`);
    }
    verifiedEvent.value = data.event;
    form.value.tbaEventKey = data.event.code.toLowerCase();
  } catch (err) {
    eventError.value = err.message;
  } finally {
    validatingEvent.value = false;
  }
};

const fetchEvents = async () => {
  try {
    const res = await fetch(getApiUrl('/access-requests/events'));
    if (res.ok) {
      events.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load events:', err);
  } finally {
    loadingEvents.value = false;
  }
};

const handleSubmit = async () => {
  if (form.value.requestedEventCodes.length === 0 && !form.value.tbaEventKey) {
    error.value = 'Please select at least one registered event or enter a TBA Event Key.';
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match.';
    return;
  }

  // If a TBA Event Key is provided, validate it first
  if (form.value.tbaEventKey && form.value.tbaEventKey.trim()) {
    if (!verifiedEvent.value || verifiedEvent.value.code.toLowerCase() !== form.value.tbaEventKey.trim().toLowerCase()) {
      await validateTbaEvent();
      if (!verifiedEvent.value) {
        // Error is already shown directly under the TBA Event Key field
        return;
      }
    }
  }

  submitting.value = true;
  error.value = null;
  try {
    const res = await fetch(getApiUrl('/access-requests'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit request');
    success.value = true;
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchEvents();
});
</script>
