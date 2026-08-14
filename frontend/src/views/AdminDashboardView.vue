<template>
  <div class="max-w-5xl mx-auto space-y-8 mt-8 animate-fadeIn">
    <!-- Header -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800">
      <h2 class="text-3xl font-extrabold text-primaryTeal tracking-tight">System Administration</h2>
      <p class="text-sm text-gray-400 font-medium mt-1">Manage system configurations, user lists, and audit log histories</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Controls Panel (Left side) -->
      <div class="lg:col-span-1 space-y-8">
        <!-- Event Registry -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
          <h3 class="text-base font-bold text-primaryTeal tracking-tight border-b border-gray-800 pb-2">Event Registration</h3>
          
          <form @submit.prevent="createEvent" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Event Key/Code</label>
              <input v-model="eventForm.code" type="text" required class="w-full px-3 py-2 rounded-lg border text-xs" placeholder="e.g. 2026brsp">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Event Name</label>
              <input v-model="eventForm.name" type="text" required class="w-full px-3 py-2 rounded-lg border text-xs" placeholder="e.g. Brazil Regional">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Location</label>
              <input v-model="eventForm.location" type="text" class="w-full px-3 py-2 rounded-lg border text-xs" placeholder="e.g. Sao Paulo, Brazil">
            </div>
            <div class="flex items-center space-x-2">
              <input v-model="eventForm.isActive" type="checkbox" id="isActive" class="rounded text-primaryTeal focus:ring-primaryTeal">
              <label for="isActive" class="text-xs text-gray-400 font-medium">Set as Active Event Context</label>
            </div>
            
            <button type="submit" class="w-full bg-primaryTeal text-white text-xs font-bold py-2 rounded shadow hover:bg-opacity-95">
              Create Event
            </button>
          </form>
        </div>

        <!-- Team Registry -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
          <h3 class="text-base font-bold text-primaryTeal tracking-tight border-b border-gray-800 pb-2">Team Registration</h3>
          
          <form @submit.prevent="registerTeam" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Team Number</label>
              <input v-model="teamForm.number" type="number" required class="w-full px-3 py-2 rounded-lg border text-xs" placeholder="e.g. 1772">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Team Name</label>
              <input v-model="teamForm.name" type="text" required class="w-full px-3 py-2 rounded-lg border text-xs" placeholder="e.g. Brazilian Trail Blazers">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rookie Year</label>
              <input v-model="teamForm.rookieYear" type="number" class="w-full px-3 py-2 rounded-lg border text-xs" placeholder="e.g. 2006">
            </div>
            
            <button type="submit" class="w-full bg-primaryTeal hover:bg-primaryTeal/90 text-white text-xs font-bold py-2 rounded shadow hover:bg-opacity-95">
              Register FRC Team
            </button>
          </form>
        </div>
      </div>

      <!-- Scroll lists and audit (Right side) -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Event list -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
          <h3 class="text-base font-bold text-primaryTeal tracking-tight border-b border-gray-800 pb-2">Registered Events</h3>
          
          <div class="max-h-64 overflow-y-auto space-y-3 pr-1">
            <div 
              v-for="ev in events" 
              :key="ev._id"
              class="p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
              :class="ev.isActive ? 'border-primaryTeal bg-primaryTeal/10' : 'bg-bgCard'"
            >
              <div class="space-y-1.5">
                <div>
                  <span class="font-bold text-textMain text-sm">{{ ev.name }} ({{ ev.code }})</span>
                  <span class="block text-[10px] text-gray-400">{{ ev.location }}</span>
                </div>
                <div class="text-[10px] text-gray-400 font-semibold">
                  Attending Teams: <span class="font-bold text-primaryTeal">{{ ev.teams?.join(', ') || 'None' }}</span>
                </div>
                <div class="flex items-center space-x-1.5 pt-1">
                  <input 
                    type="number" 
                    placeholder="Team #" 
                    class="border border-gray-700 rounded px-2 py-0.5 text-[10px] w-20 focus:outline-none focus:border-primaryTeal bg-bgMain text-textMain" 
                    @keyup.enter="addTeamToEvent($event, ev.code)"
                  >
                  <span class="text-[9px] text-gray-400 font-medium">Press Enter to add to list</span>
                </div>
              </div>
              <div>
                <button 
                  v-if="!ev.isActive"
                  @click="setActiveEvent(ev.code)"
                  class="bg-bgMain border border-gray-700 text-primaryTeal px-2.5 py-1 rounded text-[10px] font-bold shadow hover:bg-gray-800 transition"
                >
                  Set Active
                </button>
                <span v-else class="text-[9px] bg-primaryTeal text-white font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scrolling Audit Log list -->
        <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
          <div class="flex justify-between items-center border-b border-gray-800 pb-2">
            <h3 class="text-base font-bold text-primaryTeal tracking-tight">System Audit History Log</h3>
            <button @click="fetchAuditLogs" class="text-[10px] text-accentYellow hover:underline font-bold uppercase tracking-wider">
              Refresh
            </button>
          </div>

          <div class="max-h-80 overflow-y-auto space-y-2 pr-1">
            <div v-if="loadingLogs" class="text-center py-6 text-xs text-gray-400 font-bold">
              Loading audit timeline...
            </div>
            
            <div v-else-if="auditLogs.length === 0" class="text-center py-6 text-xs text-gray-400">
              No audit logs recorded yet.
            </div>

            <div 
              v-for="log in auditLogs" 
              :key="log._id"
              class="p-3 rounded-lg border border-gray-800 bg-bgMain flex flex-col space-y-2 text-[11px] leading-relaxed"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-1.5">
                  <span class="font-bold text-textMain">{{ log.userId?.name }}</span>
                  <span class="text-[9px] bg-gray-800 text-gray-400 font-extrabold uppercase font-mono px-1 py-0.5 rounded">
                    {{ log.userId?.role }}
                  </span>
                </div>
                <span class="text-gray-400 font-mono">{{ formatTime(log.timestamp) }}</span>
              </div>

              <div>
                <span class="text-primaryTeal font-extrabold font-mono uppercase tracking-wider text-[9px] mr-1.5">
                  [{{ log.action }}]
                </span>
                <span class="text-gray-200 font-medium">{{ log.details }}</span>
              </div>

              <div v-if="log.oldValue || log.newValue" class="grid grid-cols-2 gap-2 bg-bgCard p-1.5 rounded border border-gray-800 text-[10px] font-mono">
                <div>
                  <span class="block text-[8px] font-extrabold text-gray-400 uppercase">Previous</span>
                  <span class="text-gray-400 truncate block">{{ log.oldValue || 'N/A' }}</span>
                </div>
                <div>
                  <span class="block text-[8px] font-extrabold text-gray-400 uppercase">New Value</span>
                  <span class="text-accentYellow font-semibold truncate block">{{ log.newValue || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const events = ref([]);
const auditLogs = ref([]);
const loadingLogs = ref(false);

const eventForm = ref({ code: '', name: '', location: '', isActive: false });
const teamForm = ref({ number: null, name: '', rookieYear: null });

const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      events.value = await response.json();
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchAuditLogs = async () => {
  loadingLogs.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/admin/audit-logs', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (response.ok) {
      auditLogs.value = await response.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingLogs.value = false;
  }
};

const addTeamToEvent = async (event, eventCode) => {
  const teamNumber = Number(event.target.value);
  if (!teamNumber) return;
  try {
    const response = await fetch(`http://localhost:3000/api/events/${eventCode}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ teamNumber })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add team to event');
    event.target.value = ''; // clear input
    alert(`Team ${teamNumber} added to event attendance list!`);
    await fetchEvents();
    await fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  }
};

const createEvent = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(eventForm.value)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create event');
    
    eventForm.value = { code: '', name: '', location: '', isActive: false };
    await fetchEvents();
    await fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  }
};

const registerTeam = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(teamForm.value)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register team');
    
    teamForm.value = { number: null, name: '', rookieYear: null };
    alert('Team registered successfully!');
    await fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  }
};

const setActiveEvent = async (code) => {
  try {
    const response = await fetch(`http://localhost:3000/api/events/${code}/active`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to set active event');
    await fetchEvents();
    await fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  }
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchEvents();
  fetchAuditLogs();
});
</script>
