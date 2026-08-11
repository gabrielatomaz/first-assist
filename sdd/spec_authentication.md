# Spec: Authentication & Role Management

## 1. Overview
This specification details the user login and role management system for FIRST Assist. Only authorized volunteers (FTAs, CSAs) and administrators can access the system.

## 2. Data Models
### `User` (Mongoose Schema)
* `_id`: ObjectId
* `name`: String
* `role`: String (Enum: `['ADMIN', 'FTA', 'CSA']`)
* `email`: String (Unique, Indexed)
* `passwordHash`: String
* `createdAt`: Date

## 3. Backend (Node.js/Express)
### `POST /api/auth/login`
* **Purpose:** Authenticate a user and issue a JWT.
* **Payload:** 
  ```json
  { "email": "user@example.com", "password": "securepassword" }
  ```
* **Success Response (200 OK):**
  ```json
  { 
    "token": "jwt.string.here", 
    "user": { "_id": "...", "name": "John", "role": "CSA" } 
  }
  ```
* **Error Response (401 Unauthorized):** `{"error": "Invalid credentials"}`

## 4. Frontend (Vue.js)
### Views
* **`LoginView.vue`**: Contains an email and password form. Dispatches a Pinia action to call the API.
### State Management (Pinia)
* **`useAuthStore`**: Stores the JWT and user data. Handles `login` and `logout` actions. Persists the token to `localStorage`.
### Routing
* Unauthenticated users attempting to access any route other than `/login` are redirected to `/login` via Vue Router's `beforeEach` guard.

## 5. Acceptance Criteria
1. A user can log in with valid credentials and receive a JWT.
2. The user's role is stored in the frontend state to conditionally render UI elements (e.g., FTAs see different buttons than CSAs).
3. Invalid login attempts display a clear error message.
4. Logging out clears the JWT and redirects to the login screen.
