# Database Architecture — FIRST Assist

This document details the MongoDB schemas used by FIRST Assist.

## Collections

### 1. User
Used for authentication, identity controls, and tracking.
* **Status**: NOT IMPLEMENTED
* **Fields**:
  * `name`: String, required.
  * `email`: String, required, unique, indexed.
  * `role`: String, required, enum: `['ADMIN', 'FTA', 'CSA']`.
  * `passwordHash`: String, required.
  * `status`: String, required, default: `'ACTIVE'`, enum: `['ACTIVE', 'INACTIVE']`.

### 2. Incident
Contains recorded field technical issues.
* **Status**: PARTIALLY IMPLEMENTED (requires expansion)
* **Fields**:
  * `teamNumber`: Number, required, indexed.
  * `matchNumber`: String, optional.
  * `description`: String, required.
  * `status`: String, default: `'OPEN'`, enum: `['OPEN', 'INVESTIGATING', 'RESOLVED']`.
  * `audioUrl`: String, optional (path to voice memos).
  * `reportedBy`: ObjectId, ref: `'User'`, required (specified only).
  * `assignedTo`: ObjectId, ref: `'User'`, optional (specified only).
  * `resolvedAt`: Date, optional (specified only).
  * `rootCause`: String, optional (specified only, mandatory for resolved state).
  * `appliedSolution`: String, optional (specified only, mandatory for resolved state).
* **Indexes**: Text index on `description`, `rootCause`, and `appliedSolution` for Knowledge Base search.

### 3. Comment
Incident communication thread.
* **Status**: NOT IMPLEMENTED
* **Fields**:
  * `incidentId`: ObjectId, ref: `'Incident'`, required, indexed.
  * `authorId`: ObjectId, ref: `'User'`, required.
  * `text`: String, required.
  * `createdAt`: Date, default: `Date.now`.

### 4. AISuggestion
Diagnostic solutions associated with reported problems.
* **Status**: PARTIALLY IMPLEMENTED
* **Fields**:
  * `incidentId`: ObjectId, ref: `'Incident'`, required, indexed.
  * `suggestedCause`: String.
  * `suggestedSolution`: String.
  * `rating`: String, default: `'UNRATED'`, enum: `['HELPFUL', 'NOT_HELPFUL', 'UNRATED']`.
