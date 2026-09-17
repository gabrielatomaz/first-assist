<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-fadeIn text-textMain">
    <div>
      <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">My Profile</h2>
      <p class="text-sm text-gray-400 mt-1">Manage your account information, credentials, and avatar preferences</p>
    </div>

    <!-- Basic Profile Info & Avatar Selector -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
      <h3 class="text-lg font-bold text-primaryTeal border-b border-gray-800 pb-3">Account Details</h3>
      
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <input :value="profile.role" type="text" disabled :class="roleTextColor" class="w-full px-4 py-2.5 rounded-lg border border-gray-800 bg-bgMain/60 text-sm font-mono font-bold uppercase tracking-wider">
        </div>

        <!-- Avatar Customization -->
        <div class="border-t border-gray-800 pt-5 space-y-4">
          <label class="block text-xs font-bold text-primaryTeal uppercase tracking-wider">Profile Avatar Customization</label>

          <div class="flex flex-col sm:flex-row items-center gap-6 bg-bgMain/60 p-4 rounded-xl border border-gray-800">
            <!-- Live Preview -->
            <div class="flex flex-col items-center space-y-2 flex-shrink-0">
              <UserAvatar :icon="profile.avatarIcon" :color="profile.avatarColor" size="xl" />
              <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live Preview</span>
            </div>

            <div class="space-y-4 flex-1 w-full">
              <!-- Select Icon -->
              <div>
                <span class="block text-xs text-gray-300 font-semibold mb-2">Icon Symbol</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="iconItem in iconOptions"
                    :key="iconItem"
                    type="button"
                    @click="profile.avatarIcon = iconItem"
                    :class="profile.avatarIcon === iconItem ? 'bg-primaryTeal text-white border-primaryTeal ring-2 ring-primaryTeal/50' : 'bg-bgMain text-gray-400 hover:text-white border-gray-700 hover:border-gray-600'"
                    class="w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition duration-150 cursor-pointer"
                  >
                    <font-awesome-icon :icon="iconItem" />
                  </button>
                </div>
              </div>

              <!-- Select Color Swatch -->
              <div>
                <span class="block text-xs text-gray-300 font-semibold mb-2">Icon Color</span>
                <div class="flex flex-wrap gap-2.5">
                  <button
                    v-for="colorItem in colorOptions"
                    :key="colorItem.hex"
                    type="button"
                    @click="profile.avatarColor = colorItem.hex"
                    :style="{ backgroundColor: colorItem.hex }"
                    :title="colorItem.name"
                    :class="profile.avatarColor === colorItem.hex ? 'ring-2 ring-white scale-110 shadow-md' : 'hover:scale-105 opacity-85 hover:opacity-100'"
                    class="w-7 h-7 rounded-full transition-all duration-150 shadow-sm cursor-pointer"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="profileError" class="text-accentCoral text-xs font-medium p-3 bg-red-950/40 rounded">
          {{ profileError }}
        </div>
        <div v-if="profileSuccess" class="text-accentGreen border border-accentGreen/30 text-xs font-medium p-3 bg-accentGreen/10 rounded">
          Profile updated successfully!
        </div>

        <button
          type="submit"
          :disabled="updatingProfile"
          class="bg-primaryTeal hover:brightness-95 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50 cursor-pointer"
        >
          {{ updatingProfile ? 'Saving...' : 'Save Profile' }}
        </button>
      </form>
    </div>

    <!-- Password Management -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-6">
      <h3 class="text-lg font-bold text-primaryTeal border-b border-gray-800 pb-3">Update Password</h3>
      
      <form @submit.prevent="handlePasswordChange" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Current Password</label>
          <input v-model="passwordForm.currentPassword" type="password" required placeholder="******" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500 font-mono">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">New Password</label>
            <input v-model="passwordForm.newPassword" type="password" required placeholder="******" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500 font-mono">
          </div>
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Confirm New Password</label>
            <input v-model="passwordForm.confirmPassword" type="password" required placeholder="******" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500 font-mono">
          </div>
        </div>

        <div v-if="passwordError" class="text-accentCoral text-xs font-medium p-3 bg-red-950/40 rounded">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="text-accentGreen border border-accentGreen/30 text-xs font-medium p-3 bg-accentGreen/10 rounded">
          Password updated successfully!
        </div>

        <button
          type="submit"
          :disabled="changingPassword"
          class="bg-primaryTeal hover:brightness-95 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50 cursor-pointer"
        >
          {{ changingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';
import UserAvatar from '../components/UserAvatar.vue';

const authStore = useAuthStore();

const roleTextColor = computed(() => {
  const r = (profile.value?.role || '').toUpperCase();
  if (r === 'ADMIN') return 'text-accentYellow';
  if (r === 'FTA') return 'text-purple-300';
  return 'text-primaryTeal'; // CSA
});

const iconOptions = [
  'user', 'robot', 'wrench', 'bolt', 'user-ninja',
  'laptop-code', 'microchip', 'gears', 'shield-halved', 'medal'
];

const colorOptions = [
  { name: 'Primary Teal', hex: '#38777E' },
  { name: 'Accent Coral', hex: '#E25C43' },
  { name: 'Accent Yellow', hex: '#E5B25D' },
  { name: 'Accent Purple', hex: '#9D85C5' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Text Light', hex: '#E2E8F0' }
];

const profile = ref({ name: '', email: '', role: '', avatarIcon: 'user', avatarColor: '#38777E' });
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
    const data = await response.json();
    profile.value = {
      name: data.name || '',
      email: data.email || '',
      role: data.role || '',
      avatarIcon: data.avatarIcon || 'user',
      avatarColor: data.avatarColor || '#4F7F82'
    };
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
      body: JSON.stringify({ 
        name: profile.value.name, 
        email: profile.value.email,
        avatarIcon: profile.value.avatarIcon,
        avatarColor: profile.value.avatarColor
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    
    profile.value = {
      ...profile.value,
      ...data
    };
    profileSuccess.value = true;
    
    // Update Pinia state and localStorage
    authStore.user = {
      ...authStore.user,
      ...data
    };
    localStorage.setItem('user', JSON.stringify(authStore.user));
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
