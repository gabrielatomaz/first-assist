<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fadeIn overflow-y-auto">
    <div class="bg-bgCard border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-3.5 relative my-auto">
      <button 
        @click="$emit('close')" 
        class="absolute top-3.5 right-3.5 text-gray-400 hover:text-white transition font-bold text-base cursor-pointer"
      >
        ✕
      </button>

      <div class="space-y-0.5 pr-6">
        <h3 class="text-base font-extrabold text-primaryTeal flex items-center gap-2">
          <font-awesome-icon icon="id-card" class="text-primaryTeal text-sm" />
          Request FTA Access
        </h3>
        <p class="text-[11px] text-gray-400 leading-tight">
          Submit a request to Administrators to receive FTA permissions for competition events.
        </p>
      </div>

      <div v-if="success" class="p-3 bg-accentGreen/10 border border-accentGreen/30 rounded-xl space-y-2 text-center">
        <font-awesome-icon icon="check-circle" class="text-2xl text-accentGreen" />
        <h4 class="text-xs font-bold text-white">Access Request Submitted!</h4>
        <p class="text-[11px] text-gray-300">
          An administrator will review your request. Once approved, your account will be updated with FTA privileges.
        </p>
        <button 
          @click="$emit('close')" 
          class="mt-2 w-full py-1.5 bg-primaryTeal hover:bg-primaryTeal/90 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-sm"
        >
          Close
        </button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-2.5">
        <div>
          <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Full Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="e.g. Alex Volunteer"
            class="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Email Address</label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            placeholder="alex@firstinspires.org"
            class="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Password</label>
            <input 
              v-model="form.password" 
              type="password" 
              required 
              placeholder="******"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Confirm Password</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              required 
              placeholder="******"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
            />
          </div>
        </div>
        <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="mt-1.5 text-[10px] text-accentCoral font-semibold flex items-center space-x-1 animate-fadeIn">
          <font-awesome-icon icon="circle-exclamation" class="text-[10px]" />
          <span>Passwords do not match.</span>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Registered Competition Event(s)</label>
          <div v-if="loadingEvents" class="text-xs text-gray-400 py-1">Loading events...</div>
          <div v-else-if="events.length === 0" class="text-xs text-gray-500 py-1 italic">No registered events available. Enter a TBA Key below.</div>
          <div v-else class="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
            <label 
              v-for="ev in events" 
              :key="ev.code" 
              class="flex items-center space-x-2 p-1.5 rounded-lg bg-bgMain border border-gray-800 hover:border-gray-700 cursor-pointer transition text-xs"
            >
              <input 
                type="checkbox" 
                :value="ev.code" 
                v-model="form.requestedEventCodes"
                class="rounded border-gray-700 text-primaryTeal focus:ring-primaryTeal/20 bg-bgCard"
              />
              <span class="text-textMain font-semibold text-xs">{{ ev.name }} ({{ ev.code }})</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Or Request New Event (TBA Event Key)</label>
          <div class="flex space-x-1.5">
            <div class="relative flex-1">
              <input 
                v-model="form.tbaEventKey" 
                @input="handleTbaKeyChange"
                @keydown.enter.prevent="validateTbaEvent"
                type="text" 
                placeholder="e.g. 2026brba"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
              />
            </div>
            <button 
              type="button" 
              @click="validateTbaEvent"
              :disabled="!form.tbaEventKey || validatingEvent"
              class="px-2.5 py-1.5 flex items-center justify-center bg-primaryTeal/20 hover:bg-primaryTeal/30 text-primaryTeal font-bold border border-primaryTeal/40 rounded-lg text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-sm"
              title="Validate on TBA"
            >
              <font-awesome-icon v-if="validatingEvent" icon="spinner" spin class="text-xs" />
              <font-awesome-icon v-else icon="magnifying-glass" class="text-xs" />
            </button>
          </div>

          <!-- Verified Event Badge -->
          <div v-if="verifiedEvent" class="mt-1.5 flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg animate-fadeIn">
            <font-awesome-icon icon="circle-check" class="text-xs text-emerald-400 flex-shrink-0" />
            <span class="font-medium truncate text-xs">
              <strong class="text-white font-mono uppercase">{{ verifiedEvent.code }}</strong> — {{ verifiedEvent.name }}
              <span v-if="verifiedEvent.location" class="text-gray-400 text-[10px]">({{ verifiedEvent.location }})</span>
            </span>
          </div>

          <!-- Event Validation Error -->
          <div v-else-if="eventError" class="mt-1.5 text-[10px] text-accentCoral font-semibold flex items-center space-x-1">
            <font-awesome-icon icon="circle-exclamation" class="text-[10px]" />
            <span>{{ eventError }}</span>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-primaryTeal uppercase tracking-wider mb-1">Notes / Justification (Optional)</label>
          <textarea 
            v-model="form.notes" 
            rows="1.5" 
            placeholder="Mention your volunteer assignment..."
            class="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal resize-none"
          ></textarea>
        </div>

        <div v-if="error && error !== eventError" class="p-2 bg-red-950/40 border border-red-900/30 text-accentCoral text-xs rounded-lg font-medium animate-fadeIn">
          {{ error }}
        </div>

        <div class="flex items-center justify-end space-x-2 pt-1">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-3.5 py-1.5 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs hover:bg-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="submitting || (form.requestedEventCodes.length === 0 && !form.tbaEventKey) || (form.password !== form.confirmPassword)"
            class="px-4 py-1.5 bg-primaryTeal hover:brightness-95 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <font-awesome-icon v-if="submitting" icon="spinner" spin class="text-xs" />
            <span>Submit</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getApiUrl } from '../config/api';

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
