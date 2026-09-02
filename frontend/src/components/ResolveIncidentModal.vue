<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-bgCard w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-gray-100 flex flex-col space-y-6">
      <div>
        <h3 class="text-xl font-extrabold text-primaryNavy tracking-tight">Resolve Incident</h3>
        <p class="text-sm text-gray-500 mt-1">Please document the technical root cause and applied fix to close this incident and save it to the Knowledge Base.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider mb-2">Root Cause</label>
          <textarea
            v-model="form.rootCause"
            required
            rows="3"
            placeholder="e.g. POE power cable loose terminal"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-primaryNavy uppercase tracking-wider mb-2">Applied Solution</label>
          <textarea
            v-model="form.appliedSolution"
            required
            rows="3"
            placeholder="e.g. Secured ethernet cable connector, added zip-tie support"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50"
          >
            {{ submitting ? 'Saving...' : 'Resolve Ticket' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const props = defineProps({
  incidentId: { type: String, required: true }
});

const emit = defineEmits(['close', 'resolved']);
const authStore = useAuthStore();

const form = ref({ rootCause: '', appliedSolution: '' });
const submitting = ref(false);

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
</script>
