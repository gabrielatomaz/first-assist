<template>
  <div class="bg-bgCard p-6 rounded-2xl shadow border border-borderDefault flex flex-col justify-between space-y-4 hover:shadow-md transition h-full">
    <div class="space-y-4">
      <!-- Quick Triage Action Buttons on Top of the Incident with Separator Line -->
      <div v-if="incident.status === 'PENDING_SCREENING' && isStaffUser" class="border-b border-borderSubtle pb-3 flex items-center justify-end space-x-2" @click.stop.prevent>
        <BaseButton
          size="sm"
          variant="success"
          icon="check"
          :loading="triageLoadingAction === 'accept'"
          :disabled="!!triageLoadingAction"
          @click.stop.prevent="emit('accept-triage', incident._id)"
          title="Accept ticket into Open queue"
          class="min-w-[80px] justify-center"
        >
          {{ triageLoadingAction === 'accept' ? 'Accepting...' : 'Accept' }}
        </BaseButton>
        <BaseButton
          size="sm"
          variant="danger"
          icon="xmark"
          :loading="triageLoadingAction === 'reject'"
          :disabled="!!triageLoadingAction"
          @click.stop.prevent="emit('reject-triage', incident._id)"
          title="Reject ticket"
          class="min-w-[80px] justify-center"
        >
          {{ triageLoadingAction === 'reject' ? 'Rejecting...' : 'Reject' }}
        </BaseButton>
      </div>

      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <router-link :to="`/teams/${incident.teamNumber}`" @click.stop class="font-extrabold text-white text-lg hover:text-primaryTeal hover:underline font-mono">
            Team {{ incident.teamNumber }}
          </router-link>
          <p class="text-xs text-textMuted font-medium">
            Match: <span class="text-textMain font-mono font-semibold">{{ incident.matchNumber || 'N/A' }}</span>
          </p>
        </div>

        <div class="flex flex-col items-end space-y-1.5">
          <StatusBadge :status="incident.status" />
          <PriorityBadge :priority="incident.priority" />
        </div>
      </div>

      <!-- Category Badge -->
      <div>
        <CategoryBadge :category="incident.category" />
      </div>

      <p class="text-sm text-textMain line-clamp-2 leading-relaxed min-h-[2.5rem]">{{ incident.description }}</p>
    </div>

    <!-- Footer: Assigned Technical (Left) & Event Code Badge (Right) -->
    <div class="border-t border-borderSubtle pt-3 flex items-center justify-between text-xs">
      <div v-if="incident.assignedTo" class="flex items-center space-x-2">
        <UserAvatar :icon="incident.assignedTo?.avatarIcon" :color="incident.assignedTo?.avatarColor" size="xs" />
        <span class="text-xs font-bold text-textMain truncate max-w-[140px]" :title="incident.assignedTo?.name">
          {{ incident.assignedTo?.name }}
        </span>
      </div>
      <div v-else class="text-[11px] text-textMuted italic flex items-center space-x-1">
        <font-awesome-icon icon="user" class="text-textMuted text-[10px]" />
        <span>Unassigned</span>
      </div>

      <span v-if="incident.eventCode" class="h-6 px-2.5 rounded-md text-xs font-bold text-accentYellow/90 bg-accentYellow/10 border border-accentYellow/20 font-mono uppercase tracking-wider inline-flex items-center justify-center leading-none flex-shrink-0" title="Event Code">
        <font-awesome-icon icon="trophy" class="mr-1 text-[10px]" />{{ incident.eventCode }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import UserAvatar from './UserAvatar.vue';
import StatusBadge from './common/StatusBadge.vue';
import PriorityBadge from './common/PriorityBadge.vue';
import CategoryBadge from './common/CategoryBadge.vue';
import BaseButton from './common/BaseButton.vue';

const props = defineProps({
  incident: { type: Object, required: true },
  triageLoadingAction: { type: String, default: null }
});

const emit = defineEmits(['accept-triage', 'reject-triage']);

const authStore = useAuthStore();
const isStaffUser = computed(() => authStore.isAdmin || authStore.isFTA || authStore.isCSA);
</script>
