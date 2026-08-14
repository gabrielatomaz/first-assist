<template>
  <div class="min-h-screen bg-bgMain text-textMain flex flex-col font-sans">
    
    <!-- System Offline Banner (Epic 17) -->
    <div v-if="isOffline" class="bg-accentCoral text-white text-center text-xs font-extrabold py-2 shadow-inner animate-pulse z-50">
      ⚠️ Connection Lost. You are currently offline. FIRST Assist is running in offline resilient cache shell.
    </div>

    <!-- Main Header -->
    <nav v-if="authStore.isAuthenticated" class="bg-primaryNavy text-white shadow-lg border-b border-primaryNavy/20 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-6">
          <div>
            <router-link to="/" class="text-2xl font-extrabold tracking-wider text-white hover:opacity-95 transition">
              FIRST Assist
            </router-link>
            <!-- Active Event Context Indicator (Epic 11) -->
            <span v-if="activeEvent" class="block text-[10px] text-primaryTeal font-bold uppercase font-mono tracking-wider mt-0.5">
              🏆 {{ activeEvent.name }} ({{ activeEvent.code }})
            </span>
          </div>
          
          <div class="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <router-link to="/" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Dashboard
            </router-link>
            <router-link to="/knowledge-base" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Knowledge Base
            </router-link>
            <router-link v-if="authStore.isAdmin" to="/users" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Technicians
            </router-link>
            <router-link v-if="authStore.isAdmin || authStore.isFTA" to="/admin" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Admin Panel
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Notification Bell Dropdown (Epic 10) -->
          <div class="relative">
            <button 
              @click="toggleNotifications" 
              class="relative bg-white/10 p-2 rounded-lg border border-white/10 hover:bg-white/15 transition duration-150 text-sm focus:outline-none"
            >
              🔔
              <span v-if="unreadCount > 0" class="absolute -top-1.5 -right-1.5 bg-accentCoral text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-primaryNavy">
                {{ unreadCount }}
              </span>
            </button>

            <!-- Notifications Drawer -->
            <div v-if="showNotifications" class="absolute right-0 mt-3 w-80 bg-bgCard rounded-2xl shadow-xl border border-gray-700 z-50 text-textMain animate-fadeIn">
              <div class="p-3 border-b border-gray-700 flex justify-between items-center bg-bgMain rounded-t-2xl">
                <span class="text-xs font-extrabold text-primaryTeal uppercase tracking-wider">Notifications</span>
                <button 
                  v-if="unreadCount > 0"
                  @click="markAllNotificationsAsRead" 
                  class="text-[9px] text-accentYellow hover:underline font-bold uppercase"
                >
                  Mark all read
                </button>
              </div>

              <div class="max-h-64 overflow-y-auto divide-y divide-gray-700">
                <div v-if="notifications.length === 0" class="p-6 text-center text-xs text-gray-400 font-medium">
                  No notifications yet.
                </div>
                <div 
                  v-for="notif in notifications" 
                  :key="notif._id"
                  @click="clickNotification(notif)"
                  class="p-3 hover:bg-bgMain transition duration-150 cursor-pointer flex flex-col space-y-1"
                  :class="!notif.isRead ? 'bg-primaryTeal/10' : ''"
                >
                  <p class="text-xs font-medium text-gray-200">{{ notif.text }}</p>
                  <span class="text-[9px] text-gray-400">{{ formatTime(notif.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Badge -->
          <router-link to="/profile" class="flex items-center space-x-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/15 transition duration-150">
            <div class="w-2 h-2 rounded-full bg-primaryTeal animate-pulse"></div>
            <div class="text-left">
              <p class="text-xs font-bold leading-tight">{{ authStore.user?.name }}</p>
              <p class="text-[9px] text-accentYellow font-mono tracking-widest uppercase leading-none">{{ authStore.user?.role }}</p>
            </div>
          </router-link>

          <router-link to="/create" class="bg-primaryTeal hover:bg-primaryTeal/90 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-md transition duration-150">
            + Report Incident
          </router-link>

          <button @click="handleLogout" class="text-white/60 hover:text-accentCoral text-sm font-medium transition duration-150">
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Container -->
    <main class="container mx-auto px-6 py-8 flex-grow">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-primaryNavy border-t border-gray-800 py-4 text-center text-xs text-gray-500">
      <p>&copy; 2026 FIRST Assist. Built for FIRST Robotics Competition technical support.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isOffline = ref(!navigator.onLine);
const activeEvent = ref(null);

const notifications = ref([]);
const showNotifications = ref(false);
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

let pollInterval = null;

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine;
};

const fetchActiveEvent = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await fetch('http://localhost:3000/api/events/active', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      activeEvent.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to load active event context:', err);
  }
};

const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await fetch('http://localhost:3000/api/notifications', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      notifications.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
  }
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    fetchNotifications();
  }
};

const clickNotification = async (notif) => {
  try {
    if (!notif.isRead) {
      await fetch(`http://localhost:3000/api/notifications/${notif._id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      });
      notif.isRead = true;
    }
    showNotifications.value = false;
    if (notif.link) {
      router.push(notif.link);
    }
  } catch (err) {
    console.error(err);
  }
};

const markAllNotificationsAsRead = async () => {
  try {
    await fetch('http://localhost:3000/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    notifications.value.forEach(n => n.isRead = true);
  } catch (err) {
    console.error(err);
  }
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  fetchActiveEvent();
  fetchNotifications();
  
  // Real-time polling for notifications (Epic 10 / Epic 14)
  pollInterval = setInterval(() => {
    fetchNotifications();
  }, 5000);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  if (pollInterval) clearInterval(pollInterval);
});
</script>
