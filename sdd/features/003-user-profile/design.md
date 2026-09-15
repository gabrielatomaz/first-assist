# Technical Design — User Profile (FEAT-003)

## Frontend Components

### 1. `ProfileView.vue`
* Input bindings for `name` and `email`.
* Avatar Customizer widget offering preset icons (`user`, `robot`, `wrench`, `bolt`, `user-ninja`, `laptop-code`, `microchip`, `gears`, `shield-halved`, `medal`) and color swatches.
* Separate section for updating user password with standard inputs (`currentPassword`, `newPassword`, `confirmPassword`).

### 2. `UserAvatar.vue`
* Reusable circular badge component accepting `icon`, `color`, and `size` props.

### 3. Pinia store actions
* Uses `authStore` to update local user state information (including `avatarIcon` and `avatarColor`) after success.

---

## Backend Modules

### 1. Profile Router & Controller
* Uses JWT middleware to resolve current user identity via `req.user.userId`.
* **`getProfile`**: Queries Mongoose `User.findById(req.user.userId)` returning email, name, role, avatarIcon, and avatarColor.
* **`updateProfile`**: Updates name, email, avatarIcon, and avatarColor.
* **`changePassword`**: Validates `currentPassword` match before writing `newPassword`.
