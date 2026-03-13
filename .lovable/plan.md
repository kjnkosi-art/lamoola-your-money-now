

## Confirmed: Duplicates Do NOT Block Account Creation

You are right. Looking at lines 685-711 in `AddEmployer.tsx`, the duplicate phone check runs `toast.info()` but **never sets a flag or returns early**. The code flows straight from the duplicate toasts (line 711) into the account provisioning loop (line 758) without any gate.

There is also **no email duplicate check** against the database at all — only phone numbers are checked against `employer_contacts` and `employees`.

## Plan

**File: `src/pages/AddEmployer.tsx`** — Step 4 `onNext` handler (lines 685-805):

1. **Add a `hasDuplicates` boolean flag** before the duplicate check loop (line 685)
2. **Add email duplicate checks** against `employer_contacts` and `employees` tables, mirroring the phone checks
3. **Set `hasDuplicates = true`** each time a duplicate phone or email is found
4. **Change `toast.info` to `toast.error`** for duplicate notifications
5. **After the loop (line 711), add `if (hasDuplicates) return;`** — this blocks account provisioning and prevents navigation to Step 5
6. No changes to draft saving — duplicates are still allowed in drafts

This is a single-file change affecting ~30 lines in the Step 4 onNext handler.

