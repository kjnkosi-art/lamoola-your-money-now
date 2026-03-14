

## Plan: Make Auth Rep Fields Editable After System User Selection

### Overview

When a system user is selected from the dropdown, instead of showing read-only preview fields, copy that user's data into the `authorised` fields and render them as editable inputs. The dropdown remains as a convenience pre-fill mechanism.

### Changes

**1. `src/pages/AddEmployer.tsx`** — Update `selectAuthRepFromUser` to copy the selected system user's data into `step4.authorised`:

```typescript
const selectAuthRepFromUser = (index: number | null) => {
  setStep4((prev) => {
    const updated = { ...prev, authRepSelectedIndex: index };
    if (index !== null && index < prev.systemUsers.length) {
      const user = prev.systemUsers[index];
      updated.authorised = {
        role_title: user.role_title,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        cellphone: user.cellphone,
        landline: user.landline,
      };
    }
    return updated;
  });
};
```

**2. `src/components/employer/Step4Contacts.tsx`** — Replace the read-only preview block (lines 306-331) with the same editable form fields used in the manual entry section. When `authRepIsSystemUser` is true AND a user is selected, show the dropdown followed by editable fields populated from `data.authorised` (which was pre-filled by the handler above). Validation for the `authRepIsSystemUser === true` case should validate `data.authorised` fields (same as the `false` case) in addition to requiring a selection.

**3. `src/components/employer/Step4Contacts.tsx` — `validateStep4`** — When `authRepIsSystemUser` is true, also validate the authorised fields (since they're now editable and could be cleared).

