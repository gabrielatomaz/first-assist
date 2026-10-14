<template>
  <div class="min-h-screen bg-bgMain text-textMain flex flex-col font-sans">
    
    <!-- System Offline Banner (Epic 17) -->
    <div v-if="isOffline" class="bg-accentCoral text-white text-center text-xs font-extrabold py-2 shadow-inner animate-pulse z-50">
      <font-awesome-icon icon="triangle-exclamation" class="mr-1.5" /> Connection Lost. You are currently offline. FIRST Assist is running in offline resilient cache shell.
    </div>

    <!-- Main Header -->
    <nav v-if="authStore.isAuthenticated" class="bg-primaryNavy text-white shadow-lg border-b border-primaryNavy/20 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-6">
          <div>
            <div class="flex items-center gap-3">
              <router-link to="/" class="text-2xl font-extrabold tracking-wider text-white hover:opacity-95 transition">
                FIRST Assist
              </router-link>
              <!-- Sleek Compact Desktop Language Toggle Pill next to Brand Logo -->
              <button
                type="button"
                @click="i18nStore.toggleLocale()"
                class="hidden md:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-bgCard border border-gray-800 hover:border-teal-500/40 text-[11px] font-mono font-extrabold text-gray-300 hover:text-white transition cursor-pointer flex-shrink-0 shadow-sm"
                :title="i18nStore.locale === 'pt' ? 'Switch to English' : 'Mudar para Português'"
              >
                <font-awesome-icon icon="globe" class="text-teal-400 text-xs" />
                <span class="text-teal-300 font-extrabold uppercase">{{ i18nStore.locale }}</span>
              </button>
            </div>
            <!-- Active Event Context Indicator (Epic 11) -->
            <span v-if="activeEvent" class="block text-[10px] text-teal-400 font-bold uppercase font-mono tracking-wider mt-0.5">
              <span class="md:hidden"><font-awesome-icon icon="trophy" class="mr-1.5 text-accentYellow" />{{ activeEvent.code }}</span>
              <span class="hidden md:inline"><font-awesome-icon icon="trophy" class="mr-1.5 text-accentYellow" />{{ activeEvent.name }} ({{ activeEvent.code }})</span>
            </span>
          </div>
          
          <div class="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <router-link to="/" class="text-gray-300 hover:text-teal-300 transition duration-150" active-class="!text-teal-400 font-bold">
              Dashboard
            </router-link>
            <router-link to="/knowledge-base" class="text-gray-300 hover:text-teal-300 transition duration-150" active-class="!text-teal-400 font-bold">
              Knowledge Base
            </router-link>
            <router-link v-if="authStore.isAdmin || authStore.isFTA" to="/fta" class="text-gray-300 hover:text-teal-300 transition duration-150" active-class="!text-teal-400 font-bold">
              FTA Dashboard
            </router-link>
            <router-link v-if="authStore.isAdmin" @click="mobileMenuOpen = false" to="/admin" class="text-gray-300 hover:text-teal-300 transition duration-150" active-class="!text-teal-400 font-bold">
              Admin Panel
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Report Incident Button -->
          <router-link
            v-if="authStore.canReportIncident"
            to="/create"
            class="w-11 h-11 flex items-center justify-center bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-sm font-black shadow-sm transition duration-150 flex-shrink-0 cursor-pointer"
            title="Report Technical Incident"
          >
            <font-awesome-icon icon="plus" class="text-sm" />
          </router-link>

          <!-- Desktop Profile Pill -->
          <router-link 
            to="/profile" 
            class="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-gray-800 transition duration-150 flex-shrink-0 group"
            title="User Profile"
          >
            <UserAvatar :icon="authStore.user?.avatarIcon" :color="authStore.user?.avatarColor" size="sm" :has-bg="true" />
            <span class="text-xs font-bold text-gray-200 group-hover:text-white transition">
              {{ authStore.user?.name }}
            </span>
            <RoleBadge v-if="authStore.user?.role" :role="authStore.user?.role" />
          </router-link>

          <!-- Desktop Logout Button -->
          <button @click="handleLogout" class="hidden md:inline-block text-gray-400 hover:text-accentCoral text-sm font-semibold transition duration-150 cursor-pointer ml-2">
            Logout
          </button>

          <!-- Mobile Hamburger Toggle Button -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="md:hidden w-11 h-11 flex items-center justify-center bg-bgCard rounded-xl border border-gray-800 text-white hover:border-gray-700 text-sm flex-shrink-0 cursor-pointer transition duration-150"
            title="Toggle Menu"
          >
            <font-awesome-icon v-if="!mobileMenuOpen" icon="bars" class="text-sm" />
            <font-awesome-icon v-else icon="xmark" class="text-sm" />
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation Drawer (FEAT-019) -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-borderSubtle bg-primaryNavy p-4 space-y-4 animate-fadeIn">
        <!-- Profile Badge Inside Mobile Hamburger Menu -->
        <router-link @click="mobileMenuOpen = false" to="/profile" class="flex items-center space-x-3 p-3 rounded-xl bg-bgCard border border-gray-800 hover:border-gray-700 transition shadow-sm mb-2">
          <UserAvatar :icon="authStore.user?.avatarIcon" :color="authStore.user?.avatarColor" size="md" />
          <div class="text-left">
            <p class="text-sm font-bold text-white leading-tight">{{ authStore.user?.name }}</p>
            <p :class="roleTextColor" class="text-[10px] font-mono font-bold tracking-widest uppercase mt-0.5">
              {{ authStore.user?.role }}
            </p>
          </div>
        </router-link>

        <div class="flex flex-col space-y-2 text-sm font-bold">
          <router-link @click="mobileMenuOpen = false" to="/" class="py-2.5 px-3 rounded-xl hover:bg-white/10 transition flex items-center text-gray-200" active-class="!text-teal-400 font-bold bg-white/10">
            <font-awesome-icon icon="chart-simple" class="w-4 mr-2.5 text-primaryTeal" /> Dashboard
          </router-link>
          <router-link @click="mobileMenuOpen = false" to="/knowledge-base" class="py-2.5 px-3 rounded-xl hover:bg-white/10 transition flex items-center text-gray-200" active-class="!text-teal-400 font-bold bg-white/10">
            <font-awesome-icon icon="book" class="w-4 mr-2.5 text-primaryTeal" /> Knowledge Base
          </router-link>
          <router-link v-if="authStore.isAdmin || authStore.isFTA" @click="mobileMenuOpen = false" to="/fta" class="py-2.5 px-3 rounded-xl hover:bg-white/10 transition flex items-center text-gray-200" active-class="!text-teal-400 font-bold bg-white/10">
            <font-awesome-icon icon="wrench" class="w-4 mr-2.5 text-primaryTeal" /> FTA Dashboard
          </router-link>
          <router-link v-if="authStore.isAdmin" @click="mobileMenuOpen = false" to="/admin" class="py-2.5 px-3 rounded-xl hover:bg-white/10 transition flex items-center text-gray-200" active-class="!text-teal-400 font-bold bg-white/10">
            <font-awesome-icon icon="user-shield" class="w-4 mr-2.5 text-primaryTeal" /> Admin Panel
          </router-link>

          <!-- Mobile Language Selector Section (2-Button Grid) -->
          <div class="pt-3 border-t border-gray-800/80">
            <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Language</p>
            <div class="grid grid-cols-2 gap-2">
              <BaseButton
                :variant="i18nStore.locale === 'en' ? 'primary' : 'secondary'"
                size="sm"
                icon="globe"
                @click="i18nStore.setLocale('en')"
                class="w-full justify-center font-mono"
              >
                English (EN)
              </BaseButton>
              <BaseButton
                :variant="i18nStore.locale === 'pt' ? 'primary' : 'secondary'"
                size="sm"
                icon="globe"
                @click="i18nStore.setLocale('pt')"
                class="w-full justify-center font-mono"
              >
                Português (PT)
              </BaseButton>
            </div>
          </div>

          <button @click="mobileMenuOpen = false; handleLogout()" class="py-2.5 px-3 rounded-xl text-left text-accentCoral font-bold hover:bg-white/10 flex items-center cursor-pointer pt-2">
            <font-awesome-icon icon="right-from-bracket" class="w-4 mr-2.5 text-accentCoral" />
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
      <p>&copy; 2026 FIRST Assist</p>
    </footer>

    <!-- FTA & CSA Onboarding Tutorial Modal (FEAT-026) -->
    <OnboardingTutorialModal
      v-if="shouldShowTutorial"
      @close="authStore.completeOnboarding()"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useI18nStore } from './stores/i18n';
import { getApiUrl } from './config/api';
import UserAvatar from './components/UserAvatar.vue';
import { RoleBadge, OnboardingTutorialModal, BaseButton, CustomSelect } from './components';

const router = useRouter();
const authStore = useAuthStore();
const i18nStore = useI18nStore();

const isOffline = ref(!navigator.onLine);
const activeEvent = ref(null);
const mobileMenuOpen = ref(false);

const toggleLanguage = () => {
  i18nStore.toggleLocale();
};

const shouldShowTutorial = computed(() => {
  if (!authStore.user) return false;
  const role = (authStore.user.role || '').toUpperCase();
  return (role === 'FTA' || role === 'CSA') && !authStore.user.hasCompletedOnboarding;
});

const roleTextColor = computed(() => {
  const r = (authStore.user?.role || '').toUpperCase();
  if (r === 'ADMIN') return 'text-accentYellow';
  if (r === 'FTA') return 'text-purple-300';
  return 'text-teal-400'; // CSA
});

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
