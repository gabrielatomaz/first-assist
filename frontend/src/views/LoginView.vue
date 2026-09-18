<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <BaseCard padding="p-8" class="w-full max-w-md shadow-xl hover:shadow-2xl transition duration-300">
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
        <h2 class="text-3xl font-extrabold text-teal-400 tracking-tight">FIRST Assist</h2>
        <p class="text-sm text-gray-400 mt-2">Sign in to coordinate technical support</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <BaseInput
          v-model="email"
          type="email"
          label="Email Address"
          required
          placeholder="csa@first.org"
          autocomplete="email"
        />

        <BaseInput
          v-model="password"
          type="password"
          label="Password"
          required
          placeholder="******"
          autocomplete="current-password"
          input-class="font-mono"
        />

        <AlertBanner v-if="error" type="error" :message="error" />

        <BaseButton
          type="submit"
          :loading="loading"
          loading-text="Signing in..."
          variant="primary"
          size="md"
          class="w-full"
        >
          Sign In
        </BaseButton>
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

      <!-- Guest Incident Action -->
      <div class="bg-bgMain p-4 rounded-xl border border-borderDefault text-center space-y-2.5">
        <p class="text-xs text-textMuted font-medium">Need technical assistance at the pits?</p>
        <div>
          <BaseButton 
            type="button" 
            @click="showPublicModal = true"
            variant="secondary"
            size="sm"
            icon="circle-plus"
            class="text-teal-400 hover:text-teal-300"
          >
            Request CSA Support
          </BaseButton>
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-textMuted border-t border-borderSubtle pt-5 space-y-2.5">
        <p>If you need account access, please see the FTA or event Administrator.</p>
        <div>
          <BaseButton 
            type="button" 
            @click="showRequestModal = true"
            variant="secondary"
            size="sm"
            icon="id-card"
            class="text-accentYellow hover:text-amber-300"
          >
            Request FTA Event Access
          </BaseButton>
        </div>
      </div>
    </BaseCard>

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
import {
  BaseCard,
  BaseInput,
  AccessRequestModal,
  PublicReportModal,
  AlertBanner,
  BaseButton
} from '../components';

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
