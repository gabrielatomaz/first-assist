# Feature Specification: FEAT-022 — FTA Event Access Request System

**Feature ID**: FEAT-022  
**Feature Name**: Login Page FTA Event Access Request System  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-001 (User Login), FR-003 (Role-Based Access Control)  

---

## 1. Overview & Purpose

In FIRST Robotics Competition (FRC) events, technical volunteers serving as **FIRST Technical Advisors (FTAs)** require authorization for specific competition regional events (`assignedEventCodes`). Because self-registration is restricted, prospective FTAs need a seamless way from the login screen to request event access permissions directly from System Administrators.

This feature introduces the **FTA Event Access Request System**:
1. **Login Screen Request Entry Point**: Prospective or existing users can click "Request FTA Event Access" on `LoginView.vue` to submit an event access request.
2. **Access Request Submission Form**: Captures requester's `name`, `email`, requested `eventCodes` (selectable from active/registered events), and optional `notes`.
3. **Admin Review & Approval Workflow**: Admins review pending access requests in `AdminDashboardView.vue`. Approving a request automatically sets or updates the user's role to `FTA` and appends the approved event codes to `user.assignedEventCodes`.

---

## 2. Actors & Target Roles

* **Prospective / Existing FTA**: Submits event access request from the login screen.
* **ADMIN (System Administrator)**: Reviews, approves, or rejects pending access requests on the Admin Dashboard.

---

## 3. User Stories

* **US-22.1 (Submit Access Request)**: As a volunteer preparing for an FRC event, I want to request FTA authorization for specific competition events directly from the login page so that Administrators can grant me event access.
* **US-22.2 (Select Competition Events)**: As a prospective FTA, I want to select from the list of registered competition events on the request form so that I request access to the exact venues I am attending.
* **US-22.3 (Admin Review & Approval)**: As an Admin, I want to see a list of pending FTA access requests on my dashboard and approve them with one click, automatically updating user roles and assigned regional events.
* **US-22.4 (Rejection & Notification)**: As an Admin, I want to reject inappropriate requests with optional feedback notes.

---

## 4. Workflows & Functional Flows

### Main Flow: Submitting FTA Access Request
1. Volunteer opens `LoginView.vue` and clicks **"Request FTA Event Access"**.
2. A modal or dedicated request view opens displaying:
   - Name & Email input fields.
   - Event selection multi-select or checkbox list (populated from `GET /api/events/public`).
   - Justification / Notes text area.
3. User fills out the form and submits.
4. System validates inputs, creates a `PENDING` `AccessRequest` document in MongoDB, and displays a success confirmation badge.

### Admin Approval Workflow
1. Admin logs in and opens `AdminDashboardView.vue` -> **"FTA Access Requests"** tab.
2. Admin sees a table of pending requests (`Name`, `Email`, `Requested Events`, `Submission Date`, `Notes`).
3. Admin clicks **"Approve"**:
   - System checks if `User` with email exists:
     - If user exists: updates `role` to `FTA` (if not already `ADMIN`) and adds requested `eventCodes` to `user.assignedEventCodes`.
     - If user does not exist: creates new user with `role: 'FTA'`, temporary password, and requested `assignedEventCodes`.
   - System updates `AccessRequest` status to `APPROVED` with `reviewedBy` and `reviewedAt` timestamps.
4. Table updates instantly with a success notification.

---

## 5. Acceptance Criteria

* [ ] `LoginView.vue` includes a visible "Request FTA Access" link/button.
* [ ] The request modal lists all registered competition events.
* [ ] Submitting a request creates a `PENDING` request record without requiring immediate authentication.
* [ ] Duplicate pending requests for the same email and event are prevented.
* [ ] Admins can view pending requests on `AdminDashboardView.vue`.
* [ ] Approving a request updates/creates the target user with `FTA` role and assigned event codes.
* [ ] Rejecting a request marks status as `REJECTED`.
