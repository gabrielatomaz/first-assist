<template>
  <div class="bg-bgCard rounded-lg shadow p-4 border-l-4" :class="statusColor">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h3 class="text-lg font-bold text-primaryNavy">Team {{ incident.teamNumber }}</h3>
        <p class="text-sm text-gray-500">Match: {{ incident.matchNumber || 'N/A' }}</p>
      </div>
      <span :class="badgeColor" class="px-2 py-1 text-xs font-semibold rounded-full uppercase">
        {{ incident.status }}
      </span>
    </div>
    <p class="text-textMain line-clamp-2 mt-2">{{ incident.description }}</p>
    <div class="mt-4 flex justify-end">
      <button class="text-primaryTeal font-medium hover:underline text-sm">View Details &rarr;</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  incident: {
    type: Object,
    required: true
  }
});

const statusColor = computed(() => {
  switch (props.incident.status) {
    case 'OPEN': return 'border-accentCoral';
    case 'INVESTIGATING': return 'border-accentYellow';
    case 'RESOLVED': return 'border-primaryTeal';
    default: return 'border-gray-300';
  }
});

const badgeColor = computed(() => {
  switch (props.incident.status) {
    case 'OPEN': return 'bg-accentCoral text-white';
    case 'INVESTIGATING': return 'bg-accentYellow text-primaryNavy';
    case 'RESOLVED': return 'bg-primaryTeal text-white';
    default: return 'bg-gray-200 text-gray-800';
  }
});
</script>
