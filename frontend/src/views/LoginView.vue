<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="w-full max-w-md bg-bgCard p-8 rounded-2xl shadow-xl border border-gray-800 transition duration-300 hover:shadow-2xl">
      <div class="text-center mb-8 flex flex-col items-center">
        <!-- FIRST Assist Master Vector Brand Logo Emblem -->
        <div class="w-16 h-16 mb-4 shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition duration-200">
          <svg viewBox="0 0 512 512" class="w-full h-full">
            <rect width="512" height="512" rx="112" fill="#2F4F6F" />
            <path d="M 256 84 L 404 170 L 404 342 L 256 428 L 108 342 L 108 170 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-opacity="0.14" stroke-linejoin="round" />
            <path d="M 160 360 L 160 160 L 320 160 M 160 250 L 280 250" fill="none" stroke="#4F7F82" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M 256 160 L 352 360 M 204 290 L 320 290" fill="none" stroke="#DAAB52" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Terminal 1: Triangle (Red #ED1C24) -->
            <polygon points="160,124 190,178 130,178" fill="#ED1C24" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
            <!-- Terminal 2: Circle (White with Outer & Inner Gray #94A3B8) -->
            <circle cx="256" cy="160" r="27" fill="#FFFFFF" stroke="#94A3B8" stroke-width="4" />
            <circle cx="256" cy="160" r="9" fill="#94A3B8" />
            <!-- Terminal 3: Square (Blue #0066B3) -->
            <rect x="326" y="334" width="52" height="52" rx="8" fill="#0066B3" stroke="#FFFFFF" stroke-width="5" />
          </svg>
        </div>
        <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">FIRST Assist</h2>
        <p class="text-sm text-gray-400 mt-2">Sign in to coordinate technical support</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="csa@first.org"
            class="w-full px-4 py-3 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal transition duration-200"
          >
        </div>

        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="******"
            class="w-full px-4 py-3 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal transition duration-200 font-mono"
          >
        </div>

        <div v-if="error" class="bg-red-950/40 border-l-4 border-accentCoral p-4 rounded text-sm text-accentCoral font-medium">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
          <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-800"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-bgCard px-3 text-gray-500 font-mono">OR</span>
        </div>
      </div>

      <!-- Guest Incident Action (Clean Text Link) -->
      <div class="bg-bgMain p-4 rounded-xl border border-gray-800 text-center space-y-2">
        <p class="text-xs text-gray-400 font-medium">Need technical assistance at the pits?</p>
        <div>
          <button 
            type="button" 
            @click="showPublicModal = true"
            class="text-xs font-bold text-primaryTeal hover:underline inline-flex items-center space-x-1.5 cursor-pointer transition duration-150"
          >
            <font-awesome-icon icon="plus-circle" class="text-xs" />
            <span>Request CSA Support</span>
          </button>
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-gray-400 border-t border-gray-800 pt-5 space-y-2">
        <p>If you need account access, please see the FTA or event Administrator.</p>
        <div>
          <button 
            type="button" 
            @click="showRequestModal = true"
            class="text-xs font-bold text-primaryTeal hover:underline inline-flex items-center space-x-1.5 cursor-pointer transition duration-150"
          >
            <font-awesome-icon icon="id-card" class="text-xs" />
            <span>Request FTA Event Access</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Access Request Modal -->
    <AccessRequestModal 
      v-if="showRequestModal" 
      @close="showRequestModal = false" 
    />

    <!-- Public Guest Report Modal -->
    <PublicReportModal
      v-if="showPublicModal"
      @close="showPublicModal = false"
      @submitted="showPublicModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { AccessRequestModal, PublicReportModal } from '../components';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const showRequestModal = ref(false);
const showPublicModal = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Authentication failed. Please verify credentials.';
  } finally {
    loading.value = false;
  }
};
</script>
