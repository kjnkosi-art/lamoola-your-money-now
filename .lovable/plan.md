

## Plan: Create Employer Profile Page

### Overview
Create a new read-only Employer Profile page at `/admin/employers/:id` that displays all onboarding data in sections matching the wizard, with system user management and navigation to edit mode.

### Changes

**1. Create `src/pages/EmployerProfile.tsx`** — New page component that:
- Extracts `id` from URL params via `useParams()`
- Fetches employer data from `employers` table and contacts from `employer_contacts` table (both `general` and `authorised_representative` types)
- Displays data in 5 read-only sections using Cards:
  - **Section 1 — Company Details**: company_legal_name, registration_number, vat_number, industry_sector, physical_address
  - **Section 2 — Payroll & Pay Cycle**: pay_cycle, payday, payroll_period_start, payroll_period_end, payroll_export_format
  - **Section 3 — Policy Configuration**: employer_approval_mode, max_percent_earned, max_per_transaction, max_per_pay_period, cutoff_days, fee_percent, fee_flat_amount, settlement_method
  - **Section 4 — System Users**: Table of `general` contacts showing role_title, name, email, cellphone. Each row with a login-eligible role (using same ROLE_MAP as ReshareLoginsModal) gets a "Reset Password" button that opens the ReshareLoginsModal for that single user
  - **Section 5 — Authorised Representative**: Name, email, phone from the `authorised_representative` contact, plus indication if linked to a system user (check if auth rep name/email matches any general contact)
- Status badge at the top (using same STATUS_STYLES from AdminEmployers)
- "Edit" button navigating to `/admin/employers/new?employer={id}` (reuses existing draft-resume flow)
- Uses `AdminLayout` wrapper
- Includes ReshareLoginsModal + TempPasswordModal for password reset functionality

**2. Update `src/App.tsx`** — Add route:
```
<Route path="/admin/employers/:id" element={<EmployerProfile />} />
```
Import the new EmployerProfile component. The existing navigation in AdminEmployers.tsx already navigates to `/admin/employers/${employer.employer_id}` so no changes needed there.

### Files Modified
- `src/pages/EmployerProfile.tsx` (new)
- `src/App.tsx` (add route + import)

### No changes to
- AdminEmployers.tsx (links already point to correct route)
- Any other pages

