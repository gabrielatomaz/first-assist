<template>
  <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 flex flex-col space-y-4 hover:shadow-md transition">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <router-link :to="`/teams/${incident.teamNumber}`" @click.stop class="font-extrabold text-white text-lg hover:text-primaryTeal hover:underline">
          Team {{ incident.teamNumber }}
        </router-link>
        <p class="text-xs text-gray-400 font-medium">Match: {{ incident.matchNumber || 'N/A' }}</p>
      </div>

      <div class="flex flex-col items-end space-y-1.5">
        <!-- Status Badge -->
        <span :class="statusBadgeClass" class="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono uppercase">
          {{ incident.status }}
        </span>
        <!-- Priority Badge -->
        <span :class="priorityBadgeClass" class="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-widest font-mono uppercase">
          {{ incident.priority }}
        </span>
      </div>
    </div>

    <!-- Category -->
    <div class="flex items-center space-x-1.5">
      <span class="text-xs font-bold text-primaryTeal/85 bg-primaryTeal/5 border border-primaryTeal/10 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
        {{ formatCategory(incident.category) }}
      </span>
    </div>

    <p class="text-sm text-gray-300 line-clamp-2 leading-relaxed">{{ incident.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  incident: { type: Object, required: true }
});

const statusBadgeClass = computed(() => {
  switch (props.incident.status) {
    case 'OPEN': return 'bg-primaryTeal/10 text-primaryTeal border border-primaryTeal/25';
    case 'ASSIGNED': return 'bg-accentYellow/10 text-accentYellow border border-accentYellow/25';
    case 'IN_PROGRESS': return 'bg-accentPurple/10 text-accentPurple border border-accentPurple/25';
    case 'WAITING': return 'bg-gray-800 text-gray-400 border border-gray-700';
    case 'RESOLVED': return 'bg-green-950/40 text-green-400 border border-green-900/30';
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
