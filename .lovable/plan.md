

## Issue: Only one user's password reset showed up

### Root Cause

The code correctly iterates all selected users. However, users who were never provisioned with an auth account (e.g., added as contacts but never activated) get a 404 from the edge function. The toast error fires but can be easy to miss, and only successful resets appear in the credentials modal.

### Fix

Make it clearer when some resets fail by:

1. **In `ReshareLoginsModal.tsx`**: After the reset loop completes, if some emails failed, show a summary toast: "X of Y passwords reset successfully. Z users have no auth account."

2. **In the credentials modal**: If any users failed, add them to the credentials list with a flag so the admin can see who was skipped.

### Changes

**`src/components/admin/ReshareLoginsModal.tsx`** — After the `for` loop in `resetPasswords()`:
- Track failed emails alongside credentials
- After loop, show a summary toast if any failed: `"Reset {n} of {total} — {failed} users have no auth account"`
- Still pass only successful credentials to `onCredentialsReady`

This is a ~5-line change in the `resetPasswords` function, no new files needed.

