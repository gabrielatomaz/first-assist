<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-fadeIn text-textMain">
    <div>
      <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">My Profile</h2>
      <p class="text-sm text-gray-400 mt-1">Manage your account information, credentials, and password settings</p>
    </div>

    <!-- Basic Profile Info -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
      <h3 class="text-lg font-bold text-primaryTeal border-b border-gray-800 pb-3">Account Details</h3>
      
      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Full Name</label>
            <input v-model="profile.name" type="text" required class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Email Address</label>
            <input v-model="profile.email" type="email" required class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Designated Role</label>
          <input :value="profile.role" type="text" disabled class="w-full px-4 py-2.5 rounded-lg border border-gray-800 bg-bgMain/60 text-gray-400 text-sm font-mono uppercase tracking-wider">
        </div>

        <div v-if="profileError" class="text-accentCoral text-xs font-medium p-3 bg-red-950/40 rounded">
          {{ profileError }}
        </div>
        <div v-if="profileSuccess" class="text-green-400 border border-green-900/30 text-xs font-medium p-3 bg-green-950/40 rounded">
          Profile updated successfully!
        </div>

        <button
          type="submit"
          :disabled="updatingProfile"
          class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50"
        >
          {{ updatingProfile ? 'Saving...' : 'Save Profile Changes' }}
        </button>
      </form>
    </div>

    <!-- Password Management -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
      <h3 class="text-lg font-bold text-primaryTeal border-b border-gray-800 pb-3">Update Password</h3>
      
      <form @submit.prevent="handlePasswordChange" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Current Password</label>
          <input v-model="passwordForm.currentPassword" type="password" required class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">New Password</label>
            <input v-model="passwordForm.newPassword" type="password" required class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Confirm New Password</label>
            <input v-model="passwordForm.confirmPassword" type="password" required class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
        </div>

        <div v-if="passwordError" class="text-accentCoral text-xs font-medium p-3 bg-red-950/40 rounded">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="text-green-400 border border-green-900/30 text-xs font-medium p-3 bg-green-950/40 rounded">
          Password updated successfully!
        </div>

        <button
          type="submit"
          :disabled="changingPassword"
          class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50"
        >
          {{ changingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();

const profile = ref({ name: '', email: '', role: '' });
const loading = ref(true);
const profileError = ref(null);
const profileSuccess = ref(false);
const updatingProfile = ref(false);

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const passwordError = ref(null);
const passwordSuccess = ref(false);
const changingPassword = ref(false);

const fetchProfile = async () => {
  loading.value = true;
  try {
    const response = await fetch(getApiUrl('/profile'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to load profile details');
    profile.value = await response.json();
  } catch (err) {
    profileError.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleUpdateProfile = async () => {
  updatingProfile.value = true;
  profileError.value = null;
  profileSuccess.value = false;
  try {
    const response = await fetch(getApiUrl('/profile'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ name: profile.value.name, email: profile.value.email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    
    profile.value = data;
    profileSuccess.value = true;
    
    // Update Pinia state and localStorage
    authStore.user = data;
    localStorage.setItem('user', JSON.stringify(data));
  } catch (err) {
    profileError.value = err.message;
  } finally {
    updatingProfile.value = false;
  }
};

const handlePasswordChange = async () => {
  passwordError.value = null;
  passwordSuccess.value = false;
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match';
    return;
  }

  changingPassword.value = true;
  try {
    const response = await fetch(getApiUrl('/profile/password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to change password');
    
    passwordSuccess.value = true;
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  } catch (err) {
    passwordError.value = err.message;
  } finally {
    changingPassword.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>
