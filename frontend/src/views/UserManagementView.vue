<template>
  <div class="space-y-8 text-textMain">
    <PageHeader
      title="User Management"
      subtitle="Manage system accounts, access levels, and active volunteers"
    >
      <template #actions>
        <BaseButton
          v-if="showCreateForm"
          size="icon-sm"
          variant="secondary"
          icon="xmark"
          @click="showCreateForm = false"
          title="Cancel"
        />
        <BaseButton
          v-else
          size="sm"
          variant="primary"
          icon="user-plus"
          @click="showCreateForm = true"
          title="Register"
          class="w-10 h-10 sm:w-auto px-0 sm:px-3 flex-shrink-0"
        >
          <span class="hidden sm:inline">Register</span>
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Create User Card -->
    <BaseCard v-if="showCreateForm" class="animate-fadeIn">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-base font-bold text-teal-400">Register Authorized Volunteer</h3>
        <BaseButton
          variant="ghost"
          size="icon-sm"
          icon="xmark"
          @click="showCreateForm = false"
          title="Close form"
        />
      </div>
      <form @submit.prevent="handleCreateUser" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.name"
            label="Name"
            required
            placeholder="e.g. John Doe"
          />
          <BaseInput
            v-model="form.email"
            type="email"
            label="Email Address"
            required
            placeholder="csa@first.org"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.password"
            type="password"
            label="Temporary Password"
            required
            placeholder="******"
            input-class="font-mono"
          />
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">System Role</label>
            <CustomSelect
              v-model="form.role"
              :options="roleOptions"
            />
          </div>
        </div>

        <AlertBanner v-if="createError" type="error" :message="createError" />

        <div class="flex items-center justify-end gap-2 pt-2 w-full">
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            @click="showCreateForm = false"
            class="flex-1 sm:flex-none sm:w-28 justify-center"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            size="sm"
            :disabled="creating"
            :loading="creating"
            loading-text="Registering..."
            class="flex-1 sm:flex-none sm:w-28 justify-center"
          >
            Register
          </BaseButton>
        </div>
      </form>
    </BaseCard>

    <!-- Users Table -->
    <div class="bg-bgCard rounded-2xl shadow overflow-hidden border border-gray-800">
      <LoadingSpinner v-if="loading" text="Loading users list..." />

      <AlertBanner v-else-if="error" type="error" :message="error" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-teal-400">
              <th class="px-3 py-3.5 sm:px-4">Name</th>
              <th class="px-3 py-3.5 sm:px-4 w-full">Email</th>
              <th class="px-3 py-3.5 sm:px-4">Role</th>
              <th class="px-3 py-3.5 sm:px-4 whitespace-nowrap">Assigned Regional(s)</th>
              <th class="px-3 py-3.5 w-24 text-center">Status</th>
              <th class="px-3 py-3.5 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody :key="currentPage" class="divide-y divide-gray-800 text-sm text-gray-300 animate-fadeIn transition-all duration-300">
            <tr v-for="user in users" :key="user._id" class="hover:bg-bgMain/30 transition">
              <td class="px-3 py-3.5 sm:px-4 font-semibold text-white truncate max-w-[130px] sm:max-w-none" :title="user.name">{{ user.name }}</td>
              <td class="px-3 py-3.5 sm:px-4 font-mono text-xs truncate max-w-[150px] sm:max-w-none" :title="user.email">{{ user.email }}</td>
              <td class="px-3 py-3.5 sm:px-4 whitespace-nowrap">
                <RoleBadge :role="user.role" />
              </td>

              <!-- Assigned Regionals Column -->
              <td class="px-3 py-3.5 sm:px-4">
                <!-- Single active regional dropdown for CSA -->
                <div v-if="user.role === 'CSA'" class="w-full max-w-[220px] sm:max-w-[260px]">
                  <CustomSelect
                    v-model="user.assignedEventCode"
                    :options="csaUserEventOptions"
                    @change="saveUserEventAssignment(user)"
                    class="w-full font-bold"
                  />
                </div>

                <!-- Multi-regional assignment for FTA (Editable by Admin) -->
                <div v-else-if="user.role === 'FTA'" class="w-full max-w-[220px] sm:max-w-[260px] space-y-2">
                  <div v-if="authStore.isAdmin" class="w-full">
                    <CustomSelect
                      :model-value="''"
                      :options="ftaAddRegionalOptions"
                      @change="addFTARegionalValue(user, $event)"
                      class="w-full font-bold"
                    />
                  </div>

                  <!-- Selected Badges with Remove (x) Button -->
                  <div class="flex flex-wrap items-center gap-1.5 pt-1">
                    <span
                      v-for="code in (user.assignedEventCodes || [])"
                      :key="code"
                      class="inline-flex items-center space-x-1.5 h-6 px-2.5 rounded-md text-xs font-bold font-mono bg-teal-500/15 text-teal-400 border border-teal-500/25"
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

              <td class="px-3 py-3.5 text-center whitespace-nowrap">
                <button
                  v-if="canModifyUser(user)"
                  type="button"
                  @click="toggleUserStatus(user)"
                  :disabled="updatingStatus === user._id"
                  :title="`Click to change status to ${user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`"
                  class="cursor-pointer active:scale-95 transition inline-block"
                >
                  <StatusBadge :status="user.status || 'ACTIVE'" class="hover:brightness-125" />
                </button>
                <StatusBadge v-else :status="user.status || 'ACTIVE'" />
              </td>
              <td class="px-3 py-3.5 text-center whitespace-nowrap">
                <div v-if="canModifyUser(user)" class="inline-flex items-center justify-center">
                  <BaseButton
                    v-if="user.status === 'INACTIVE' && user._id !== authStore.user?._id"
                    variant="danger"
                    size="icon-xs"
                    icon="trash-can"
                    :loading="deletingUserId === user._id"
                    @click="confirmDeleteUser(user)"
                    title="Permanently Delete Inactive Account"
                  />
                  <span v-else-if="user.status === 'ACTIVE'" class="text-[11px] text-gray-500 italic font-mono">Active</span>
                </div>
                <span v-else class="text-xs text-gray-400 italic">Protected</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls (FTA Panel Style) -->
      <div v-if="totalPages > 1" class="flex justify-between items-center border-t border-gray-800 pt-4 p-4 text-xs text-gray-400">
        <span>Showing Page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} Total User Accounts)</span>
        <div class="flex space-x-2">
          <BaseButton 
            :disabled="currentPage === 1" 
            @click="fetchUsers(currentPage - 1)" 
            variant="secondary"
            size="icon-sm"
            icon="chevron-left"
            title="Previous Page"
          />
          <BaseButton 
            :disabled="currentPage === totalPages" 
            @click="fetchUsers(currentPage + 1)" 
            variant="secondary"
            size="icon-sm"
            icon="chevron-right"
            title="Next Page"
          />
        </div>
      </div>
    </div>

    <!-- Permanent User Deletion Modal -->
    <ConfirmationModal
      v-model="showDeleteModal"
      title="Permanently Delete User Account?"
      :message="`Are you sure you want to permanently delete user account '${userToDelete?.name}' (${userToDelete?.email})? This action cannot be undone.`"
      icon="triangle-exclamation"
      variant="danger"
      confirm-text="Delete Permanently"
      confirm-icon="trash-can"
      :loading="deletingUserId !== null"
      loading-text="Deleting..."
      @confirm="handleDeleteUser"
      @cancel="showDeleteModal = false; userToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  BaseCard,
  BaseInput,
  CustomSelect,
  ConfirmationModal,
  PageHeader,
  RoleBadge,
  StatusBadge,
  LoadingSpinner,
  AlertBanner,
  BaseButton
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

const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const limit = 5;

const fetchUsers = async (page = 1) => {
  loading.value = true;
  error.value = null;
  currentPage.value = page;
  try {
    const response = await fetch(getApiUrl(`/users?page=${page}&limit=${limit}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users list');
    const data = await response.json();
    const userList = data.users || (Array.isArray(data) ? data : []);
    totalPages.value = data.totalPages || 1;
    totalCount.value = data.total || userList.length;

    users.value = userList.map(u => ({
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

const showDeleteModal = ref(false);
const userToDelete = ref(null);
const deletingUserId = ref(null);

const confirmDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const handleDeleteUser = async () => {
  if (!userToDelete.value) return;
  const u = userToDelete.value;
  deletingUserId.value = u._id;
  try {
    const res = await fetch(getApiUrl(`/users/${u._id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user account');

    showDeleteModal.value = false;
    userToDelete.value = null;
    await fetchUsers(currentPage.value);
  } catch (err) {
    alert(err.message);
  } finally {
    deletingUserId.value = null;
  }
};

onMounted(() => {
  fetchEvents();
  fetchUsers();
});
</script>
