# Feature Specification: FEAT-008 - Incident Comments & Discussion

## Status
Specified & Ready for Implementation

## Overview
Provides a real-time discussion thread ("Updates & Discussion") attached to each incident ticket (`/incidents/:id`). Volunteers, CSAs, FTAs, and Administrators can collaborate, share status updates, attach field photo evidence, edit their posted comments, and delete comments.

---

## User Stories

### US-008.1: Compact Update Submission
As a field volunteer or CSA, I want a compact comment input form with a small Send button so that the discussion interface does not take up excessive vertical space on mobile and desktop screens.

### US-008.2: Picture Attachment Support
As a CSA or FTA troubleshooting a robot, I want to attach a photo or image to my comment so that team technicians and other volunteers can visually inspect wiring, component damage, or error lights.

### US-008.3: Comment Editing & Deletion Permissions
As a comment author or Administrator, I want to edit or delete my posted updates so that I can correct typos, revise diagnostic findings, or clean up obsolete coordination messages.

---

## Functional Requirements

### FR-008.1: Post Comment with Optional Image
- **Endpoint**: `POST /api/incidents/:id/comments`
- **Body**: `{ text: String, imageUrl?: String }`
- **Behavior**: Saves new comment linked to `incidentId` and `authorId`. Returns populated comment object including `authorId { _id, name, role }`.

### FR-008.2: Edit Comment
- **Endpoint**: `PUT /api/comments/:commentId`
- **Body**: `{ text?: String, imageUrl?: String }`
- **Authorization**:
  - Allowed if `req.user._id === comment.authorId` OR `req.user.role === 'ADMIN'`.
  - Returns `403 Forbidden` if unauthorized user attempts edit.

### FR-008.3: Delete Comment
- **Endpoint**: `DELETE /api/comments/:commentId`
- **Authorization**:
  - Allowed if `req.user._id === comment.authorId` OR `req.user.role === 'ADMIN'`.
  - Returns `403 Forbidden` if unauthorized user attempts deletion.

---

## Database Schema (Comment)

```javascript
{
  incidentId: ObjectId (ref: 'Incident', required: true),
  authorId: ObjectId (ref: 'User', required: true),
  text: String (required: true),
  imageUrl: String (default: null), // Data URI / Image URL
  createdAt: Date,
  updatedAt: Date
}
```

---

## UI Components Design ([CommentSection.vue](file:///home/gabriela/Documents/codes/first-assist/frontend/src/components/CommentSection.vue))

1. **Compact Send Button**: Small icon button (`w-9 h-9 text-xs rounded-lg bg-primaryTeal`).
2. **Picture Attachment Input**: Image selector icon (`📷`) with live image preview thumbnail before posting.
3. **Inline Edit & Delete Actions**: Edit (`✏️`) and Delete (`🗑️`) action buttons visible only for comment author and Admin.
