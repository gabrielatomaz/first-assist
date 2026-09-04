# Technical Design: FEAT-021 — Multi-Team & Multi-Event Management Context

---

## 1. Data Schema Design (MongoDB / Mongoose)

### 1.1 `Team` Model (`backend/src/models/Team.js`)
```js
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  rookieYear: { type: Number },
  city: String,
  stateProv: String,
  country: String,
  createdAt: { type: Date, default: Date.now }
});

export const Team = mongoose.model('Team', teamSchema);
```

### 1.2 `TeamMembership` Model / Schema (`backend/src/models/TeamMembership.js`)
To represent team-scoped roles without polluting the core `User` schema:
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

teamMembershipSchema.index({ user: 1, teamNumber: 1 }, { unique: true });

export const TeamMembership = mongoose.model('TeamMembership', teamMembershipSchema);
```

### 1.3 `Event` Model Alignment (`backend/src/models/Event.js`)
```js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  location: String,
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: false },
  teams: [{ type: Number, index: true }] // Array of canonical teamNumbers participating in this event
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);
```

### 1.4 `Incident` Model Composite Context (`backend/src/models/Incident.js`)
```js
// Indexing compound (teamNumber, eventCode) for fast contextual querying
incidentSchema.index({ teamNumber: 1, eventCode: 1 });
```

---

## 2. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                  Vue 3 Frontend                                   |
|                                                                                   |
|   +--------------------------+                +-------------------------------+   |
|   |   ContextSwitcher.vue    |                |         authStore             |   |
|   |  (Team & Event Dropdown) | <------------> | activeTeamNumber: 1772        |   |
|   +--------------------------+                | activeEventCode: 'brba'       |   |
|                                               +-------------------------------+   |
+-----------------------------------------------------------------------------------+
                                       |
                                HTTP REST Request
                      Authorization: Bearer <JWT Token>
                                       v
+-----------------------------------------------------------------------------------+
|                                Express.js Backend                                 |
|                                                                                   |
|   +--------------------------+                +-------------------------------+   |
|   |   contextMiddleware.js   | -------------> |   incidentController.js       |   |
|   | (Validates Team & Event) |                |   (Filters by active context) |   |
|   +--------------------------+                +-------------------------------+   |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                                  MongoDB Database                                 |
|                                                                                   |
|  [Teams] canonical number:1772  <--- [Events] code:'brba', teams:[1772]           |
|  [TeamMemberships] user_id + teamNumber:1772 + teamRole:'LEAD_MENTOR'             |
|  [Incidents] teamNumber:1772, eventCode:'brba', description:'CAN Bus Fault'       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Frontend Architecture & Pinia Store

### `authStore` Additions (`frontend/src/stores/auth.js`)
* **State**:
  * `teamMemberships`: Array of `{ teamNumber, teamName, teamRole }`.
  * `activeTeamNumber`: Currently selected team number (stored in `localStorage`).
  * `activeEventCode`: Currently selected event code (stored in `localStorage`).
* **Getters**:
  * `currentTeamRole`: Returns team-scoped role for `activeTeamNumber`.
  * `isLeadMentor`: `computed(() => currentTeamRole.value === 'LEAD_MENTOR')`.
  * `isTeamCaptain`: `computed(() => currentTeamRole.value === 'TEAM_CAPTAIN')`.
* **Actions**:
  * `setActiveTeam(teamNumber)`: Updates `activeTeamNumber`, persists to `localStorage`, reloads event options.
  * `setActiveEvent(eventCode)`: Updates `activeEventCode`, persists to `localStorage`.

---

## 4. API Endpoints

1. `GET /api/teams/my-teams`: Retrieves all team memberships for current authenticated user.
2. `POST /api/teams/:number/members`: Adds a user to a team with a team role (Lead Mentor / Admin only).
3. `DELETE /api/teams/:number/members/:userId`: Removes user from team.
4. `GET /api/teams/:number/events`: Returns all competition events associated with team.
5. `GET /api/incidents?teamNumber=1772&eventCode=brba`: Fetches incidents filtered by active context.
