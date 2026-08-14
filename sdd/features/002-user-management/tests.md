# Test Scope — User Management (FEAT-002)

This details testing plans to verify user management.

## Backend Unit & Integration Tests

### 1. Route Authorization
* **Test Case**: `GET /api/users` returns 403 when using a CSA or FTA token.
* **Test Case**: `POST /api/users` registers user database document only when authenticated as ADMIN.

### 2. Validation
* **Test Case**: Registering with an existing email returns a 409 Conflict.
* **Test Case**: Registering with missing fields returns 400 Bad Request.

---

## Frontend Integration Tests

### 1. Visibility Check
* **Test Case**: CSAs do not see navigation options directing to user management pages.
* **Test Case**: Deactivating a volunteer changes badge color classes.
