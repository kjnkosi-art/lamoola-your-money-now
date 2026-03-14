

## Plan: Enable Finance Manager Auth Accounts

Two simple changes — update the `ROLE_MAP` in both files to map `"Finance Manager"` to `"employer_admin"` instead of `null`.

### Changes

**1. `src/pages/AddEmployer.tsx` (line 764)**
- Change `"Finance Manager": null, // contact-only, no login` → `"Finance Manager": "employer_admin",`

**2. `src/components/admin/ReshareLoginsModal.tsx` (line 32)**
- Change `"Finance Manager": null,` → `"Finance Manager": "employer_admin",`

The filtering logic in both files already uses `if (authRole)` / `if (authRole && c.email)`, so changing from `null` to `"employer_admin"` is sufficient — Finance Managers will automatically be included in account provisioning during activation and in the Reshare Logins modal. No other files need changes.

