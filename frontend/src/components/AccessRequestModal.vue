<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div class="bg-bgCard border border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 relative">
      <button 
        @click="$emit('close')" 
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition font-bold text-lg cursor-pointer"
      >
        ✕
      </button>

      <div class="space-y-1">
        <h3 class="text-xl font-extrabold text-primaryTeal flex items-center gap-2">
          <font-awesome-icon icon="id-card" class="text-primaryTeal" />
          Request FTA Event Access
        </h3>
        <p class="text-xs text-gray-400">
          Submit your request to System Administrators to receive FTA permissions for competition events.
        </p>
      </div>

      <div v-if="success" class="p-4 bg-green-950/40 border border-green-900/30 rounded-xl space-y-2 text-center">
        <font-awesome-icon icon="check-circle" class="text-3xl text-green-400" />
        <h4 class="text-sm font-bold text-white">Access Request Submitted!</h4>
        <p class="text-xs text-gray-300">
          An administrator will review your request. Once approved, your account will be updated with FTA privileges.
        </p>
        <button 
          @click="$emit('close')" 
          class="mt-3 w-full py-2 bg-primaryTeal text-slate-950 font-bold rounded-lg text-xs hover:bg-opacity-90 transition cursor-pointer"
        >
          Close
        </button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Full Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="e.g. Alex Volunteer"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Email Address</label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            placeholder="e.g. alex@firstinspires.org"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Account Password</label>
            <input 
              v-model="form.password" 
              type="password" 
              required 
              placeholder="****"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Confirm Password</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              required 
              placeholder="****"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
            />
          </div>
        </div>
        <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-[10px] text-accentCoral font-semibold">Passwords do not match.</p>

        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Registered Competition Event(s)</label>
          <div v-if="loadingEvents" class="text-xs text-gray-400 py-2">Loading events...</div>
          <div v-else-if="events.length === 0" class="text-xs text-gray-500 py-2 italic">No registered events available. Enter a TBA Event Key below.</div>
          <div v-else class="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
            <label 
              v-for="ev in events" 
              :key="ev.code" 
              class="flex items-center space-x-2.5 p-2 rounded-lg bg-bgMain border border-gray-800 hover:border-gray-700 cursor-pointer transition text-xs"
            >
              <input 
                type="checkbox" 
                :value="ev.code" 
                v-model="form.requestedEventCodes"
                class="rounded border-gray-700 text-primaryTeal focus:ring-primaryTeal/20 bg-bgCard"
              />
              <span class="text-textMain font-semibold">{{ ev.name }} ({{ ev.code }})</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Or Request New Event (TBA Event Key)</label>
          <input 
            v-model="form.tbaEventKey" 
            type="text" 
            placeholder="e.g. 2026brba or 2026brmp"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal font-mono"
          />
          <p class="text-[10px] text-gray-400 mt-1">If your event is not listed above, enter the official TBA key to import event & team roster upon approval.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-1.5">Notes / Justification (Optional)</label>
          <textarea 
            v-model="form.notes" 
            rows="2" 
            placeholder="Mention your volunteer assignment or role..."
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-primaryTeal"
          ></textarea>
        </div>

        <div v-if="error" class="p-3 bg-red-950/40 border border-red-900/30 text-accentCoral text-xs rounded-lg font-medium">
          {{ error }}
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs hover:bg-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="submitting || (form.requestedEventCodes.length === 0 && !form.tbaEventKey) || (form.password !== form.confirmPassword)"
            class="px-4 py-2 bg-primaryTeal text-slate-950 font-bold rounded-lg text-xs hover:bg-opacity-90 disabled:opacity-50 transition cursor-pointer flex items-center space-x-1.5"
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
