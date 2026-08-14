# Test Scope — User Authentication (FEAT-001)

This details testing plans to verify authentication.

## Backend Unit & Integration Tests

### 1. Controller Tests
* **Test Case**: `POST /api/auth/login` with correct password returns a signed token and 200 OK.
* **Test Case**: `POST /api/auth/login` with incorrect password returns 401.
* **Test Case**: Attempting to log in with an inactive account returns 403.

### 2. Middleware Tests
* **Test Case**: Secure routes block requests lacking an `Authorization` header with 401.
* **Test Case**: Secure routes proceed when provided with a valid signed JWT.

---

## Frontend Component Tests

### 1. View Actions
* **Test Case**: Clicking submit while fields are empty prevents submission and flags errors.
* **Test Case**: Successful login stores token in localStorage and routes the user.
