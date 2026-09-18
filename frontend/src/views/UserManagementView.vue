<template>
  <div class="space-y-8 text-textMain">
    <PageHeader
      title="User Management"
      subtitle="Manage system accounts, access levels, and active volunteers"
    >
      <template #actions>
        <button
          @click="showCreateForm = !showCreateForm"
          :class="showCreateForm ? 'w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg transition cursor-pointer flex-shrink-0' : 'bg-teal-600 hover:bg-teal-500 text-gray-200 font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-sm'"
          :title="showCreateForm ? 'Cancel' : 'Register'"
        >
          <font-awesome-icon :icon="showCreateForm ? 'xmark' : 'user-plus'" class="text-xs" />
          <span v-if="!showCreateForm">Register</span>
        </button>
      </template>
    </PageHeader>

    <!-- Create User Card -->
    <div v-if="showCreateForm" class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 animate-fadeIn">
      <h3 class="text-lg font-bold text-teal-400 mb-4">Register Authorized Volunteer</h3>
      <form @submit.prevent="handleCreateUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. John Doe" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm placeholder-gray-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
            <input v-model="form.email" type="email" required placeholder="csa@first.org" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm placeholder-gray-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Temporary Password</label>
            <input v-model="form.password" type="password" required placeholder="******" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm placeholder-gray-500 font-mono">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">System Role</label>
            <CustomSelect
              v-model="form.role"
              :options="roleOptions"
              button-class="py-2.5 px-4 text-sm"
            />
          </div>
        </div>

        <AlertBanner v-if="createError" type="error" :message="createError" />

        <button
          type="submit"
          :disabled="creating"
          class="bg-teal-600 hover:bg-teal-500 text-gray-200 font-bold py-2.5 px-6 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50 cursor-pointer"
        >
          {{ creating ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>

    <!-- Users Table -->
    <div class="bg-bgCard rounded-2xl shadow overflow-hidden border border-gray-800">
      <LoadingSpinner v-if="loading" text="Loading users list..." />

      <AlertBanner v-else-if="error" type="error" :message="error" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-teal-400">
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Assigned Regional(s)</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800 text-sm text-gray-300">
            <tr v-for="user in users" :key="user._id" class="hover:bg-bgMain/30 transition">
              <td class="px-6 py-4 font-semibold text-white">{{ user.name }}</td>
              <td class="px-6 py-4 font-mono text-xs">{{ user.email }}</td>
              <td class="px-6 py-4">
                <RoleBadge :role="user.role" />
              </td>

              <!-- Assigned Regionals Column -->
              <td class="px-6 py-4">
                <!-- Single active regional dropdown for CSA -->
                <div v-if="user.role === 'CSA'" class="flex items-center space-x-2">
                  <CustomSelect
                    v-model="user.assignedEventCode"
                    :options="csaUserEventOptions"
                    @change="saveUserEventAssignment(user)"
                    class="w-56 font-bold"
                  />
                </div>

                <!-- Multi-regional assignment for FTA (Editable by Admin) -->
                <div v-else-if="user.role === 'FTA'" class="space-y-2 max-w-xs">
                  <div v-if="authStore.isAdmin" class="flex items-center space-x-2">
                    <CustomSelect
                      :model-value="''"
                      :options="ftaAddRegionalOptions"
                      @change="addFTARegionalValue(user, $event)"
                      class="w-56 font-bold"
                    />
                  </div>

                  <!-- Selected Badges with Remove (x) Button -->
                  <div class="flex flex-wrap items-center gap-1.5 pt-1">
                    <span
                      v-for="code in (user.assignedEventCodes || [])"
                      :key="code"
                      class="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-teal-500/15 text-teal-400 border border-teal-500/25"
                    >
                      <span>{{ code }}</span>
                      <button
                        v-if="authStore.isAdmin"
                        @click="removeFTARegionalValue(user, code)"
                        class="text-teal-300 hover:text-white transition ml-1 text-xs cursor-pointer"
                        title="Remove regional"
                      >
                        ✕
                      </button>
                    </span>
                    <span v-if="!user.assignedEventCodes || user.assignedEventCodes.length === 0" class="text-[10px] text-gray-400 italic">No regionals assigned</span>
                  </div>
                </div>

                <span v-else class="text-xs text-gray-400 italic">N/A (Admin)</span>
              </td>

              <td class="px-6 py-4">
                <StatusBadge :status="user.status || 'ACTIVE'" size="sm" />
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="canModifyUser(user)"
                  @click="toggleUserStatus(user)"
                  :disabled="updatingStatus === user._id"
                  :class="user.status === 'ACTIVE' ? 'text-accentCoral hover:text-accentCoral/80' : 'text-accentGreen hover:text-accentGreen/80'"
                  class="text-xs font-semibold hover:underline disabled:opacity-50 transition"
                >
                  {{ user.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate' }}
                </button>
                <span v-else class="text-xs text-gray-400 italic">Protected</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  CustomSelect,
  PageHeader,
  RoleBadge,
  StatusBadge,
  LoadingSpinner,
  AlertBanner
} from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();

const roleOptions = computed(() => {
  if (authStore.isFTA && !authStore.isAdmin) {
    return [
      { value: 'CSA', label: 'Control System Advisor (CSA)' }
    ];
  }
  const opts = [
    { value: 'CSA', label: 'Control System Advisor (CSA)' },
    { value: 'FTA', label: 'FIRST Technical Advisor (FTA)' }
  ];
  if (authStore.isAdmin) {
    opts.push({ value: 'ADMIN', label: 'Administrator' });
  }
  return opts;
});

const availableEventsForUser = computed(() => {
  if (authStore.isAdmin) return events.value;
  const assigned = [];
  if (authStore.user?.assignedEventCode) assigned.push(authStore.user.assignedEventCode);
  if (Array.isArray(authStore.user?.assignedEventCodes)) assigned.push(...authStore.user.assignedEventCodes);
  const uniqueAssigned = Array.from(new Set(assigned.filter(Boolean)));
  return events.value.filter(e => uniqueAssigned.includes(e.code));
});

const csaUserEventOptions = computed(() => [
  { value: null, label: 'Unassigned' },
  ...availableEventsForUser.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
]);

const ftaAddRegionalOptions = computed(() => [
  { value: '', label: '+ Add Regional to FTA' },
  ...events.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
]);

const addFTARegionalValue = async (user, code) => {
  if (!code) return;
  if (!user.assignedEventCodes) user.assignedEventCodes = [];
  if (!user.assignedEventCodes.includes(code)) {
    user.assignedEventCodes.push(code);
    await saveUserEventAssignment(user);
  }
};

const users = ref([]);
const events = ref([]);
const loading = ref(true);
const error = ref(null);
const showCreateForm = ref(false);

const availableEvents = computed(() => {
  if (authStore.isAdmin) return events.value;
  if (authStore.isFTA) {
    const assigned = authStore.user?.assignedEventCodes || [];
    if (assigned.length > 0) {
      return events.value.filter(e => assigned.includes(e.code));
    }
  }
  return events.value;
});

const form = ref({ name: '', email: '', password: '', role: 'CSA' });
const creating = ref(false);
const createError = ref(null);
const updatingStatus = ref(null);

const canModifyUser = (targetUser) => {
  if (authStore.isAdmin) return true;
  if (authStore.isFTA) {
    return targetUser.role !== 'FTA' && targetUser.role !== 'ADMIN';
  }
  return false;
};

const fetchEvents = async () => {
  try {
    const response = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      events.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to load events:', err);
  }
};

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(getApiUrl('/users'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users list');
    const data = await response.json();
    users.value = data.map(u => ({
      ...u,
      assignedEventCodes: u.assignedEventCodes || []
    }));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const saveUserEventAssignment = async (user) => {
  try {
    const payload = {};
    if (user.role === 'FTA') {
      payload.assignedEventCodes = user.assignedEventCodes || [];
    } else {
      payload.assignedEventCode = user.assignedEventCode || null;
    }

    const response = await fetch(getApiUrl(`/users/${user._id}/assigned-event`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update event context');
  } catch (err) {
    alert(err.message);
  }
};

const addFTARegional = async (user, event) => {
  const code = event.target.value;
  if (!code) return;
  if (!user.assignedEventCodes) user.assignedEventCodes = [];
  if (!user.assignedEventCodes.includes(code)) {
    user.assignedEventCodes.push(code);
    await saveUserEventAssignment(user);
  }
  event.target.value = '';
};

const removeFTARegional = async (user, code) => {
  if (!user.assignedEventCodes) return;
  user.assignedEventCodes = user.assignedEventCodes.filter(c => c !== code);
  await saveUserEventAssignment(user);
};

const handleCreateUser = async () => {
  creating.value = true;
  createError.value = null;
  try {
    const response = await fetch(getApiUrl('/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(form.value)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create user');
    
    users.value.unshift({ ...data, assignedEventCodes: data.assignedEventCodes || [] });
    showCreateForm.value = false;
    form.value = { name: '', email: '', password: '', role: 'CSA' };
  } catch (err) {
    createError.value = err.message;
  } finally {
    creating.value = false;
  }
};

const toggleUserStatus = async (user) => {
  updatingStatus.value = user._id;
  const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const response = await fetch(getApiUrl(`/users/${user._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to toggle account status');
    
    user.status = data.status;
  } catch (err) {
    alert(err.message);
  } finally {
    updatingStatus.value = null;
  }
};

onMounted(() => {
  fetchEvents();
  fetchUsers();
});
</script>
