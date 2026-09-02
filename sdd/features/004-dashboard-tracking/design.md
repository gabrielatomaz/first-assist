# FEAT-004 — Design

## 1. Architecture Overview

FEAT-004 spans the full stack, from MongoDB queries through the Express API layer to the Vue.js frontend and real-time WebSocket communication.

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vue.js)                 │
│                                                     │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────┐ │
│  │ DashboardView│  │IncidentDetail  │  │ Pinia   │ │
│  │   .vue       │◄─┤  View.vue      │  │ Store   │ │
│  │  (enhanced)  │  │  (NEW)         │  │ (NEW)   │ │
│  └──────┬───────┘  └───────┬────────┘  └────┬────┘ │
│         │                  │                 │      │
│  ┌──────▼──────────────────▼─────────────────▼────┐ │
│  │         incidentService.js (NEW)               │ │
│  │   API wrapper — replaces raw fetch() calls     │ │
│  └──────────────────┬────────────────────────┬────┘ │
│                     │ HTTP                   │ WS   │
└─────────────────────┼────────────────────────┼──────┘
                      │                        │
┌─────────────────────┼────────────────────────┼──────┐
│                 Backend (Express.js)                 │
│                     │                        │      │
│  ┌──────────────────▼───┐  ┌─────────────────▼────┐ │
│  │  incidentController  │  │  Socket.io Server    │ │
│  │  (enhanced)          │  │  (NEW)               │ │
│  └──────────┬───────────┘  └──────────────────────┘ │
│             │                                       │
│  ┌──────────▼───────────┐                           │
│  │  incidentService     │                           │
│  │  (enhanced)          │                           │
│  └──────────┬───────────┘                           │
│             │                                       │
│  ┌──────────▼───────────┐                           │
│  │  incidentRepository  │                           │
│  │  (enhanced)          │                           │
│  └──────────┬───────────┘                           │
│             │                                       │
│  ┌──────────▼───────────┐                           │
│  │  Incident Model      │                           │
│  │  (+ assignedTo)      │                           │
│  └──────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

## 2. Frontend Design

### 2.1 DashboardView.vue — Enhancements

**Current state**: The existing [DashboardView.vue](file:///home/gabriela/Documents/codes/first-assist/frontend/src/views/DashboardView.vue) fetches incidents with raw `fetch()` and stores them in component-local `ref()`. It has loading, error, and empty states.

**Required changes**:

1. **Replace raw fetch() with Pinia store**: Remove the local `incidents`, `loading`, `error` refs. Use `useIncidentStore()` instead.
2. **Add status filter tabs**: A tab bar above the grid with ALL | OPEN | INVESTIGATING | RESOLVED. Selecting a tab sets `activeFilter` and the computed `filteredIncidents` updates reactively.
3. **Wire IncidentCard click**: Add `@click` handler or `<router-link>` wrapping the card to navigate to `/incidents/:id`.
4. **WebSocket integration**: On mount, connect to Socket.io and listen for `incident:created`, `incident:updated` events. Merge incoming data into the Pinia store.
5. **Remove mock fallback (optional)**: Once the API service layer handles errors properly, the mock data import can be removed or kept as a dev-mode fallback.

**Enhanced template structure**:

```vue
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-primaryNavy">Active Incidents</h2>
      <button @click="store.fetchIncidents()" class="text-sm text-gray-500 hover:text-primaryTeal">
        &#8635; Refresh
      </button>
    </div>

    <!-- Status Filter Tabs -->
    <div class="flex space-x-2 mb-6">
      <button
        v-for="tab in ['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED']"
        :key="tab"
        @click="activeFilter = tab"
        :class="[
          activeFilter === tab
            ? 'bg-primaryTeal text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        ]"
        class="px-4 py-2 rounded-full text-sm font-medium transition"
      >
        {{ tab }} ({{ countByStatus(tab) }})
      </button>
    </div>

    <!-- Loading / Error / Grid -->
    <div v-if="store.loading" class="text-center py-10">...</div>
    <div v-else-if="store.error" class="bg-red-100 ...">{{ store.error }}</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="incident in filteredIncidents"
        :key="incident._id"
        :to="{ name: 'incident-detail', params: { id: incident._id } }"
        class="block"
      >
        <IncidentCard :incident="incident" />
      </router-link>
      <div v-if="filteredIncidents.length === 0" class="col-span-full text-center py-10 text-gray-500">
        No incidents matching this filter.
      </div>
    </div>
  </div>
</template>
```

### 2.2 IncidentDetailView.vue — NEW

**Route**: `/incidents/:id` (named `incident-detail`)

**Purpose**: Full-page view showing all details of a single incident. This is the hub page that integrates comments (FEAT-005), AI suggestions (FEAT-006), and the resolve action (FEAT-007).

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ ← Back to Dashboard          Incident #<shortId>   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Team 254 — Match Q12                               │
│  Status: [OPEN ▼]          Assigned: [Select CSA ▼] │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Description                                     ││
│  │ Robot is not connecting to the field. Radio LED  ││
│  │ is blinking amber. Team reports intermittent...  ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  Created: Aug 13, 2026 3:14 PM by FTA John Smith    │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ 🤖 AI Suggestions (FEAT-006)                   ││
│  │ AISuggestionPanel.vue embedded here              ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ 💬 Comments (FEAT-005)                          ││
│  │ CommentSection.vue embedded here                 ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  [ Resolve Incident ] (FEAT-007 button)             │
└─────────────────────────────────────────────────────┘
```

**Script logic**:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIncidentStore } from '@/stores/incidentStore'
import AISuggestionPanel from '@/components/AISuggestionPanel.vue'
import CommentSection from '@/components/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const store = useIncidentStore()

const incident = ref(null)
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  incident.value = await store.fetchIncidentById(route.params.id)
  loading.value = false
})

const updateStatus = async (newStatus) => {
  if (newStatus === 'RESOLVED') {
    // Emit event to open ResolveIncidentModal (FEAT-007)
    return
  }
  await store.updateIncidentStatus(incident.value._id, newStatus)
  incident.value.status = newStatus
}

const assignIncident = async (userId) => {
  await store.assignIncident(incident.value._id, userId)
  incident.value.assignedTo = userId
}
</script>
```

### 2.3 IncidentCard.vue — Enhancements

**Current state**: [IncidentCard.vue](file:///home/gabriela/Documents/codes/first-assist/frontend/src/components/IncidentCard.vue) displays team number, match, description (2-line clamp), status badge. The "View Details →" button has no navigation.

**Required changes**:

1. **Remove the internal button**: Navigation will be handled by wrapping the card in a `<router-link>` from the parent (DashboardView).
2. **Add assigned CSA display**: Show "Assigned to: Jane Doe" or "Unassigned" below the description.
3. **Add hover state**: `hover:shadow-lg hover:-translate-y-0.5 transition-all` for clickable feel.
4. **Add time-ago display**: "Reported 5 min ago" using a `useTimeAgo` composable or a lightweight library.

### 2.4 useIncidentStore — NEW Pinia Store

**File**: `frontend/src/stores/incidentStore.js`

Pinia is installed but completely unused. This store centralizes all incident state.

```javascript
// frontend/src/stores/incidentStore.js
import { defineStore } from 'pinia'
import { incidentService } from '@/services/incidentService'

export const useIncidentStore = defineStore('incidents', {
  state: () => ({
    incidents: [],
    currentIncident: null,
    loading: false,
    error: null
  }),

  getters: {
    openIncidents:          (state) => state.incidents.filter(i => i.status === 'OPEN'),
    investigatingIncidents: (state) => state.incidents.filter(i => i.status === 'INVESTIGATING'),
    resolvedIncidents:      (state) => state.incidents.filter(i => i.status === 'RESOLVED'),
    incidentById:           (state) => (id) => state.incidents.find(i => i._id === id)
  },

  actions: {
    async fetchIncidents() {
      this.loading = true
      this.error = null
      try {
        this.incidents = await incidentService.getAll()
      } catch (err) {
        this.error = 'Failed to fetch incidents. Showing cached data.'
      } finally {
        this.loading = false
      }
    },

    async fetchIncidentById(id) {
      try {
        this.currentIncident = await incidentService.getById(id)
        return this.currentIncident
      } catch (err) {
        this.error = `Failed to load incident ${id}`
        return null
      }
    },

    async updateIncidentStatus(id, status) {
      // Optimistic update
      const incident = this.incidents.find(i => i._id === id)
      const previousStatus = incident?.status
      if (incident) incident.status = status

      try {
        const updated = await incidentService.updateStatus(id, status)
        // Sync with server response
        const index = this.incidents.findIndex(i => i._id === id)
        if (index !== -1) this.incidents[index] = updated
      } catch (err) {
        // Rollback on failure
        if (incident) incident.status = previousStatus
        throw err
      }
    },

    async assignIncident(id, userId) {
      const updated = await incidentService.assign(id, userId)
      const index = this.incidents.findIndex(i => i._id === id)
      if (index !== -1) this.incidents[index] = updated
    },

    // Called by WebSocket handler
    handleIncidentCreated(incident) {
      this.incidents.unshift(incident)
    },

    handleIncidentUpdated(updated) {
      const index = this.incidents.findIndex(i => i._id === updated._id)
      if (index !== -1) this.incidents[index] = updated
      if (this.currentIncident?._id === updated._id) {
        this.currentIncident = updated
      }
    }
  }
})
```

### 2.5 incidentService.js — NEW API Wrapper

**File**: `frontend/src/services/incidentService.js`

Replaces raw `fetch()` calls scattered in views. Centralizes API base URL, auth headers, and error handling.

```javascript
// frontend/src/services/incidentService.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.15.8:3000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('fa_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export const incidentService = {
  async getAll() {
    const response = await fetch(`${API_BASE}/incidents`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async getById(id) {
    const response = await fetch(`${API_BASE}/incidents/${id}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async updateStatus(id, status) {
    const response = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    })
    return handleResponse(response)
  },

  async assign(id, userId) {
    const response = await fetch(`${API_BASE}/incidents/${id}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assignedTo: userId })
    })
    return handleResponse(response)
  }
}
```

### 2.6 WebSocket Integration — NEW

**Backend** (`backend/src/config/socket.js`):

```javascript
import { Server } from 'socket.io'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}
```

**Emit from service layer**: After any incident mutation in `incidentService`, call `getIO().emit('incident:updated', updatedDoc)`.

**Frontend composable** (`frontend/src/composables/useSocket.js`):

```javascript
import { io } from 'socket.io-client'
import { useIncidentStore } from '@/stores/incidentStore'

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://192.168.15.8:3000'

let socket = null

export function useSocket() {
  const store = useIncidentStore()

  const connect = () => {
    if (socket) return
    socket = io(SOCKET_URL)

    socket.on('incident:created', (incident) => {
      store.handleIncidentCreated(incident)
    })

    socket.on('incident:updated', (incident) => {
      store.handleIncidentUpdated(incident)
    })
  }

  const disconnect = () => {
    socket?.disconnect()
    socket = null
  }

  return { connect, disconnect }
}
```

## 3. Backend Design

### 3.1 New Endpoint: GET /api/incidents/:id

Returns a single incident document populated with `reportedBy` and `assignedTo` user references.

**Repository addition** (`incidentRepository.js`):

```javascript
findById: async (id) => {
  return await Incident.findById(id)
    .populate('reportedBy', 'name role')
    .populate('assignedTo', 'name role')
}
```

**Controller addition** (`incidentController.js`):

```javascript
getIncidentById: async (req, res) => {
  try {
    const incident = await incidentService.getIncidentById(req.params.id)
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    res.json(incident)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

### 3.2 Enhanced Endpoint: PATCH /api/incidents/:id/status

Add `assignedTo` support and WebSocket broadcast:

```javascript
updateIncidentStatus: async (id, status, assignedTo) => {
  if (!['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
    throw new Error('Invalid status')
  }
  const updateData = { status }
  if (assignedTo) updateData.assignedTo = assignedTo
  const updated = await incidentRepository.updateFields(id, updateData)
  getIO().emit('incident:updated', updated)
  return updated
}
```

### 3.3 Incident Model Enhancement

Add fields to support assignment and resolution:

```javascript
const incidentSchema = new mongoose.Schema({
  teamNumber:      { type: Number, required: true },
  matchNumber:     String,
  description:     { type: String, required: true },
  status:          { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'], default: 'OPEN' },
  reportedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:      Date,
  rootCause:       String,
  appliedSolution: String
}, { timestamps: true })
```

## 4. Route Configuration

### Frontend Router Addition

```javascript
// frontend/src/router/routes.js
{
  path: '/incidents/:id',
  name: 'incident-detail',
  component: () => import('@/views/IncidentDetailView.vue'),
  meta: { requiresAuth: true }  // FEAT-001 route guard
}
```

## 5. Component Hierarchy

```
App.vue
├── DashboardView.vue (enhanced)
│   ├── StatusFilterTabs (inline)
│   └── IncidentCard.vue (enhanced, wrapped in router-link)
│       └── StatusBadge (inline computed class)
│
└── IncidentDetailView.vue (NEW)
    ├── StatusDropdown (inline select element)
    ├── AssignmentDropdown (inline select element)
    ├── AISuggestionPanel.vue (FEAT-006)
    ├── CommentSection.vue (FEAT-005)
    └── ResolveIncidentModal.vue (FEAT-007, conditional)
```
