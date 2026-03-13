

## Plan: Create Accounts for Missing Auth Users from Reshare Logins Flow

### Overview

When password resets fail because users have no auth account, pass those failed users to the credentials modal with a new `noAuthAccount` flag. The TempPasswordModal will show a "Create Account" button for each such user. Clicking it calls the existing `create-user-account` Edge Function, provisions the account, and updates the row in-place with the new credentials.

### Changes

**1. `src/components/TempPasswordModal.tsx`**

- Add a new optional field to `CredentialEntry`: `noAuthAccount?: boolean` and `firstName?: string`, `lastName?: string`, `employerId?: string`
- For entries where `noAuthAccount === true`, show a "Create Account" button instead of the "no password" badge
- On click, call `supabase.functions.invoke("create-user-account", { body: { email, password: generatedPassword, first_name, last_name, role, employer_id } })`
- On success, update that credential entry in local state with the new password and clear the `noAuthAccount` flag so it renders normally with the password visible
- Add local state for tracking which rows are being created (loading spinner on button)

**2. `src/components/admin/ReshareLoginsModal.tsx`**

- When a reset fails (404 / no auth account), instead of only pushing to `failedEmails`, also push a `CredentialEntry` with `noAuthAccount: true`, the user's details, and the mapped auth role
- Pass both successful resets AND failed entries to `onCredentialsReady` so they all appear in the credentials modal
- Always call `onCredentialsReady` if there are any entries (successful or failed), not only when `credentials.length > 0`

**3. `src/pages/AdminEmployers.tsx`**

- Pass `employer` to the `TempPasswordModal` so it has access to `employer_id` for account creation (or embed `employerId` in the credential entries from ReshareLoginsModal — simpler approach)

### Detail: Role Mapping for Account Creation

The `ROLE_MAP` in ReshareLoginsModal already maps display roles to auth roles. When building the failed credential entry, include the mapped role (e.g., `employer_admin`, `hr_approver`, `supervisor`) so the create-user-account function receives the correct role.

### No backend changes needed — the existing `create-user-account` Edge Function already handles everything.

