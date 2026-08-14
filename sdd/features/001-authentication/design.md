# Technical Design — User Authentication (FEAT-001)

## Frontend Components

### 1. `LoginView.vue`
* **Form Layout**: Custom styled container using CSS flex. Input fields for email and password.
* **Events**: `@submit.prevent="handleLogin"` dispatches auth store action.
* **Visual States**: Shows loading state during transit, and renders error alert below inputs on failure.

### 2. Pinia `authStore`
* **State**:
  * `token`: String (initializes from `localStorage.getItem('token')`).
  * `user`: Object `{ _id, name, role }`.
  * `loading`: Boolean.
  * `error`: String.
* **Actions**:
  * `login(credentials)`: Calls endpoint, stores JWT, sets user.
  * `logout()`: Clears store, removes localStorage key, redirects to `/login`.

---

## Backend Modules

### 1. `User` Schema
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['ADMIN', 'FTA', 'CSA'], required: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
});
```

### 2. Auth Controller / Service
* **Route**: `POST /api/auth/login`
* **Flow**:
  1. Finds user by `email`.
  2. Compares password with `passwordHash` using `bcrypt.compare()`.
  3. Signs token: `jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '12h' })`.
  4. Returns `token` and `user` payload.
