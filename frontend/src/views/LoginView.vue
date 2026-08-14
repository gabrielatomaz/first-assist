<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="w-full max-w-md bg-bgCard p-8 rounded-2xl shadow-xl border border-gray-800 transition duration-300 hover:shadow-2xl">
      <div class="text-center mb-8">
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
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal transition duration-200"
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

      <div class="mt-8 text-center text-xs text-gray-400 border-t pt-6">
        <p>If you need account access, please see the FTA or event Administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

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
