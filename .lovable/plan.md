

## Plan: Role-Based Sidebar and Navigation for Employer Users

### Problem
All employer roles see the same sidebar and can access all employer routes. No route protection exists. Several sidebar links (employees, disbursements, reports, profile, settings) have no corresponding routes or pages. ApprovalQueue uses AdminLayout even when accessed via `/employer/approvals`.

### Architecture

**1. Create `src/config/rolePermissions.ts`** — Central permissions config mapping `role_title` (from `employer_contacts`) to allowed routes and default landing page:

```text
Employer System Admin → Dashboard, Employees (full), Approvals, Disbursements, Invoices & Statements, Profile (with Manage Users), Settings
HR Manager → Approvals, Employees (read-only), Disbursements (view), Invoices & Statements
Supervisor → Approvals only
Payroll Contact → Dashboard, Employees (read-only), Disbursements, Invoices & Statements
Finance Manager → Dashboard, Disbursements (read-only), Invoices & Statements
```

Each role entry includes: `allowedRoutes` (list of path prefixes), `sidebarItems` (which menu items to show), `defaultRoute`, and `readOnlyRoutes` (paths where edit controls are hidden).

**2. Create `src/hooks/useEmployerRole.ts`** — Hook that fetches the current user's `role_title` from `employer_contacts` (matching by email or user profile), caches it, and returns `{ roleTitle, permissions, loading }`. This is the single source of truth for employer-side role checks.

**3. Create `src/components/employer/EmployerRouteGuard.tsx`** — Wrapper component that:
- Uses `useEmployerRole` to get permissions
- Checks if current path is in `allowedRoutes`
- If not, redirects to `defaultRoute`
- Lamoola staff (`owner`/`admin` auth roles) bypass all checks
- Shows loading spinner while checking

**4. Update `src/components/employer/EmployerLayout.tsx`** — Pass `roleTitle` from `useEmployerRole` to `EmployerSidebar` so it can filter menu items.

**5. Update `src/components/employer/EmployerSidebar.tsx`** — Accept `roleTitle` prop, use `rolePermissions` config to filter which sidebar groups/items are shown. Add new menu items: Invoices & Statements, Profile, Settings (for admin only).

**6. Update `src/App.tsx`** — Wrap all `/employer/*` routes with `EmployerRouteGuard`. Add placeholder routes that don't exist yet:
- `/employer/employees` → placeholder page (read-only employee list for employer side)
- `/employer/disbursements` → placeholder page
- `/employer/invoices` → placeholder page
- `/employer/profile` → employer's own profile view
- `/employer/settings` → placeholder page

**7. Create placeholder pages** — Simple pages wrapped in `EmployerLayout` with "Coming soon" or basic content:
- `src/pages/employer/EmployerEmployees.tsx`
- `src/pages/employer/EmployerDisbursements.tsx`
- `src/pages/employer/EmployerInvoices.tsx`
- `src/pages/employer/EmployerSettings.tsx`
- `src/pages/employer/EmployerProfileView.tsx` — Shows employer profile (similar to admin's EmployerProfile but self-service). Includes a **Manage Users** section visible only to Employer System Admin with: add new user, edit user, deactivate user, and reset password buttons.

**8. Update `src/pages/ApprovalQueue.tsx`** — Make layout context-aware: if path starts with `/employer/`, use `EmployerLayout`; otherwise use `AdminLayout`.

**9. Update `src/pages/Login.tsx`** — After determining auth role for employer-side roles, also fetch `role_title` from `employer_contacts` to determine the correct default landing page per the permissions config (supervisor → `/employer/approvals`, hr_approver → `/employer/approvals`, employer_admin → `/employer/dashboard`). This already works for supervisor/hr_approver but needs refinement for edge cases.

### Files Summary

| File | Action |
|------|--------|
| `src/config/rolePermissions.ts` | Create |
| `src/hooks/useEmployerRole.ts` | Create |
| `src/components/employer/EmployerRouteGuard.tsx` | Create |
| `src/components/employer/EmployerLayout.tsx` | Update (pass role) |
| `src/components/employer/EmployerSidebar.tsx` | Update (filter by role) |
| `src/pages/employer/EmployerEmployees.tsx` | Create (placeholder) |
| `src/pages/employer/EmployerDisbursements.tsx` | Create (placeholder) |
| `src/pages/employer/EmployerInvoices.tsx` | Create (placeholder) |
| `src/pages/employer/EmployerSettings.tsx` | Create (placeholder) |
| `src/pages/employer/EmployerProfileView.tsx` | Create (with Manage Users for admin) |
| `src/pages/ApprovalQueue.tsx` | Update (dual layout) |
| `src/App.tsx` | Update (add routes + guard) |

### Manage Users (Employer Profile → Admin Only)

The Manage Users section on `EmployerProfileView` will:
- Show a table of all system users for the employer
- **Add User**: Dialog with first name, last name, email, phone, role selection → inserts into `employer_contacts` and calls the `create-user-account` edge function
- **Edit User**: Dialog to update name, phone, role
- **Deactivate**: Sets a flag (we'll need a migration to add `is_active boolean default true` to `employer_contacts`) and disables their auth account
- **Reset Password**: Reuses existing `reset-user-password` edge function

### Database Migration

Add `is_active` column to `employer_contacts` for deactivation support:
```sql
ALTER TABLE employer_contacts ADD COLUMN is_active boolean NOT NULL DEFAULT true;
```

### Key Design Decisions
- Role is determined by `role_title` in `employer_contacts`, not auth role (since multiple role_titles map to the same auth role like `employer_admin`)
- The `useEmployerRole` hook matches the logged-in user's email against `employer_contacts.email` for their employer
- Lamoola staff (owner/admin) always bypass route guards
- Read-only mode is controlled by passing a prop from the permissions config, not by creating separate page variants

