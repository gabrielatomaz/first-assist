<template>
  <div class="max-w-5xl mx-auto space-y-8 mt-8 animate-fadeIn text-textMain">
    <!-- Header -->
    <PageHeader
      title="Admin Panel"
      subtitle="System accounts, access requests, TBA registrations, and audit logs"
      icon="user-shield"
      :card="true"
    />

    <!-- Health Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Backend Node API Status" value="ONLINE" variant="green" />
      <StatCard title="Total Logged System Actions" :value="auditLogs.length" variant="teal" />
      <StatCard title="MongoDB Atlas Cluster" value="CONNECTED" variant="purple" />
    </div>

    <!-- Styled Reject Access Request Modal -->
    <ConfirmationModal
      v-model="rejectModal.open"
      title="Reject Access Request?"
      :message="`Are you sure you want to reject the FTA access request for ${rejectModal.requesterName}? You can provide an optional rejection reason below.`"
      icon="user-xmark"
      variant="danger"
      confirm-text="Reject Request"
      confirm-icon="xmark"
      cancel-text="Cancel"
      :loading="processingReq === rejectModal.requestId"
      loading-text="Rejecting..."
      :show-input="true"
      input-label="Optional Rejection Reason"
      input-placeholder="e.g. Event assignment unverified"
      v-model:input-value="rejectModal.reason"
      @confirm="executeRejectRequest"
    />

    <!-- FTA Access Approved Success CSS Modal -->
    <div v-if="approvalModal.open" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div class="bg-bgCard border border-emerald-500/40 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-5">
        <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-2xl">
          <font-awesome-icon icon="circle-check" />
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-extrabold text-white">{{ approvalModal.title }}</h3>
          <p class="text-xs text-gray-300 leading-relaxed font-medium">
            {{ approvalModal.message }}
          </p>
        </div>
        <div v-if="approvalModal.requesterName" class="p-3 bg-bgMain rounded-xl border border-gray-800 text-xs text-primaryTeal font-mono font-bold">
          <font-awesome-icon icon="user-check" class="mr-1 text-emerald-400" /> {{ approvalModal.requesterName }} is now Active (Role: FTA)
        </div>
        <button 
          @click="approvalModal.open = false" 
          class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow transition cursor-pointer text-sm"
        >
          Done
        </button>
      </div>
    </div>

    <!-- Full-Screen TBA Event Sync Loading Modal Overlay for Admin Approval -->
    <div v-if="isApprovingTBA" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div class="bg-bgCard border border-primaryTeal/40 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-5">
        <div class="inline-block animate-spin rounded-full h-14 w-14 border-4 border-primaryTeal border-t-transparent"></div>
        <div class="space-y-2">
          <h3 class="text-xl font-extrabold text-white">Importing Event & Roster...</h3>
          <p class="text-xs text-gray-300 leading-relaxed font-medium">
            Fetching official event metadata and bulk-syncing participating team rosters from <span class="text-accentPurple font-bold">The Blue Alliance API</span>.
          </p>
        </div>
        <div class="p-3 bg-bgMain rounded-xl border border-gray-800 text-[11px] text-accentYellow font-mono font-bold animate-pulse">
          <font-awesome-icon icon="bolt" class="mr-1 text-accentYellow" /> Please wait — Registering event and updating FTA access permissions
        </div>
      </div>
    </div>

    <!-- FTA Access Requests Section -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
      <div class="flex justify-between items-center border-b border-gray-800 pb-3">
        <div class="flex items-center space-x-2">
          <font-awesome-icon icon="id-card" class="text-teal-400" />
          <h3 class="text-base font-bold text-teal-400 tracking-tight">Pending FTA Event Access Requests</h3>
          <span v-if="pendingRequests.length > 0" class="px-2 py-0.5 text-[10px] font-extrabold bg-accentCoral text-white rounded-full font-mono">
            {{ pendingRequests.length }}
          </span>
        </div>
        <button @click="fetchAccessRequests" class="text-xs text-teal-400 hover:text-teal-300 hover:underline font-bold cursor-pointer">
          Refresh List
        </button>
      </div>

      <div v-if="loadingRequests" class="text-center py-6 text-xs text-gray-400">
        Loading access requests...
      </div>
      <div v-else-if="pendingRequests.length === 0" class="text-center py-8 text-xs text-gray-400 font-medium italic">
        No pending FTA event access requests.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-bgMain border-b border-gray-800 text-[11px] font-bold uppercase tracking-wider text-teal-400">
              <th class="px-4 py-3">Requester Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Requested Events</th>
              <th class="px-4 py-3">Notes</th>
              <th class="px-4 py-3">Submitted</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800 text-xs">
            <tr v-for="req in pendingRequests" :key="req._id" class="hover:bg-bgMain/30 transition">
              <td class="px-4 py-3 font-bold text-white text-xs">{{ req.name }}</td>
              <td class="px-4 py-3 text-xs text-gray-300 font-mono">{{ req.email }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span v-for="code in req.requestedEventCodes" :key="code" class="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-teal-500/15 text-teal-400 border border-teal-500/25">
                    {{ code }}
                  </span>
                  <span v-if="req.tbaEventKey" class="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-accentPurple/15 text-purple-300 border border-accentPurple/25 flex items-center gap-1.5">
                    <font-awesome-icon icon="bolt" class="text-accentYellow text-xs" /> {{ req.tbaEventKey }} (TBA)
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-300 max-w-xs truncate" :title="req.notes">{{ req.notes || 'N/A' }}</td>
              <td class="px-4 py-3 text-xs text-gray-300 font-mono">{{ formatDate(req.createdAt) }}</td>
              <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                <button 
                  @click="handleApproveRequest(req)"
                  :disabled="processingReq === req._id"
                  title="Approve Request"
                  class="w-7 h-7 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 inline-flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                >
                  <font-awesome-icon icon="check" class="text-[11px]" />
                </button>
                <button 
                  @click="openRejectModal(req)"
                  :disabled="processingReq === req._id"
                  title="Reject Request"
                  class="w-7 h-7 rounded-md bg-red-950/60 hover:bg-red-900/60 text-accentCoral border border-red-900/40 inline-flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                >
                  <font-awesome-icon icon="xmark" class="text-[11px]" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System User Accounts Management Section -->
    <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-4">
      <div class="flex justify-between items-center border-b border-gray-800 pb-3">
        <div>
          <h3 class="text-base font-bold text-teal-400 tracking-tight">System User Accounts</h3>
          <p class="text-xs text-gray-400 mt-0.5">Manage system accounts, access roles (Admin, FTA, CSA), and regional assignments</p>
        </div>
        <BaseButton
          @click="showCreateUserForm = !showCreateUserForm"
          :variant="showCreateUserForm ? 'secondary' : 'primary'"
          size="sm"
          :icon="showCreateUserForm ? 'xmark' : 'user-plus'"
        >
          <span v-if="!showCreateUserForm">Register</span>
        </BaseButton>
      </div>

      <!-- Create User Form Card -->
      <div v-if="showCreateUserForm" class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 animate-fadeIn">
        <h4 class="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">Register Authorized System User</h4>
        <form @submit.prevent="handleCreateUser" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Name</label>
              <input v-model="userForm.name" type="text" required placeholder="e.g. John Doe" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
              <input v-model="userForm.email" type="email" required placeholder="user@first.org" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Temporary Password</label>
              <input v-model="userForm.password" type="password" required placeholder="******" class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">System Role</label>
              <CustomSelect
                v-model="userForm.role"
                :options="userRoleOptions"
                button-class="py-2.5 px-4 text-sm"
              />
            </div>
          </div>

          <div v-if="createUserError" class="text-accentCoral text-xs font-medium bg-red-950/40 rounded p-3">
            {{ createUserError }}
          </div>

          <div class="flex justify-end pt-2">
            <BaseButton
              type="submit"
              variant="primary"
              size="sm"
              :disabled="creatingUser || !userForm.name || !userForm.email || !userForm.password"
              :loading="creatingUser"
              loading-text="Registering..."
            >
              Register
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Users Table -->
      <div v-if="loadingUsers" class="text-center py-6 text-xs text-gray-400">
        Loading users list...
      </div>

      <div v-else-if="usersError" class="bg-red-950/40 text-accentCoral p-4 text-center text-xs font-medium border border-red-900/30">
        {{ usersError }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-bgMain border-b border-gray-800 text-[11px] font-bold uppercase tracking-wider text-teal-400">
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Assigned Regional(s)</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800 text-xs">
            <tr v-for="u in users" :key="u._id" class="hover:bg-bgMain/30 transition">
              <td class="px-4 py-3 font-bold text-white text-xs">{{ u.name }}</td>
              <td class="px-4 py-3 text-xs text-gray-300 font-mono">{{ u.email }}</td>
              <td class="px-4 py-3">
                <RoleBadge :role="u.role" />
              </td>

              <!-- Assigned Regionals Column -->
              <td class="px-4 py-3">
                <div v-if="u.role === 'CSA'" class="flex items-center space-x-2">
                  <CustomSelect
                    v-model="u.assignedEventCode"
                    :options="csaUserEventOptions"
                    @change="saveUserEventAssignment(u)"
                    class="w-56 font-bold"
                  />
                </div>

                <div v-else-if="u.role === 'FTA'" class="space-y-2 max-w-xs">
                  <div class="flex items-center space-x-2">
                    <CustomSelect
                      :model-value="''"
                      :options="ftaAddRegionalOptions"
                      @change="addFTARegionalValue(u, $event)"
                      class="w-56 font-bold"
                    />
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="code in u.assignedEventCodes" :key="code" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-accentYellow/15 text-accentYellow border border-accentYellow/25">
                      <span>{{ code }}</span>
                      <button @click="removeFTARegional(u, code)" class="text-xs hover:text-red-400 font-bold ml-1 cursor-pointer">✕</button>
                    </span>
                    <span v-if="!u.assignedEventCodes || u.assignedEventCodes.length === 0" class="text-[10px] text-gray-400 italic">No regionals assigned</span>
                  </div>
                </div>

                <span v-else class="text-xs text-gray-400 italic">N/A (Admin)</span>
              </td>

              <td class="px-4 py-3">
                <span :class="{
                  'bg-accentGreen/10 text-accentGreen border border-accentGreen/30': u.status === 'ACTIVE',
                  'bg-red-950/40 text-accentCoral border border-red-900/30': u.status === 'INACTIVE'
                }" class="px-2.5 py-1 rounded-md text-xs font-bold uppercase font-mono tracking-wider">
                  {{ u.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button
                  @click="toggleUserStatus(u)"
                  :disabled="updatingUserStatus === u._id"
                  :class="u.status === 'ACTIVE' ? 'text-accentCoral hover:text-accentCoral/80' : 'text-accentGreen hover:text-accentGreen/80'"
                  class="text-xs font-semibold hover:underline disabled:opacity-50 transition cursor-pointer"
                >
                  {{ u.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TBA Event & Team Management Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Register FRC Event Card -->
      <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-5">
        <div class="border-b border-gray-800 pb-3 flex justify-between items-center">
          <h3 class="text-base font-bold text-teal-400">Register FRC Event</h3>
          <span class="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-accentPurple/15 text-purple-300 border border-accentPurple/25">TBA 1-Click Import</span>
        </div>

        <!-- TBA Event Import Section -->
        <div class="p-4 bg-bgMain rounded-xl border border-gray-800 space-y-3">
          <label class="block text-xs font-bold text-teal-400 uppercase">Import Event & Roster from TBA</label>
          <div class="flex space-x-2">
            <input v-model="tbaEventKey" type="text" placeholder="Enter TBA Event Key (e.g. 2026brsp)" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgCard text-textMain text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
            <button 
              @click="handleImportTBAEvent" 
              :disabled="importingTBAEvent || !tbaEventKey" 
              title="Import Event and Attending Teams from TBA"
              class="bg-primaryTeal hover:brightness-110 text-gray-200 font-bold px-3.5 py-2 rounded-lg text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm whitespace-nowrap flex-shrink-0 border border-primaryTeal/30"
            >
              <font-awesome-icon :icon="importingTBAEvent ? 'spinner' : 'download'" :spin="importingTBAEvent" class="text-sm" />
            </button>
          </div>
        </div>

        <div class="text-center text-[10px] text-gray-400 font-bold uppercase">— OR Manual Creation —</div>

        <form @submit.prevent="handleCreateEvent" class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Event Key/Code</label>
            <input v-model="eventForm.code" type="text" required placeholder="e.g. 2026brsp" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Event Name</label>
            <input v-model="eventForm.name" type="text" required placeholder="e.g. Brazil Regional" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Location</label>
            <input v-model="eventForm.location" type="text" placeholder="e.g. Sao Paulo, Brazil" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
          </div>
          <div class="flex items-center space-x-2">
            <input v-model="eventForm.isActive" type="checkbox" id="isActiveEvent" class="rounded text-teal-400 focus:ring-teal-500/20">
            <label for="isActiveEvent" class="text-xs text-gray-300 font-medium">Set as Active Competition Event</label>
          </div>

          <button type="submit" :disabled="creatingEvent || !eventForm.code || !eventForm.name" class="w-full bg-primaryTeal hover:brightness-110 text-gray-200 font-bold py-2.5 rounded-lg shadow text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-primaryTeal/30">
            {{ creatingEvent ? 'Creating...' : 'Create' }}
          </button>
        </form>
      </div>

      <!-- Register FRC Team Card -->
      <div class="bg-bgCard p-6 rounded-2xl shadow border border-gray-800 space-y-5">
        <div class="border-b border-gray-800 pb-3 flex justify-between items-center">
          <h3 class="text-base font-bold text-teal-400">Register FRC Team</h3>
          <span class="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-teal-500/15 text-teal-400 border border-teal-500/25">TBA API Enabled</span>
        </div>

        <form @submit.prevent="handleRegisterTeam" class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Team Number</label>
            <div class="flex space-x-2">
              <input v-model.number="teamForm.number" type="number" required placeholder="e.g. 254" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
              <button type="button" @click="fetchFromTBA" :disabled="fetchingTBA || !teamForm.number" class="bg-accentPurple/15 hover:bg-accentPurple/25 text-purple-300 border border-accentPurple/25 disabled:opacity-40 disabled:cursor-not-allowed font-bold px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition cursor-pointer flex items-center">
                <font-awesome-icon icon="bolt" class="mr-1 text-accentYellow text-sm" /> {{ fetchingTBA ? 'Syncing...' : 'Lookup TBA' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Team Name / Nickname</label>
            <input v-model="teamForm.name" type="text" required placeholder="e.g. The Cheesy Poofs" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rookie Year</label>
            <input v-model.number="teamForm.rookieYear" type="number" placeholder="e.g. 1999" class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400">
          </div>

          <div class="pt-6">
            <button type="submit" :disabled="registeringTeam || !teamForm.number || !teamForm.name" class="w-full bg-primaryTeal hover:brightness-110 text-gray-200 font-bold py-2.5 rounded-lg shadow text-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-primaryTeal/30">
              {{ registeringTeam ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- System Audit Logs Section -->
    <div class="bg-bgCard rounded-2xl shadow border border-gray-800 overflow-hidden transition">
      <button 
        @click="toggleAuditTimeline"
        class="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-800/30 transition cursor-pointer group select-none"
      >
        <div class="flex items-center space-x-2">
          <h3 class="text-xs font-bold text-primaryTeal uppercase tracking-wider">System Audit Log History</h3>
          <span v-if="filteredAuditLogs.length" class="text-[10px] bg-bgMain text-primaryTeal px-1.5 py-0.5 rounded font-mono font-bold border border-gray-800">
            {{ filteredAuditLogs.length }}
          </span>
        </div>
        <font-awesome-icon 
          icon="chevron-down" 
          class="w-3.5 h-3.5 text-gray-400 group-hover:text-primaryTeal transition-transform duration-200"
          :class="{ 'rotate-180': isAuditTimelineOpen }"
        />
      </button>

      <!-- Collapsible Content with Vertical Timeline Line -->
      <div v-show="isAuditTimelineOpen" class="px-6 pb-6 pt-3 border-t border-gray-800 space-y-4">
        <div v-if="filteredAuditLogs.length === 0" class="text-center py-4 text-xs text-gray-400 font-medium">
          No audit log entries matching selected criteria.
        </div>

        <!-- Vertical Timeline Track -->
        <div v-else class="relative border-l-2 border-primaryTeal/30 ml-2.5 space-y-4 my-1">
          <div 
            v-for="log in filteredAuditLogs" 
            :key="log._id" 
            class="relative pl-5 text-xs group/log"
          >
            <!-- Timeline Dot Node -->
            <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primaryTeal ring-4 ring-bgCard shadow-sm transition group-hover/log:scale-125"></div>

            <!-- Event Log Item Card -->
            <div class="bg-bgMain border border-gray-800 hover:border-gray-700 p-3 rounded-xl shadow-sm transition space-y-1">
              <div class="flex items-center justify-between">
                <span 
                  class="font-extrabold text-xs"
                  :class="{
                    'text-accentYellow': log.userId?.role === 'ADMIN',
                    'text-primaryTeal': log.userId?.role === 'FTA',
                    'text-accentPurple': log.userId?.role === 'CSA',
                    'text-gray-300': !['ADMIN', 'FTA', 'CSA'].includes(log.userId?.role)
                  }"
                >
                  {{ log.userId?.name || 'System' }}
                </span>
                <span class="text-[10px] text-gray-400 font-mono">{{ formatTime(log.createdAt) }}</span>
              </div>

              <p class="text-xs text-gray-300 font-medium leading-normal pt-0.5">{{ log.details || 'System event recorded' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  BaseButton,
  CustomSelect,
  ConfirmationModal,
  PageHeader,
  StatCard,
  RoleBadge
} from '../components';
import { getApiUrl } from '../config/api';

const authStore = useAuthStore();
const auditLogs = ref([]);
const actionFilter = ref('ALL');
const isAuditTimelineOpen = ref(false);

const toggleAuditTimeline = () => {
  isAuditTimelineOpen.value = !isAuditTimelineOpen.value;
  if (isAuditTimelineOpen.value) {
    fetchAuditLogs();
  }
};

const accessRequests = ref([]);
const loadingRequests = ref(true);
const processingReq = ref(null);

const actionOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'TBA_EVENT_IMPORT', label: 'TBA Event Import' },
  { value: 'EVENT_CREATION', label: 'Event Creation' },
  { value: 'EVENT_ACTIVATION', label: 'Event Activation' },
  { value: 'EVENT_TEAM_ADDED', label: 'Team Added to Event' },
  { value: 'EVENT_TEAM_REMOVED', label: 'Team Removed from Event' },
  { value: 'INCIDENT_STATUS_CHANGE', label: 'Status Changes' }
];

const pendingRequests = computed(() => 
  accessRequests.value.filter(r => r.status === 'PENDING')
);

const fetchAccessRequests = async () => {
  loadingRequests.value = true;
  try {
    const res = await fetch(getApiUrl('/access-requests'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      accessRequests.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch access requests:', err);
  } finally {
    loadingRequests.value = false;
  }
};

const isApprovingTBA = ref(false);
const approvalModal = ref({ open: false, title: '', message: '', requesterName: '' });
const rejectModal = ref({ open: false, requestId: null, reason: 'Event assignment unverified', requesterName: '' });

const handleApproveRequest = async (reqObj) => {
  const requestId = typeof reqObj === 'string' ? reqObj : reqObj._id;
  const isTBA = reqObj && reqObj.tbaEventKey;

  processingReq.value = requestId;
  if (isTBA) isApprovingTBA.value = true;

  try {
    const res = await fetch(getApiUrl(`/access-requests/${requestId}/approve`), {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve request');
    
    approvalModal.value = {
      open: true,
      title: 'FTA Access Request Approved!',
      message: data.message || 'The user account has been activated and assigned to the requested events.',
      requesterName: reqObj?.name || 'Requester'
    };

    fetchAccessRequests();
  } catch (err) {
    alert(err.message);
  } finally {
    processingReq.value = null;
    isApprovingTBA.value = false;
  }
};

const openRejectModal = (reqObj) => {
  const reqId = typeof reqObj === 'string' ? reqObj : reqObj._id;
  const name = reqObj?.name || 'Requester';
  rejectModal.value = {
    open: true,
    requestId: reqId,
    reason: 'Event assignment unverified',
    requesterName: name
  };
};

const executeRejectRequest = async () => {
  if (!rejectModal.value.requestId) return;
  const requestId = rejectModal.value.requestId;
  const reason = rejectModal.value.reason;
  processingReq.value = requestId;
  try {
    const res = await fetch(getApiUrl(`/access-requests/${requestId}/reject`), {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rejectionReason: reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject request');
    rejectModal.value.open = false;
    fetchAccessRequests();
  } catch (err) {
    alert(err.message);
  } finally {
    processingReq.value = null;
  }
};

const fetchAuditLogs = async () => {
  try {
    const res = await fetch(getApiUrl('/admin/audit-logs'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      auditLogs.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load system audit logs:', err);
  }
};

const filteredAuditLogs = computed(() => {
  if (actionFilter.value === 'ALL') return auditLogs.value;
  return auditLogs.value.filter(l => l.action === actionFilter.value);
});

// User Management State
const users = ref([]);
const events = ref([]);
const loadingUsers = ref(true);
const usersError = ref(null);
const showCreateUserForm = ref(false);
const userForm = ref({ name: '', email: '', password: '', role: 'CSA' });
const creatingUser = ref(false);
const createUserError = ref(null);
const updatingUserStatus = ref(null);

const userRoleOptions = [
  { value: 'CSA', label: 'Control System Advisor (CSA)' },
  { value: 'FTA', label: 'FIRST Technical Advisor (FTA)' },
  { value: 'ADMIN', label: 'Administrator' }
];

const csaUserEventOptions = computed(() => [
  { value: null, label: 'Unassigned' },
  ...events.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
]);

const ftaAddRegionalOptions = computed(() => [
  { value: '', label: '+ Add Regional to FTA' },
  ...events.value.map(ev => ({ value: ev.code, label: `${ev.name} (${ev.code})` }))
]);

const fetchEvents = async () => {
  try {
    const res = await fetch(getApiUrl('/events'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) events.value = await res.json();
  } catch (err) {
    console.error('Failed to load events:', err);
  }
};

const fetchUsers = async () => {
  loadingUsers.value = true;
  usersError.value = null;
  try {
    const res = await fetch(getApiUrl('/users'), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch users list');
    const data = await res.json();
    users.value = data.map(u => ({
      ...u,
      assignedEventCodes: u.assignedEventCodes || []
    }));
  } catch (err) {
    usersError.value = err.message;
  } finally {
    loadingUsers.value = false;
  }
};

const handleCreateUser = async () => {
  creatingUser.value = true;
  createUserError.value = null;
  try {
    const res = await fetch(getApiUrl('/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(userForm.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    
    users.value.unshift({ ...data, assignedEventCodes: data.assignedEventCodes || [] });
    showCreateUserForm.value = false;
    userForm.value = { name: '', email: '', password: '', role: 'CSA' };
    fetchAuditLogs();
  } catch (err) {
    createUserError.value = err.message;
  } finally {
    creatingUser.value = false;
  }
};

const saveUserEventAssignment = async (u) => {
  try {
    const payload = {};
    if (u.role === 'FTA') {
      payload.assignedEventCodes = u.assignedEventCodes || [];
    } else {
      payload.assignedEventCode = u.assignedEventCode || null;
    }

    const res = await fetch(getApiUrl(`/users/${u._id}/assigned-event`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update event context');
  } catch (err) {
    alert(err.message);
  }
};

const addFTARegionalValue = async (u, code) => {
  if (!code) return;
  if (!u.assignedEventCodes) u.assignedEventCodes = [];
  if (!u.assignedEventCodes.includes(code)) {
    u.assignedEventCodes.push(code);
    await saveUserEventAssignment(u);
  }
};

const removeFTARegional = async (u, code) => {
  if (!u.assignedEventCodes) return;
  u.assignedEventCodes = u.assignedEventCodes.filter(c => c !== code);
  await saveUserEventAssignment(u);
};

const toggleUserStatus = async (u) => {
  updatingUserStatus.value = u._id;
  const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const res = await fetch(getApiUrl(`/users/${u._id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle account status');
    u.status = data.status;
  } catch (err) {
    alert(err.message);
  } finally {
    updatingUserStatus.value = null;
  }
};

// TBA & Event/Team Registration State
const tbaEventKey = ref('');
const importingTBAEvent = ref(false);
const teamForm = ref({ number: '', name: '', rookieYear: '' });
const fetchingTBA = ref(false);
const registeringTeam = ref(false);
const eventForm = ref({ code: '', name: '', location: '', isActive: false });
const creatingEvent = ref(false);

const fetchFromTBA = async () => {
  if (!teamForm.value.number) return alert('Please enter a team number first');
  fetchingTBA.value = true;
  try {
    const res = await fetch(getApiUrl(`/tba/teams/${teamForm.value.number}`), {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'TBA lookup failed');
    teamForm.value.name = data.name;
    teamForm.value.rookieYear = data.rookieYear;
    alert(`Synced Team ${data.number} data from TBA!`);
  } catch (err) {
    alert(err.message);
  } finally {
    fetchingTBA.value = false;
  }
};

const handleRegisterTeam = async () => {
  registeringTeam.value = true;
  try {
    const res = await fetch(getApiUrl('/teams'), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamForm.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register team');
    alert(`Team ${data.number} registered successfully!`);
    teamForm.value = { number: '', name: '', rookieYear: '' };
    fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  } finally {
    registeringTeam.value = false;
  }
};

const handleImportTBAEvent = async () => {
  if (!tbaEventKey.value) return alert('Enter TBA Event Key');
  importingTBAEvent.value = true;
  try {
    const res = await fetch(getApiUrl(`/tba/import-event/${tbaEventKey.value}`), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    alert(data.message);
    tbaEventKey.value = '';
    fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  } finally {
    importingTBAEvent.value = false;
  }
};

const handleCreateEvent = async () => {
  creatingEvent.value = true;
  try {
    const res = await fetch(getApiUrl('/events'), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventForm.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create event');
    alert(`Event ${data.name} (${data.code}) created!`);
    eventForm.value = { code: '', name: '', location: '', isActive: false };
    fetchAuditLogs();
  } catch (err) {
    alert(err.message);
  } finally {
    creatingEvent.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchEvents();
  fetchUsers();
  fetchAccessRequests();
});
</script>
