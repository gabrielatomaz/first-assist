<template>
  <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto text-textMain">
    <PageHeader
      title="Knowledge Base"
      subtitle="Search through resolved tickets to find proven root causes and applied fixes."
    />

    <!-- Tab Switcher (Visible to CSA, FTA, ADMIN) -->
    <BaseTabs
      v-if="canViewAnalytics"
      v-model="activeMainTab"
      :tabs="mainTabs"
      size="sm"
    />

    <!-- TAB 1: Search Solutions (Resolved Tickets KB) -->
    <div v-if="activeMainTab === 'search'" class="space-y-8">
      <!-- Search & Filters Container -->
      <BaseCard class="space-y-4">
        <SearchBar
          v-model="searchQuery"
          placeholder="Type keywords (e.g. radio, fuse, breaker, CAN)..."
          :debounce-ms="300"
          @search="debouncedSearch"
          @clear="clearSearch"
        />

        <!-- Advanced filters (Category, Priority, Team Number, Event Code) -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</label>
            <CustomSelect
              v-model="filters.category"
              :options="categoryOptions"
              @change="executeSearch(1)"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Priority</label>
            <CustomSelect
              v-model="filters.priority"
              :options="priorityOptions"
              @change="executeSearch(1)"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Context</label>
            <CustomSelect
              v-model="filters.eventCode"
              :options="eventOptions"
              @change="executeSearch(1)"
            />
          </div>

          <div>
            <BaseInput
              v-model="filters.teamNumber"
              type="number"
              label="Team Number"
              placeholder="e.g. 254"
              @input="debouncedSearch"
              input-class="font-mono"
            />
          </div>
        </div>
      </BaseCard>

      <!-- Results -->
      <LoadingSpinner v-if="searching" text="Searching knowledge base..." />

      <div v-else class="space-y-4">
        <router-link 
          v-for="(incident) in results" 
          :key="incident._id" 
          :to="`/incidents/${incident._id}`"
          class="block p-6 rounded-2xl bg-bgCard border border-gray-700/60 hover:border-teal-500/50 space-y-4 transition-all duration-150 cursor-pointer hover:shadow-xl hover:scale-[1.005]"
        >
          <!-- Header Row -->
          <div class="flex flex-row items-start justify-between gap-3">
            <div class="space-y-1.5 flex-1 min-w-0">
              <h3 class="font-extrabold text-white text-xl tracking-tight group-hover:text-teal-300 transition">Team {{ incident.teamNumber }}</h3>

              <div class="flex flex-wrap items-center gap-2 pt-0.5">
                <CategoryBadge :category="incident.category" />
                <PriorityBadge v-if="incident.priority" :priority="incident.priority" />

                <!-- Event Code Badge -->
                <span v-if="incident.eventCode" class="h-6 px-2.5 rounded-md text-xs font-bold text-accentYellow/90 bg-accentYellow/10 border border-accentYellow/20 font-mono uppercase tracking-wider inline-flex items-center justify-center leading-none flex-shrink-0">
                  <font-awesome-icon icon="trophy" class="mr-1 text-[10px]" /> {{ incident.eventCode }}
                </span>
              </div>
              
              <p class="text-xs text-gray-400 font-medium flex items-center space-x-2">
                <span>Match: <strong class="text-gray-200">{{ incident.matchNumber || 'N/A' }}</strong></span>
                <span>•</span>
                <span>Resolved: <strong class="text-gray-200">{{ formatDate(incident.resolvedAt) }}</strong></span>
              </p>
            </div>

            <!-- Actions (Top Right) -->
            <div class="flex items-center space-x-2 flex-shrink-0">
              <BaseButton
                v-if="authStore.user"
                @click.stop.prevent="reopenTarget = incident; showReopenModal = true"
                :disabled="rollingBackId === incident._id || showReopenModal"
                :loading="rollingBackId === incident._id"
                variant="secondary"
                size="icon-sm"
                icon="rotate-left"
                title="Re-open ticket and return to Dashboard"
              />
            </div>
          </div>

          <!-- 3 Distinct Content Blocks with Fixed Equal Heights & Read More Modal -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
            <!-- Issue Description Block -->
            <div class="p-3.5 bg-bgMain rounded-xl border border-gray-800/80 flex flex-col justify-between h-36">
              <div class="space-y-1.5 overflow-hidden">
                <div class="flex items-center space-x-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <font-awesome-icon icon="circle-info" class="text-gray-400 text-xs" />
                  <span>Issue Description</span>
                </div>
                <p class="text-gray-200 leading-relaxed font-medium line-clamp-3 text-xs">{{ incident.description }}</p>
              </div>
              <div v-if="incident.description && incident.description.length > 140" class="pt-1">
                <button 
                  @click.stop.prevent="openTextModal(`Team ${incident.teamNumber} — Issue Description`, incident.description)"
                  class="text-xs sm:text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 sm:p-0 bg-teal-500/15 sm:bg-transparent border border-teal-500/30 sm:border-0 rounded-lg sm:rounded-none cursor-pointer flex-shrink-0 transition shadow-sm sm:shadow-none"
                >
                  Read more <font-awesome-icon icon="arrow-right" class="text-[10px] sm:text-[9px]" />
                </button>
              </div>
            </div>

            <!-- Root Cause Block -->
            <div class="p-3.5 bg-teal-500/10 rounded-xl border border-teal-500/25 flex flex-col justify-between h-36">
              <div class="space-y-1.5 overflow-hidden">
                <div class="flex items-center space-x-1.5 text-teal-300 font-bold uppercase tracking-wider text-[10px]">
                  <font-awesome-icon icon="lightbulb" class="text-teal-300 text-xs" />
                  <span>Root Cause</span>
                </div>
                <p class="text-teal-100 leading-relaxed font-medium line-clamp-3 text-xs">{{ incident.rootCause || 'N/A' }}</p>
              </div>
              <div v-if="incident.rootCause && incident.rootCause.length > 140" class="pt-1">
                <button 
                  @click.stop.prevent="openTextModal(`Team ${incident.teamNumber} — Root Cause`, incident.rootCause)"
                  class="text-xs sm:text-[11px] font-bold text-teal-300 hover:text-teal-200 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 sm:p-0 bg-teal-500/20 sm:bg-transparent border border-teal-500/40 sm:border-0 rounded-lg sm:rounded-none cursor-pointer flex-shrink-0 transition shadow-sm sm:shadow-none"
                >
                  Read more <font-awesome-icon icon="arrow-right" class="text-[10px] sm:text-[9px]" />
                </button>
              </div>
            </div>

            <!-- Applied Fix Block -->
            <div class="p-3.5 bg-accentGreen/10 rounded-xl border border-accentGreen/30 flex flex-col justify-between h-36">
              <div class="space-y-1.5 overflow-hidden">
                <div class="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  <font-awesome-icon icon="circle-check" class="text-emerald-400 text-xs" />
                  <span>Applied Fix</span>
                </div>
                <p class="text-emerald-200 leading-relaxed font-semibold line-clamp-3 text-xs">{{ incident.appliedSolution || 'N/A' }}</p>
              </div>
              <div v-if="incident.appliedSolution && incident.appliedSolution.length > 140" class="pt-1">
                <button 
                  @click.stop.prevent="openTextModal(`Team ${incident.teamNumber} — Applied Fix`, incident.appliedSolution)"
                  class="text-xs sm:text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 sm:p-0 bg-emerald-500/20 sm:bg-transparent border border-emerald-500/40 sm:border-0 rounded-lg sm:rounded-none cursor-pointer flex-shrink-0 transition shadow-sm sm:shadow-none"
                >
                  Read more <font-awesome-icon icon="arrow-right" class="text-[10px] sm:text-[9px]" />
                </button>
              </div>
            </div>
          </div>
        </router-link>

        <EmptyState
          v-if="results.length === 0"
          icon="book-open"
          title="No Matching Records"
          description="No matching resolved incident records found. Try adjusting your search keywords or filter criteria."
        />
      </div>

      <!-- Sentinel for Infinite Scroll (FEAT-029) -->
      <div ref="sentinelRef" class="py-8 text-center flex justify-center items-center overflow-hidden">
        <LoadingSpinner v-if="loadingMore" text="Loading more knowledge base records..." />
        <div 
          v-else-if="!hasMorePages && results.length > 0" 
          class="flex flex-col items-center gap-2 origin-bottom transition-all duration-300"
          :class="isEndStretching ? 'animate-stretch py-3' : 'animate-fadeIn'"
        >
          <!-- Elastic Rubberband Pulled Bar -->
          <div 
            class="rounded-full bg-teal-400/80 shadow-lg shadow-teal-500/40 transition-all duration-500"
            :class="isEndStretching ? 'w-24 h-2.5 animate-pulse' : 'w-10 h-1 opacity-40'"
          ></div>

          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgCard border border-gray-800 shadow-sm text-xs font-mono font-bold text-gray-300 hover:border-gray-700 transition">
            <font-awesome-icon icon="circle-check" class="text-teal-400 text-xs" />
            <span>All {{ totalCount }} resolved tickets loaded</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Incident Analytics (KPIs, Subsystem Breakdown, Team Hotspots) -->
    <div v-else-if="activeMainTab === 'analytics'" class="space-y-6">
      <!-- Analytics Filter Header Bar -->
      <BaseCard class="p-4 sm:p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <label class="text-xs font-bold text-gray-300 uppercase tracking-wider flex-shrink-0">
              <font-awesome-icon icon="trophy" class="mr-1 text-accentYellow" /> Event Filter:
            </label>
            <div class="w-full sm:w-72">
              <CustomSelect
                v-model="analyticsEventCode"
                :options="analyticsEventOptions"
                @change="fetchAnalytics"
              />
            </div>
            <span v-if="authStore.user?.role === 'CSA' && analyticsEventCode !== 'ALL'" class="text-xs font-medium text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-lg border border-teal-400/20">
              Assigned Event
            </span>
          </div>

          <div class="flex items-center gap-2">
            <BaseButton
              variant="secondary"
              size="icon-sm"
              icon="rotate-right"
              title="Refresh Stats"
              :loading="loadingAnalytics"
              @click="fetchAnalytics"
            />
          </div>
        </div>
      </BaseCard>

      <!-- Loading State -->
      <LoadingSpinner v-if="loadingAnalytics" text="Calculating incident metrics..." />

      <div v-else-if="analyticsError" class="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-2">
        <font-awesome-icon icon="triangle-exclamation" class="text-red-400 text-2xl" />
        <h4 class="text-white font-bold">Failed to load statistics</h4>
        <p class="text-xs text-red-300">{{ analyticsError }}</p>
      </div>

      <!-- Analytics Body -->
      <div v-else-if="stats" class="space-y-6 animate-fadeIn">
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            title="Total Tickets"
            :value="stats.total"
            icon="ticket"
            variant="teal"
            subtitle="All logged incidents"
          />
          <StatCard
            title="Active / Open"
            :value="stats.active"
            icon="clock"
            variant="yellow"
            subtitle="Pending resolution"
          />
          <StatCard
            title="Resolution Rate"
            :value="`${stats.resolutionRate}%`"
            icon="circle-check"
            variant="green"
            :subtitle="`${stats.resolved} resolved`"
          />
          <StatCard
            title="High / Critical"
            :value="stats.criticalOrHigh"
            icon="triangle-exclamation"
            variant="coral"
            subtitle="Severe disruption"
          />
          <StatCard
            title="Avg Resolve Time"
            :value="stats.avgResolutionMinutes !== null ? `${stats.avgResolutionMinutes}m` : 'N/A'"
            icon="stopwatch"
            variant="purple"
            subtitle="Created to resolved"
          />
        </div>

        <!-- 2-Column Section: Subsystem Categories Breakdown & Match vs Pit Phase -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Subsystem Category Breakdown (2 Cols) -->
          <BaseCard class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <font-awesome-icon icon="chart-simple" class="text-teal-400" />
                Subsystem Failure Breakdown
              </h3>
              <span class="text-xs font-mono font-bold text-gray-400">{{ stats.byCategory?.length || 0 }} Subsystems</span>
            </div>

            <div v-if="!stats.byCategory || stats.byCategory.length === 0" class="py-6 text-center text-xs text-gray-400">
              No category data recorded for this event context.
            </div>

            <div v-else class="space-y-3 pt-1">
              <div 
                v-for="cat in stats.byCategory" 
                :key="cat.category"
                class="space-y-1.5"
              >
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <CategoryBadge :category="cat.category" />
                  </div>
                  <div class="flex items-center gap-2 font-mono">
                    <span class="font-bold text-white">{{ cat.count }}</span>
                    <span class="text-gray-400 text-[11px]">({{ cat.percentage }}%)</span>
                  </div>
                </div>
                <!-- Progress Bar Track -->
                <div class="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-gradient-to-r from-teal-500 to-primaryTeal h-full rounded-full transition-all duration-500"
                    :style="{ width: `${cat.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Phase & Priority Breakdown Card (1 Col) -->
          <div class="space-y-6">
            <!-- Phase Breakdown (Match vs Pit) -->
            <BaseCard class="space-y-4">
              <div class="border-b border-gray-800 pb-3">
                <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <font-awesome-icon icon="trophy" class="text-accentYellow" />
                  Origin Phase
                </h3>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-1">
                <div class="p-4 rounded-xl bg-bgMain border border-gray-800 text-center space-y-1">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Field / Match</div>
                  <div class="text-2xl font-extrabold text-accentYellow font-mono">{{ stats.phaseBreakdown?.match || 0 }}</div>
                  <div class="text-[10px] text-gray-500">During competition</div>
                </div>
                <div class="p-4 rounded-xl bg-bgMain border border-gray-800 text-center space-y-1">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pit Area</div>
                  <div class="text-2xl font-extrabold text-teal-400 font-mono">{{ stats.phaseBreakdown?.pit || 0 }}</div>
                  <div class="text-[10px] text-gray-500">Pit inspection & work</div>
                </div>
              </div>
            </BaseCard>

            <!-- Priority Distribution -->
            <BaseCard class="space-y-4">
              <div class="border-b border-gray-800 pb-3">
                <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <font-awesome-icon icon="layer-group" class="text-accentPurple" />
                  Severity Distribution
                </h3>
              </div>

              <div class="space-y-2 pt-1">
                <div 
                  v-for="p in stats.byPriority" 
                  :key="p._id"
                  class="flex items-center justify-between p-2 rounded-lg bg-bgMain border border-gray-800 text-xs"
                >
                  <PriorityBadge :priority="p._id" />
                  <span class="font-mono font-bold text-white">{{ p.count }} ticket{{ p.count === 1 ? '' : 's' }}</span>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>

        <!-- Team Hotspots (Top Incident Volumes) -->
        <BaseCard class="space-y-4">
          <div class="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <font-awesome-icon icon="users" class="text-accentCoral" />
                Team Support Hotspots (Top 10)
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">Teams requiring the highest frequency of FTA/CSA troubleshooting</p>
            </div>
          </div>

          <div v-if="!stats.topTeams || stats.topTeams.length === 0" class="py-6 text-center text-xs text-gray-400">
            No team incident history found for this event context.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th class="py-3 px-3">Team</th>
                  <th class="py-3 px-3">Total Tickets</th>
                  <th class="py-3 px-3">Active Tickets</th>
                  <th class="py-3 px-3">Primary Failure Category</th>
                  <th class="py-3 px-3">Highest Priority</th>
                  <th class="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/60 font-medium">
                <tr 
                  v-for="team in stats.topTeams" 
                  :key="team.teamNumber"
                  class="hover:bg-white/[0.02] transition"
                >
                  <td class="py-3 px-3 font-mono font-bold text-teal-300 text-sm">
                    Team {{ team.teamNumber }}
                  </td>
                  <td class="py-3 px-3 font-mono font-bold text-white">
                    {{ team.total }}
                  </td>
                  <td class="py-3 px-3 font-mono">
                    <span 
                      :class="team.activeCount > 0 ? 'text-accentYellow font-bold' : 'text-gray-500'"
                    >
                      {{ team.activeCount }}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <CategoryBadge :category="team.topCategory" />
                  </td>
                  <td class="py-3 px-3">
                    <PriorityBadge :priority="team.maxPriority" />
                  </td>
                  <td class="py-3 px-3 text-right">
                    <button
                      type="button"
                      @click="viewTeamTickets(team.teamNumber)"
                      class="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Tickets</span>
                      <font-awesome-icon icon="arrow-right" class="text-[10px]" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </div>

    <ConfirmationModal
      v-model="showReopenModal"
      title="Re-open Incident?"
      message="This will change the incident status back to In Progress and return it to the active dashboard."
      icon="rotate-left"
      variant="warning"
      confirm-text="Re-open"
      confirm-icon="rotate-left"
      :loading="rollingBackId !== null"
      loading-text="Re-opening..."
      @confirm="rollbackIncidentStatus"
      @cancel="showReopenModal = false; reopenTarget = null"
    />
    <!-- KB Text Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="showTextModal" 
        class="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn overflow-y-auto"
        @click.self="showTextModal = false"
      >
        <div class="bg-bgCard border border-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn my-auto max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-extrabold text-white tracking-tight">{{ textModalTitle }}</h4>
            <div class="flex items-center gap-1.5">
              <BaseButton 
                variant="secondary" 
                size="icon-xs" 
                :icon="isSpeaking ? 'volume-xmark' : 'volume-high'" 
                :title="isSpeaking ? 'Stop reading' : 'Read aloud'" 
                @click="speakText(textModalContent)" 
              />
              <BaseButton variant="ghost" size="icon-xs" icon="xmark" @click="showTextModal = false; if (isSpeaking) window.speechSynthesis.cancel();" />
            </div>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">{{ textModalContent }}</p>
          <div class="flex justify-between items-center pt-2 border-t border-gray-800/60">
            <button 
              @click="translateModalText" 
              :disabled="isTranslatingModal"
              class="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <font-awesome-icon icon="language" />
              <span>{{ isTranslatingModal ? 'Translating...' : 'Translate text' }}</span>
            </button>
            <BaseButton size="xs" variant="secondary" @click="showTextModal = false; if (isSpeaking) window.speechSynthesis.cancel();">Close</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  BaseButton,
  BaseCard,
  BaseInput,
  BaseTabs,
  StatCard,
  ConfirmationModal,
  CustomSelect,
  PageHeader,
  SearchBar,
  CategoryBadge,
  PriorityBadge,
  LoadingSpinner,
  EmptyState
} from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();

// Main View Navigation Tabs
const canViewAnalytics = computed(() => {
  const role = (authStore.user?.role || '').toUpperCase();
  return ['ADMIN', 'FTA', 'CSA'].includes(role);
});

const activeMainTab = ref('search');
const mainTabs = [
  { id: 'search', label: 'Search Solutions', icon: 'book-open' },
  { id: 'analytics', label: 'Incident Analytics', icon: 'chart-pie' }
];

// Analytics State
const stats = ref(null);
const loadingAnalytics = ref(false);
const analyticsError = ref(null);
const analyticsEventCode = ref('');

// Analytics Event Dropdown Options Scoped to Role
const analyticsEventOptions = computed(() => {
  return [
    { value: 'ALL', label: 'All Events (Global)' },
    ...events.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
  ];
});

const fetchAnalytics = async () => {
  if (!canViewAnalytics.value) return;
  loadingAnalytics.value = true;
  analyticsError.value = null;

  try {
    const params = new URLSearchParams();
    if (analyticsEventCode.value && analyticsEventCode.value !== 'ALL') {
      params.append('eventCode', analyticsEventCode.value);
    }

    const res = await fetch(getApiUrl(`/incidents/statistics?${params.toString()}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch statistics (${res.status})`);
    }

    stats.value = await res.json();
  } catch (err) {
    console.error('Error loading incident statistics:', err);
    analyticsError.value = err.message;
  } finally {
    loadingAnalytics.value = false;
  }
};

const router = useRouter();

const viewTeamTickets = (teamNum) => {
  router.push(`/teams/${teamNum}`);
};

const searchQuery = ref('');
const filters = ref({ category: '', priority: '', teamNumber: null, eventCode: '' });
const events = ref([]);

const categoryOptions = [
  { value: '', label: 'All' },
  { value: 'RADIO_COMMS', label: 'Radio & Wireless Comms' },
  { value: 'ROBOTIC_POWER', label: 'Robot Power Path & Battery' },
  { value: 'CAN_BUS', label: 'CAN Bus Connection' },
  { value: 'MOTOR_CONTROLLER', label: 'Motor Controllers & Sensors' },
  { value: 'PNEUMATICS', label: 'Pneumatics & Air System' },
  { value: 'VISION_COPROCESSOR', label: 'Vision & Coprocessors' },
  { value: 'DRIVER_STATION', label: 'Driver Station & Controls' },
  { value: 'CODE_EXCEPTION', label: 'Robot User Code' },
  { value: 'MECHANICAL', label: 'Mechanical & Hardware' },
  { value: 'FIELD_NETWORK', label: 'Field & FMS Network' },
  { value: 'OTHER', label: 'Other Issues' }
];

const priorityOptions = [
  { value: '', label: 'All' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical', class: 'text-accentCoral font-bold' }
];

const eventOptions = computed(() => [
  { value: '', label: 'All' },
  ...events.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
]);

const results = ref([]);
const searching = ref(true);
const loadingMore = ref(false);
const hasMorePages = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const sentinelRef = ref(null);
let observer = null;
let debounceTimeout = null;

const loadEvents = async () => {
  try {
    const res = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      events.value = await res.json();

      // Initialize analyticsEventCode to ALL so stats cover all incidents by default
      if (!analyticsEventCode.value) {
        analyticsEventCode.value = 'ALL';
      }
    }
  } catch (err) {
    console.error('Failed to load events:', err);
  }
};

const executeSearch = async (page = 1, isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    searching.value = true;
    currentPage.value = 1;
    results.value = [];
  }

  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', '10');
    if (searchQuery.value.trim()) params.append('q', searchQuery.value.trim());
    if (filters.value.category) params.append('category', filters.value.category);
    if (filters.value.priority) params.append('priority', filters.value.priority);
    if (filters.value.teamNumber) params.append('teamNumber', String(filters.value.teamNumber));
    if (filters.value.eventCode) params.append('eventCode', filters.value.eventCode);
    
    const response = await fetch(getApiUrl(`/incidents/search?${params.toString()}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to query knowledge base');
    const data = await response.json();
    
    const newIncidents = data.incidents || (Array.isArray(data) ? data : []);
    totalPages.value = data.totalPages || 1;
    totalCount.value = data.total || newIncidents.length;

    if (isLoadMore) {
      const existingIds = new Set(results.value.map(i => i._id));
      const filtered = newIncidents.filter(i => !existingIds.has(i._id));
      results.value.push(...filtered);
    } else {
      results.value = newIncidents;
    }
    
    currentPage.value = page;
    hasMorePages.value = page < totalPages.value;
  } catch (err) {
    console.error(err);
  } finally {
    searching.value = false;
    loadingMore.value = false;
  }
};

const isEndStretching = ref(false);

const triggerEndStretch = () => {
  if (isEndStretching.value) return;
  isEndStretching.value = true;
  setTimeout(() => {
    isEndStretching.value = false;
  }, 750);
};

const loadMoreKB = () => {
  if (searching.value || loadingMore.value || !hasMorePages.value) return;
  executeSearch(currentPage.value + 1, true);
};

const setupObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (sentinelRef.value && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (hasMorePages.value && !searching.value && !loadingMore.value) {
          loadMoreKB();
        } else if (!hasMorePages.value && results.value.length > 0) {
          triggerEndStretch();
        }
      }
    }, { rootMargin: '200px' });

    observer.observe(sentinelRef.value);
  }
};

const rollingBackId = ref(null);
const showReopenModal = ref(false);
const reopenTarget = ref(null);

const showTextModal = ref(false);
const textModalTitle = ref('');
const textModalContent = ref('');
const originalModalContent = ref('');
const isSpeaking = ref(false);
const isTranslatingModal = ref(false);

const openTextModal = (title, content) => {
  textModalTitle.value = title;
  textModalContent.value = content;
  originalModalContent.value = content;
  showTextModal.value = true;
};

const speakText = (text) => {
  if (!('speechSynthesis' in window)) {
    alert('Speech synthesis is not supported in this browser.');
    return;
  }
  if (isSpeaking.value) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const savedLocale = localStorage.getItem('first_assist_locale') || 'en';
  utterance.lang = savedLocale === 'pt' ? 'pt-BR' : 'en-US';
  utterance.onend = () => { isSpeaking.value = false; };
  utterance.onerror = () => { isSpeaking.value = false; };
  isSpeaking.value = true;
  window.speechSynthesis.speak(utterance);
};

const translateModalText = async () => {
  if (isTranslatingModal.value) return;
  isTranslatingModal.value = true;
  try {
    const savedLocale = localStorage.getItem('first_assist_locale') || 'en';
    const targetLang = savedLocale === 'pt' ? 'pt' : 'en';
    const response = await fetch(getApiUrl('/incidents/translate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ text: textModalContent.value, targetLang })
    });
    if (!response.ok) throw new Error('Failed to translate content');
    const data = await response.json();
    if (data.translatedText) {
      textModalContent.value = data.translatedText;
    }
  } catch (err) {
    console.error('Translation error:', err);
  } finally {
    isTranslatingModal.value = false;
  }
};

const rollbackIncidentStatus = async () => {
  if (!reopenTarget.value) return;
  const incident = reopenTarget.value;
  try {
    rollingBackId.value = incident._id;
    const response = await fetch(getApiUrl(`/incidents/${incident._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to re-open ticket status');
    results.value = results.value.filter(i => i._id !== incident._id);
    totalCount.value = Math.max(0, totalCount.value - 1);
    showReopenModal.value = false;
    reopenTarget.value = null;
  } catch (err) {
    console.error('Failed to re-open ticket:', err);
    alert(err.message);
  } finally {
    rollingBackId.value = null;
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    executeSearch(1);
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  executeSearch(1);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(() => {
  loadEvents();
  executeSearch(1);
  watch(sentinelRef, (el) => {
    if (el) setupObserver();
  }, { immediate: true });

  // Fetch analytics automatically if user navigates to analytics tab
  watch(activeMainTab, (newTab) => {
    if (newTab === 'analytics' && !stats.value && !loadingAnalytics.value) {
      fetchAnalytics();
    }
  });
});
</script>
