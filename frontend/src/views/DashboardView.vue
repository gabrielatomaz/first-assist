<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-primaryNavy">Active Incidents</h2>
      <button @click="fetchIncidents" class="text-sm text-gray-500 hover:text-primaryTeal">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Loading incidents...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <IncidentCard 
        v-for="incident in incidents" 
        :key="incident._id" 
        :incident="incident" 
      />
      <div v-if="incidents.length === 0" class="col-span-full text-center py-10 text-gray-500">
        No active incidents. The field is clear!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IncidentCard from '../components/IncidentCard.vue';

const incidents = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchIncidents = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Connects to our manually built backend
    const response = await fetch('http://localhost:3000/api/incidents');
    if (!response.ok) throw new Error('Failed to fetch incidents');
    incidents.value = await response.json();
  } catch (err) {
    error.value = err.message;
    // Mock data for MVP if backend is down
    incidents.value = [
      { _id: '1', teamNumber: 254, matchNumber: 'Q12', description: 'Radio lost power during auto.', status: 'OPEN' },
      { _id: '2', teamNumber: 1114, matchNumber: 'Q14', description: 'RoboRIO brownout causing disconnects.', status: 'INVESTIGATING' }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchIncidents();
});
</script>
