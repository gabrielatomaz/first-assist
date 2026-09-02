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
              🏆 {{ activeEvent.code }}
            </span>
          </div>
          
          <div class="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <router-link to="/" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Dashboard
            </router-link>
            <router-link to="/knowledge-base" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Knowledge Base
            </router-link>
            <router-link v-if="authStore.isAdmin || authStore.isFTA" to="/users" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              Technicians
            </router-link>
            <router-link v-if="authStore.isAdmin || authStore.isFTA" to="/fta" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              FTA Panel
            </router-link>
            <router-link v-if="authStore.isAdmin" to="/admin" class="hover:text-accentYellow transition duration-150" active-class="text-accentYellow">
              System Logs
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Report Incident Button (Icon Only) -->
          <router-link
            to="/create"
            class="w-11 h-11 flex items-center justify-center bg-primaryTeal hover:bg-primaryTeal/90 text-white rounded-xl text-lg font-bold shadow hover:shadow-md transition duration-150 flex-shrink-0"
            title="Report Incident"
          >
            ➕
          </router-link>

          <!-- Desktop-only Profile Badge (Matching h-11 Height) -->
          <router-link to="/profile" class="hidden md:flex items-center space-x-2 bg-white/10 h-11 px-3.5 rounded-xl border border-white/10 hover:bg-white/15 transition duration-150 shadow-sm flex-shrink-0">
            <span class="text-sm">🤖</span>
            <div class="text-left">
              <p class="text-xs font-bold leading-tight">{{ authStore.user?.name }}</p>
              <p class="text-[9px] text-accentYellow font-mono tracking-widest uppercase leading-none mt-0.5">{{ authStore.user?.role }}</p>
            </div>
          </router-link>

          <!-- Mobile Hamburger Toggle Button (FEAT-019 - Bigger Touch Target) -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="md:hidden w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl border border-white/10 text-white hover:bg-white/15 focus:outline-none flex-shrink-0"
            title="Toggle Menu"
          >
            <span v-if="!mobileMenuOpen" class="text-xl font-bold">☰</span>
            <span v-else class="text-xl font-bold">✕</span>
          </button>

          <!-- Desktop Logout Button -->
          <button @click="handleLogout" class="hidden md:inline-block text-white/60 hover:text-accentCoral text-sm font-medium transition duration-150">
            Logout
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation Drawer (FEAT-019) -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-800 bg-primaryNavy p-4 space-y-3 animate-fadeIn">
        <!-- Profile Badge Inside Mobile Hamburger Menu -->
        <router-link @click="mobileMenuOpen = false" to="/profile" class="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition shadow-sm mb-2">
          <span class="text-2xl">🤖</span>
          <div class="text-left">
            <p class="text-sm font-bold text-white leading-tight">{{ authStore.user?.name }}</p>
            <p class="text-[10px] text-accentYellow font-mono tracking-widest uppercase">{{ authStore.user?.role }}</p>
          </div>
        </router-link>

        <div class="flex flex-col space-y-2 text-sm font-bold">
          <router-link @click="mobileMenuOpen = false" to="/" class="py-2 px-3 rounded hover:bg-white/10 transition" active-class="text-accentYellow">
            📊 Dashboard
          </router-link>
          <router-link @click="mobileMenuOpen = false" to="/knowledge-base" class="py-2 px-3 rounded hover:bg-white/10 transition" active-class="text-accentYellow">
            📚 Knowledge Base
          </router-link>
          <router-link v-if="authStore.isAdmin || authStore.isFTA" @click="mobileMenuOpen = false" to="/fta" class="py-2 px-3 rounded hover:bg-white/10 transition" active-class="text-accentYellow">
            🛠️ FTA Panel
          </router-link>
          <router-link v-if="authStore.isAdmin" @click="mobileMenuOpen = false" to="/admin" class="py-2 px-3 rounded hover:bg-white/10 transition" active-class="text-accentYellow">
            📋 System Logs
          </router-link>
          <router-link v-if="authStore.isAdmin" @click="mobileMenuOpen = false" to="/users" class="py-2 px-3 rounded hover:bg-white/10 transition" active-class="text-accentYellow">
            👥 Technicians
          </router-link>
          <button @click="mobileMenuOpen = false; handleLogout()" class="py-2 px-3 rounded text-left text-accentCoral font-bold hover:bg-white/10 flex items-center space-x-2">
            <span class="font-mono text-sm">➜]</span>
            <span>Logout</span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { getApiUrl } from './config/api';

const router = useRouter();
const authStore = useAuthStore();

const isOffline = ref(!navigator.onLine);
const activeEvent = ref(null);
const mobileMenuOpen = ref(false);

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
    // 1. Fetch list of all events
    const eventsRes = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!eventsRes.ok) return;
    const events = await eventsRes.json();

    // 2. If user (FTA or CSA) has a specific active assigned event code
    if (authStore.user?.assignedEventCode) {
      const assigned = events.find(e => e.code === authStore.user.assignedEventCode);
      if (assigned) {
        activeEvent.value = assigned;
        return;
      }
    }

    // 3. For FTA with assigned regionals: select assigned regional
    if (authStore.user?.role === 'FTA' && authStore.user?.assignedEventCodes?.length > 0) {
      const assigned = events.find(e => authStore.user.assignedEventCodes.includes(e.code));
      if (assigned) {
        activeEvent.value = assigned;
        return;
      }
    }

    // 4. Default global active event context lookup
    const activeRes = await fetch(getApiUrl('/events/active'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (activeRes.ok) {
      activeEvent.value = await activeRes.json();
    }
  } catch (err) {
    console.error('Failed to load active event context:', err);
  }
};

watch([() => authStore.user?.assignedEventCode, () => router.currentRoute.value.path], () => {
  fetchActiveEvent();
});

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  fetchActiveEvent();
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>
