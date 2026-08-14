<template>
  <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-100 flex flex-col space-y-4 hover:shadow-md transition">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <router-link :to="`/teams/${incident.teamNumber}`" @click.stop class="font-extrabold text-primaryNavy text-lg hover:text-primaryTeal hover:underline">
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

    <p class="text-sm text-gray-600 line-clamp-2 leading-relaxed">{{ incident.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  incident: { type: Object, required: true }
});

const statusBadgeClass = computed(() => {
  switch (props.incident.status) {
    case 'OPEN': return 'bg-accentCoral/10 text-accentCoral';
    case 'ASSIGNED': return 'bg-accentPurple/10 text-accentPurple';
    case 'IN_PROGRESS': return 'bg-accentYellow/15 text-yellow-700';
    case 'WAITING': return 'bg-gray-100 text-gray-500';
    case 'RESOLVED': return 'bg-green-100 text-green-800';
    case 'CLOSED': return 'bg-gray-200 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
  }
});

const priorityBadgeClass = computed(() => {
  switch (props.incident.priority) {
    case 'LOW': return 'bg-gray-100 text-gray-500';
    case 'MEDIUM': return 'bg-blue-100 text-blue-700';
    case 'HIGH': return 'bg-orange-100 text-orange-700';
    case 'CRITICAL': return 'bg-red-100 text-red-700 animate-pulse';
    default: return 'bg-gray-100 text-gray-400';
  }
});

const formatCategory = (cat) => {
  if (!cat) return 'OTHER';
  return cat.replace('_', ' ');
};
</script>
