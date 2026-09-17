<template>
  <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 flex flex-col justify-between space-y-4 hover:shadow-md transition h-full">
    <div class="space-y-4">
      <!-- Quick Triage Action Buttons on Top of the Incident with Separator Line -->
      <div v-if="incident.status === 'PENDING_SCREENING' && isStaffUser" class="border-b border-gray-800/80 pb-3 flex items-center justify-end space-x-2" @click.stop.prevent>
        <button 
          @click.stop.prevent="emit('accept-triage', incident._id)" 
          :disabled="!!triageLoadingAction"
          class="px-3 py-1 bg-accentGreen/20 hover:bg-accentGreen text-accentGreen hover:text-white border border-accentGreen/40 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm disabled:opacity-50"
          title="Accept ticket into Open queue"
        >
          <font-awesome-icon v-if="triageLoadingAction === 'accept'" icon="spinner" spin class="text-[10px]" />
          <font-awesome-icon v-else icon="check" class="text-[10px]" />
          <span>{{ triageLoadingAction === 'accept' ? 'Accepting...' : 'Accept' }}</span>
        </button>
        <button 
          @click.stop.prevent="emit('reject-triage', incident._id)" 
          :disabled="!!triageLoadingAction"
          class="px-3 py-1 bg-accentCoral/20 hover:bg-accentCoral text-accentCoral hover:text-white border border-accentCoral/40 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm disabled:opacity-50"
          title="Reject ticket"
        >
          <font-awesome-icon v-if="triageLoadingAction === 'reject'" icon="spinner" spin class="text-[10px]" />
          <font-awesome-icon v-else icon="xmark" class="text-[10px]" />
          <span>{{ triageLoadingAction === 'reject' ? 'Rejecting...' : 'Reject' }}</span>
        </button>
      </div>

      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <router-link :to="`/teams/${incident.teamNumber}`" @click.stop class="font-extrabold text-white text-lg hover:text-primaryTeal hover:underline">
            Team {{ incident.teamNumber }}
          </router-link>
          <p class="text-xs text-gray-400 font-medium">
            Match: <span class="text-gray-300 font-semibold">{{ incident.matchNumber || 'N/A' }}</span>
          </p>
        </div>

        <div class="flex flex-col items-end space-y-1.5">
          <!-- Status Badge -->
          <span :class="statusBadgeClass" class="inline-flex items-center justify-center text-center h-6 min-w-[85px] px-2.5 rounded text-xs font-bold tracking-wider font-mono uppercase leading-none">
            {{ formatStatus(incident.status) }}
          </span>
          <!-- Priority Badge -->
          <span :class="priorityBadgeClass" class="inline-flex items-center justify-center text-center h-6 min-w-[85px] px-2.5 rounded text-xs font-bold tracking-wider font-mono uppercase leading-none">
            {{ incident.priority }}
          </span>
        </div>
      </div>

      <!-- Category Badge -->
      <div>
        <span class="inline-flex items-center justify-center text-center h-6 px-2.5 rounded text-xs font-bold text-primaryTeal/85 bg-primaryTeal/5 border border-primaryTeal/10 font-mono uppercase tracking-wider leading-none">
          {{ formatCategory(incident.category) }}
        </span>
      </div>

      <p class="text-sm text-gray-300 line-clamp-2 leading-relaxed min-h-[2.5rem]">{{ incident.description }}</p>
    </div>

    <!-- Footer: Assigned Technical (Left) & Event Code Badge (Right) -->
    <div class="border-t border-gray-800/80 pt-3 flex items-center justify-between text-xs">
      <div v-if="incident.assignedTo" class="flex items-center space-x-2">
        <UserAvatar :icon="incident.assignedTo?.avatarIcon" :color="incident.assignedTo?.avatarColor" size="xs" />
        <span class="text-xs font-bold text-gray-200 truncate max-w-[140px]" :title="incident.assignedTo?.name">
          {{ incident.assignedTo?.name }}
        </span>
      </div>
      <div v-else class="text-[11px] text-gray-400 italic flex items-center space-x-1">
        <font-awesome-icon icon="user" class="text-gray-400 text-[10px]" />
        <span>Unassigned</span>
      </div>

      <span v-if="incident.eventCode" class="inline-flex items-center justify-center text-center h-6 px-2.5 rounded text-xs font-bold text-accentYellow/90 bg-accentYellow/10 border border-accentYellow/20 font-mono uppercase tracking-wider flex-shrink-0 leading-none" title="Event Code">
        <font-awesome-icon icon="trophy" class="mr-1 text-[10px]" />{{ incident.eventCode }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import UserAvatar from './UserAvatar.vue';

const props = defineProps({
  incident: { type: Object, required: true },
  triageLoadingAction: { type: String, default: null }
});

const emit = defineEmits(['accept-triage', 'reject-triage']);

const authStore = useAuthStore();
const isStaffUser = computed(() => authStore.isAdmin || authStore.isFTA || authStore.isCSA);

const formatStatus = (s) => {
  if (s === 'PENDING_SCREENING') return 'IN_TRIAGE';
  return s;
};

const statusBadgeClass = computed(() => {
  switch (props.incident.status) {
    case 'PENDING_SCREENING': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'REJECTED': return 'bg-accentCoral/15 text-accentCoral border border-accentCoral/30';
    case 'OPEN': return 'bg-primaryTeal/10 text-primaryTeal border border-primaryTeal/25';
    case 'ASSIGNED': return 'bg-accentYellow/10 text-accentYellow border border-accentYellow/25';
    case 'IN_PROGRESS': return 'bg-accentPurple/10 text-accentPurple border border-accentPurple/25';
    case 'WAITING': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'RESOLVED': return 'bg-accentGreen/10 text-accentGreen border border-accentGreen/30';
    case 'CLOSED': return 'bg-gray-800/80 text-gray-500 border border-gray-700/50';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});

const priorityBadgeClass = computed(() => {
  switch (props.incident.priority) {
    case 'LOW': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'MEDIUM': return 'bg-blue-950/40 text-blue-400 border border-blue-900/30';
    case 'HIGH': return 'bg-accentCoral/10 text-accentCoral border border-accentCoral/20';
    case 'CRITICAL': return 'bg-red-950/40 text-red-400 border border-red-900/30 animate-pulse';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
});

const formatCategory = (cat) => {
  if (!cat) return 'OTHER';
  return cat.replace('_', ' ');
};
</script>
