

## Reshare Logins — Selective Password Reset

### What we're building

A two-phase modal flow triggered from the Employers list for Active employers:

1. **User Selection Modal** — Shows all system users for that employer (from `employer_contacts` where `contact_type = 'system_user'` plus the payroll contact from `employers`). Each row shows role, name, email, and an individual "Reset" button. A "Reset All" button at the bottom resets all at once. Checkboxes allow multi-select + bulk reset.

2. **Credentials Modal** — After resetting, the existing `TempPasswordModal` displays new credentials only for the users whose passwords were actually reset.

### New Edge Function: `reset-user-password`

**File:** `supabase/functions/reset-user-password/index.ts`

- Accepts `{ email: string }` 
- Authenticates caller, verifies they are Lamoola staff (same pattern as `create-user-account`)
- Uses `adminClient.auth.admin.listUsers()` to find the user by email
- If found, generates a random temp password, calls `adminClient.auth.admin.updateUserById(userId, { password })` 
- Returns `{ email, password, first_name, last_name }` on success
- Returns error if user not found in auth

**Config:** Add `[functions.reset-user-password] verify_jwt = false` to `supabase/config.toml`

### UI Changes: `src/pages/AdminEmployers.tsx`

1. **Add "Reshare Logins" button** for Active employers in the Actions column (Key icon)
2. **Add state** for the selection modal: `reshareTarget` (employer), `reshareUsers` (list of contacts loaded from DB), `resettingIds` (set of emails currently resetting), `resetCredentials` (results)
3. **Selection modal flow:**
   - On click, fetch `employer_contacts` where `employer_id = target` and `contact_type = 'system_user'`, plus payroll contact from `employers` table
   - Apply same `ROLE_MAP` filter (skip Finance Manager — no auth account)
   - Display table: Role | Name | Email | Reset button per row
   - Checkboxes for multi-select, "Reset Selected" and "Reset All" buttons in footer
   - On reset: call `reset-user-password` for each selected user, collect credentials
   - Close selection modal, open `TempPasswordModal` with only the reset credentials

### Reuse `TempPasswordModal`

Pass the reset results as `CredentialEntry[]` with `alreadyExisted: false` (since these are fresh passwords). The modal title/description can be adjusted via new optional props or we can leave as-is since it already shows passwords clearly.

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/reset-user-password/index.ts` | New edge function |
| `supabase/config.toml` | Add verify_jwt config for new function |
| `src/pages/AdminEmployers.tsx` | Add Reshare Logins button, selection modal, reset logic |
| `src/components/TempPasswordModal.tsx` | Add optional `title`/`description` props so it can say "Password Reset" instead of "Accounts Created" |

