# Technical Design: FEAT-022 — FTA Event Access Request System

---

## 1. Data Schema Design (MongoDB / Mongoose)

### `AccessRequest` Model (`backend/src/models/AccessRequest.js`)
```js
import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  requestedEventCodes: { type: [String], required: true, default: [] },
  notes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String
}, { timestamps: true });

// Compound index to prevent duplicate pending submissions
accessRequestSchema.index({ email: 1, status: 1 });

export const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
```

---

## 2. Component Hierarchy & User Interface

```
+-----------------------------------------------------------------------------------+
|                                 LoginView.vue                                     |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Credentials Form (Email, Password, Submit)                                  |  |
|  +-----------------------------------------------------------------------------+  |
|  | [ Request FTA Event Access ] -> Opens AccessRequestModal.vue                 |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                             AccessRequestModal.vue                                |
|                                                                                   |
|  - Requester Name (input)                                                         |
|  - Requester Email (input)                                                        |
|  - Select Events (Checkbox pill selector / CustomSelect)                          |
|  - Justification / Notes (textarea)                                               |
|  - [ Submit Request ] -> POST /api/access-requests                                |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                            AdminDashboardView.vue                                 |
|                                                                                   |
|  Tab: "FTA Access Requests" (Badge showing pending count)                         |
|  Table: Requester | Email | Requested Events | Notes | Actions (Approve/Reject)   |
+-----------------------------------------------------------------------------------+
```

---

## 3. API & Controller Architecture

* **`accessRequestController.js`**:
  * `createRequest`: Public submission handler.
  * `getRequests`: Admin-only handler to list pending/reviewed requests.
  * `approveRequest`: Admin-only handler (`PATCH /api/access-requests/:id/approve`).
  * `rejectRequest`: Admin-only handler (`PATCH /api/access-requests/:id/reject`).
