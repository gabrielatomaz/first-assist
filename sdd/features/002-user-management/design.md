# Technical Design — User Management (FEAT-002)

## Frontend Views

### 1. `UserManagementView.vue`
* Only accessible to accounts with `ADMIN` role.
* Displays a table of all registered users.
* Includes search text inputs and role filters.
* Contains a "Deactivate" toggle next to each user row.

### 2. `UserCreateModal.vue`
* Popup form triggered from the user list.
* Prompts for Name, Email, Temporary Password, and Role select menu.

---

## Backend Modules

### 1. User Controller & Service (`userController.js`)
* **`getUsers`**: Accessible only to Admins. Fetches all users from DB.
* **`createUser`**: Generates bcrypt salt, hashes the temporary password, and saves the new User document.
* **`updateUserStatus`**: Updates the target user's `status` field.
