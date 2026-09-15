# Test Scope — User Profile (FEAT-003)

This details testing plans to verify user profiles.

## Tests

### 1. API Verification
* **Test Case**: `GET /api/profile` returns the correct logged in user details including `avatarIcon` and `avatarColor`.
* **Test Case**: `PUT /api/profile` correctly updates and persists `avatarIcon` and `avatarColor`.
* **Test Case**: Changing password with correct current password succeeds.
* **Test Case**: Changing password with mismatching current password returns 400.
