

## Plan: Move Payroll Contact to Step 4 and Add Auth Rep Toggle

### Overview

Three coordinated changes: (1) add "Payroll Contact" to the Step 4 role dropdown and remove payroll contact fields from Step 2, (2) replace the Authorised Representative manual entry with a toggle that can auto-fill from system users, (3) update Step 5 review, validation, save logic, and draft resume to match.

### Changes

**1. `src/components/employer/Step4Contacts.tsx`**

- Add `"Payroll Contact"` to `SYSTEM_USER_ROLES` array
- Add new fields to `Step4Data`: `authRepIsSystemUser: boolean` (default `true`), `authRepSelectedIndex: number | null` (default `null`)
- Update `defaultStep4` accordingly
- Replace the Authorised Representative manual-entry section with:
  - A toggle (Switch): "Is the Authorised Representative one of the system users listed above?" defaulting to Yes
  - If Yes: a Select dropdown listing system users as `"{first_name} {last_name} — {role_title}"`, selecting one auto-fills the authorised fields and renders them read-only
  - If No: show the existing manual entry fields
- Update `validateStep4`: if toggle is Yes, require a selection; if No, validate manual fields as before. Skip duplicate checks between auth rep and the system user it mirrors.
- Add new props: `onToggleAuthRepIsSystemUser` and `onSelectAuthRepFromUser`

**2. `src/pages/AddEmployer.tsx`**

- **Step 2 state**: Remove `payroll_contact_first_name`, `payroll_contact_last_name`, `payroll_contact_email`, `payroll_contact_phone` from `step2` state
- **Step 2 UI**: Remove the payroll contact name/email/phone fields from Step 2 render. Only pay cycle, payday, period start/end, export format remain.
- **Step 2 validation** (`getStep2Errors`): Remove payroll contact validations
- **Step 4 state**: Add `authRepIsSystemUser` and `authRepSelectedIndex` to step4 state, with handler functions
- **`saveEmployer`**: Stop writing `payroll_contact_*` fields to the employers table (set them to null)
- **Activation logic** (Step 4 onNext): Remove the separate "Payroll Contact from Step 2" provisioning block (lines 770-785). Instead, include "Payroll Contact" in `ROLE_MAP` mapping to `"employer_admin"`
- **`saveContacts`**: When `authRepIsSystemUser` is true and an index is selected, save the auth rep contact with the system user's data. The contact_type remains `authorised_representative`.
- **Draft resume**: When loading contacts, detect if the auth rep's name/email matches a system user to restore the toggle state. Filter system users from `contact_type = 'system_user'` (currently `'general'` — keep using `'general'` since that's the existing convention, OR migrate to `'system_user'`). Actually, keep using `'general'` to avoid a migration. On resume, if auth rep data matches a system user, set `authRepIsSystemUser: true` and `authRepSelectedIndex` to the matching index; otherwise set toggle to false.

**3. `src/components/employer/Step5ReviewConfirm.tsx`**

- Remove `payroll_contact_*` fields from `Step2Data` interface and from the Payroll & Pay Cycle review card
- The Contacts card already shows system users (which now includes Payroll Contact) and the auth rep — no change needed there

**4. No database migration needed** — `payroll_contact_*` columns stay in the employers table (nullable), we just stop writing to them. The `employer_contacts` table already handles everything.

### Draft Resume Detail

When resuming, after building `systemUsers` from general contacts:
- Check if `authRep` exists and its email matches any system user's email
- If match found: `authRepIsSystemUser = true`, `authRepSelectedIndex = matchedIndex`
- If no match: `authRepIsSystemUser = false`, populate manual fields as before

