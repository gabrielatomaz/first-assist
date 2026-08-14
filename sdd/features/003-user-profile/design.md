# Technical Design — User Profile (FEAT-003)

## Frontend Components

### 1. `ProfileView.vue`
* Input bindings for `name` and `email`.
* Separate section for updating user password with standard inputs (`currentPassword`, `newPassword`, `confirmPassword`).

### 2. Pinia store actions
* Uses `authStore` to update local user state information after success.

---

## Backend Modules

### 1. Profile Router & Controller
* Uses JWT middleware to resolve current user identity via `req.user.userId`.
* **`getProfile`**: Queries Mongoose `User.findById(req.user.userId)` returning email, name, and role.
* **`updateProfile`**: Updates name and email.
* **`changePassword`**: Validates `currentPassword` match before writing `newPassword`.
