

## Plan: Fix Login Redirects for Supervisor and HR Manager

### Problem
1. Login redirects supervisor/hr_approver to `/approvals` — this route doesn't exist (404)
2. The ApprovalQueue page is only registered at `/admin/approvals`
3. The employer sidebar links to `/employer/approvals` which also has no route

### Changes

**1. `src/App.tsx`** — Add route for `/employer/approvals` pointing to `ApprovalQueue`:
```
<Route path="/employer/approvals" element={<ApprovalQueue />} />
```

**2. `src/pages/Login.tsx`** — Update the switch statement:
- Change `supervisor` and `hr_approver` redirect from `/approvals` to `/employer/approvals`
- Add `console.log` with role and redirect path before each `navigate()` call

**3. No changes needed to**:
- `employer_admin` redirect (stays `/employer/dashboard`)
- Any other pages or roles

### Summary of redirects after fix:
| Auth Role | Redirect |
|-----------|----------|
| owner / admin | /admin/dashboard |
| employer_admin | /employer/dashboard |
| supervisor | /employer/approvals |
| hr_approver | /employer/approvals |
| employee | /employee/dashboard |

