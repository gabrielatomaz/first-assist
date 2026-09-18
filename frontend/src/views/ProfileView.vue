<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-fadeIn text-textMain">
    <PageHeader
      title="My Profile"
      subtitle="Manage your account information, credentials, and avatar preferences"
    />

    <!-- Basic Profile Info & Avatar Selector -->
    <BaseCard class="space-y-6">
      <h3 class="text-lg font-bold text-teal-400 border-b border-gray-800 pb-3">Account Details</h3>
      
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="profile.name"
            label="Full Name"
            required
            placeholder="e.g. John Doe"
          />
          <BaseInput
            v-model="profile.email"
            type="email"
            label="Email Address"
            required
            placeholder="csa@first.org"
          />
        </div>

        <div>
          <BaseInput
            :model-value="profile.role"
            label="Designated Role"
            disabled
            :input-class="`${roleTextColor} font-mono font-bold uppercase tracking-wider`"
          />
        </div>

        <!-- Avatar Customization -->
        <div class="border-t border-gray-800 pt-5 space-y-4">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Profile Avatar Customization</label>

          <div class="flex flex-col sm:flex-row items-center gap-6 bg-bgMain/60 p-4 rounded-xl border border-gray-800">
            <!-- Live Preview -->
            <div class="flex flex-col items-center space-y-2 flex-shrink-0">
              <UserAvatar :icon="profile.avatarIcon" :color="profile.avatarColor" size="xl" :has-bg="true" />
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
                    :class="profile.avatarIcon === iconItem ? 'bg-teal-600 text-gray-200 border-teal-500 ring-2 ring-teal-500/50 font-bold' : 'bg-bgMain text-gray-400 hover:text-white border-gray-800 hover:border-gray-700'"
                    class="w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition duration-150 cursor-pointer"
                  >
                    <font-awesome-icon :icon="iconItem" />
                  </button>
                </div>
              </div>

              <!-- Select Color Swatch -->
              <div>
                <span class="block text-xs text-gray-300 font-semibold mb-2">Icon Color</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="colorItem in colorOptions"
                    :key="colorItem.hex"
                    type="button"
                    @click="profile.avatarColor = colorItem.hex"
                    :style="{ backgroundColor: colorItem.hex }"
                    :class="profile.avatarColor === colorItem.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-bgCard scale-110' : 'opacity-85 hover:opacity-100 hover:scale-105'"
                    class="w-7 h-7 rounded-full transition duration-150 cursor-pointer shadow-sm border border-black/20"
                    :title="colorItem.name"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertBanner v-if="profileError" type="error" :message="profileError" />
        <AlertBanner v-if="profileSuccess" type="success" message="Profile updated successfully!" />

        <BaseButton
          type="submit"
          :loading="updatingProfile"
          loading-text="Saving..."
          variant="primary"
          size="md"
        >
          Save Profile
        </BaseButton>
      </form>
    </BaseCard>

    <!-- Password Management -->
    <BaseCard class="space-y-6">
      <h3 class="text-lg font-bold text-teal-400 border-b border-gray-800 pb-3">Update Password</h3>
      
      <form @submit.prevent="handlePasswordChange" class="space-y-4">
        <div>
          <BaseInput
            v-model="passwordForm.currentPassword"
            type="password"
            label="Current Password"
            required
            placeholder="******"
            input-class="font-mono"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="passwordForm.newPassword"
            type="password"
            label="New Password"
            required
            placeholder="******"
            input-class="font-mono"
          />
          <BaseInput
            v-model="passwordForm.confirmPassword"
            type="password"
            label="Confirm New Password"
            required
            placeholder="******"
            input-class="font-mono"
          />
        </div>

        <AlertBanner v-if="passwordError" type="error" :message="passwordError" />
        <AlertBanner v-if="passwordSuccess" type="success" message="Password updated successfully!" />

        <BaseButton
          type="submit"
          :loading="changingPassword"
          loading-text="Updating..."
          variant="primary"
          size="md"
        >
          Update Password
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';
import {
  BaseCard,
  BaseInput,
  PageHeader,
  AlertBanner,
  BaseButton,
  UserAvatar
} from '../components';

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
  { name: 'Primary Teal', hex: '#38777E', value: '#38777E', label: 'Primary Teal' },
  { name: 'Accent Coral', hex: '#E25C43', value: '#E25C43', label: 'Accent Coral' },
  { name: 'Accent Yellow', hex: '#E5B25D', value: '#E5B25D', label: 'Accent Yellow' },
  { name: 'Accent Purple', hex: '#9D85C5', value: '#9D85C5', label: 'Accent Purple' },
  { name: 'Emerald Green', hex: '#10B981', value: '#10B981', label: 'Emerald Green' },
  { name: 'Sky Blue', hex: '#38BDF8', value: '#38BDF8', label: 'Sky Blue' },
  { name: 'Text Light', hex: '#E2E8F0', value: '#E2E8F0', label: 'Text Light' }
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
