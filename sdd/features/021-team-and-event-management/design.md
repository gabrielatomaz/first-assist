# Technical Design: FEAT-021 — Multi-Team & Multi-Event Context & FTA Team Approval

---

## 1. Data Schema & Multiplicity Validation

### 1.1 `TeamMembership` Model (`backend/src/models/TeamMembership.js`)
Enforces team-scoped roles (`LEAD_MENTOR`, `TEAM_CAPTAIN`, `TEAM_MEMBER`):
```js
import mongoose from 'mongoose';

const teamMembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teamNumber: { type: Number, required: true, index: true },
  teamRole: { 
    type: String, 
    enum: ['LEAD_MENTOR', 'TEAM_CAPTAIN', 'TEAM_MEMBER'], 
    default: 'TEAM_MEMBER',
    required: true 
  },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Enforce max 1 active LEAD_MENTOR and max 1 active TEAM_CAPTAIN per team via partial unique indexes
teamMembershipSchema.index(
  { teamNumber: 1, teamRole: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { teamRole: { $in: ['LEAD_MENTOR', 'TEAM_CAPTAIN'] } } 
  }
);

export const TeamMembership = mongoose.model('TeamMembership', teamMembershipSchema);
```

---

## 2. Shared Incident Control Middleware

### `canManageTeamIncident` Middleware (`backend/src/middleware/authMiddleware.js`)
Grants equal permission to **Lead Mentors** and **Team Captains** for adding, editing, and deleting team incidents:
```js
export const canManageTeamIncident = async (req, res, next) => {
  if (['ADMIN', 'FTA', 'CSA'].includes(req.user.role)) return next();

  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident ticket not found' });

  // Find user's active membership for incident.teamNumber
  const membership = await TeamMembership.findOne({
    user: req.user._id,
    teamNumber: incident.teamNumber
  });

  if (!membership) {
    return res.status(403).json({ error: 'Forbidden. You do not belong to this team.' });
  }

  // Both LEAD_MENTOR and TEAM_CAPTAIN have full Add/Edit/Delete permissions
  if (['LEAD_MENTOR', 'TEAM_CAPTAIN'].includes(membership.teamRole)) {
    req.membership = membership;
    req.incident = incident;
    return next();
  }

  return res.status(403).json({ 
    error: 'Forbidden. Only the active Lead Mentor or Team Captain can edit or delete team incidents.' 
  });
};
```

---

## 3. Team Access Request Approval Logic

```js
// Inside teamAccessRequestController.approveRequest:
const approveRequest = async (req, res) => {
  const { id } = req.params;
  const request = await TeamAccessRequest.findById(id);
  
  if (['LEAD_MENTOR', 'TEAM_CAPTAIN'].includes(request.requestedRole)) {
    const existingLeader = await TeamMembership.findOne({
      teamNumber: request.teamNumber,
      teamRole: request.requestedRole
    });

    if (existingLeader) {
      return res.status(400).json({ 
        error: `Cannot approve request. Team ${request.teamNumber} already has an active ${request.requestedRole.replace('_', ' ')}.` 
      });
    }
  }
  // Proceed with canonical team creation, event registration, user setup & membership
};
```

---

## 4. Frontend Component & State Design

### 4.1 `TeamAccessRequestModal.vue` (`frontend/src/components/TeamAccessRequestModal.vue`)
- Styled following `AccessRequestModal.vue` (`bg-black/50 backdrop-blur-sm`, `max-w-md`).
- Allows team mentors/captains to submit team registration requests.
- **Launched from the Login page** (`LoginView.vue`) via a link in the footer section, following the exact same pattern used for the FTA Access Request modal (`AccessRequestModal.vue`).

### 4.2 `LoginView.vue` Additions
- Adds a second button/link in the login page footer: **"Register Team Access"** alongside the existing **"Request FTA Event Access"** link.
- Clicking it opens `TeamAccessRequestModal.vue` as a fixed overlay modal.
- Pattern reference (existing FTA request link):
```html
<button @click="showRequestModal = true" class="text-xs font-bold text-primaryTeal hover:underline ...">
  <font-awesome-icon icon="id-card" /> Request FTA Event Access
</button>
```
- New team request link follows the same structure:
```html
<button @click="showTeamRequestModal = true" class="text-xs font-bold text-accentYellow hover:underline ...">
  <font-awesome-icon icon="users" /> Register Team Access
</button>
```

### 4.3 `FTADashboardView.vue` Additions
- Adds **Pending Team Requests** review table for FTAs.
- Displays requests where `request.eventCode` matches FTA's `assignedEventCodes`.
- Provides 1-click **Approve** and **Reject** actions.

### 4.4 `authStore` Context Switcher (`frontend/src/stores/auth.js`)
- `teamMemberships`: `[{ teamNumber, teamName, teamRole }]`
- `activeTeamNumber`: Currently selected team number.
- `activeEventCode`: Currently selected event code.
- `isLeadMentor`: `computed(() => currentTeamRole.value === 'LEAD_MENTOR')`
- `isTeamCaptain`: `computed(() => currentTeamRole.value === 'TEAM_CAPTAIN')`
