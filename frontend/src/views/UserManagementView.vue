<template>
  <div class="space-y-8 text-textMain">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">User Management</h2>
        <p class="text-sm text-gray-400 mt-1">Manage system accounts, access levels, and active volunteers</p>
      </div>
      <button
        @click="showCreateForm = !showCreateForm"
        class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition duration-200"
      >
        {{ showCreateForm ? 'Cancel Registration' : 'Add New User' }}
      </button>
    </div>

    <!-- Create User Card -->
    <div v-if="showCreateForm" class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 max-w-xl animate-fadeIn">
      <h3 class="text-lg font-bold text-primaryTeal mb-4">Register Authorized Volunteer</h3>
      <form @submit.prevent="handleCreateUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. John Doe" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Email Address</label>
            <input v-model="form.email" type="email" required placeholder="csa@first.org" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">Temporary Password</label>
            <input v-model="form.password" type="password" required placeholder="••••••••" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-primaryTeal uppercase tracking-wider mb-2">System Role</label>
            <select v-model="form.role" required class="w-full px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm bg-bgCard text-textMain">
              <option value="CSA" class="bg-bgCard">Control System Advisor (CSA)</option>
              <option value="FTA" class="bg-bgCard">FIRST Technical Advisor (FTA)</option>
              <option value="ADMIN" class="bg-bgCard">Administrator</option>
            </select>
          </div>
        </div>

        <div v-if="createError" class="text-accentCoral text-xs font-medium bg-red-950/40 rounded p-3">
          {{ createError }}
        </div>

        <button
          type="submit"
          :disabled="creating"
          class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50"
        >
          {{ creating ? 'Registering...' : 'Register User' }}
        </button>
      </form>
    </div>

    <!-- Users Table -->
    <div class="bg-bgCard rounded-2xl shadow overflow-hidden border border-gray-800">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primaryTeal border-t-transparent"></div>
        <p class="text-gray-400 mt-3 text-sm">Loading users list...</p>
      </div>

      <div v-else-if="error" class="bg-red-950/40 text-accentCoral p-4 text-center text-sm font-medium border border-red-900/30">
        {{ error }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-bgMain border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-primaryTeal">
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800 text-sm text-gray-300">
            <tr v-for="user in users" :key="user._id" class="hover:bg-bgMain/30 transition">
              <td class="px-6 py-4 font-semibold text-white">{{ user.name }}</td>
              <td class="px-6 py-4 font-mono text-xs">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="{
                  'bg-primaryTeal/10 text-primaryTeal': user.role === 'CSA',
                  'bg-accentYellow/10 text-accentYellow': user.role === 'FTA',
                  'bg-accentPurple/10 text-accentPurple': user.role === 'ADMIN'
                }" class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="{
                  'bg-green-950/40 text-green-400 border border-green-900/30': user.status === 'ACTIVE',
                  'bg-red-950/40 text-accentCoral border border-red-900/30': user.status === 'INACTIVE'
                }" class="px-2.5 py-0.5 rounded text-xs font-medium uppercase font-mono tracking-wider">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="toggleUserStatus(user)"
                  :disabled="updatingStatus === user._id"
                  :class="user.status === 'ACTIVE' ? 'text-accentCoral hover:text-accentCoral/80' : 'text-green-600 hover:text-green-700'"
                  class="text-xs font-semibold hover:underline disabled:opacity-50 transition"
                >
                  {{ user.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const showCreateForm = ref(false);

const form = ref({ name: '', email: '', password: '', role: 'CSA' });
const creating = ref(false);
const createError = ref(null);
const updatingStatus = ref(null);

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users list');
    users.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleCreateUser = async () => {
  creating.value = true;
  createError.value = null;
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(form.value)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create user');
    
    users.value.unshift(data);
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
    const response = await fetch(`http://localhost:3000/api/users/${user._id}/status`, {
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
  fetchUsers();
});
</script>
