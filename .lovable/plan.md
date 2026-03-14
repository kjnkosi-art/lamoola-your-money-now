

## Plan: Replace Payday Dropdown with Full 1st–31st Options

### Change

**File: `src/pages/AddEmployer.tsx`** (lines 34–39)

Replace the `PAYDAY_OPTIONS` array with a generated list of 31 days plus "Last working day of month":

```typescript
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const PAYDAY_OPTIONS = [
  "Last working day of month",
  ...Array.from({ length: 31 }, (_, i) => `${ordinal(i + 1)} of the month`),
];
```

This produces: `"Last working day of month"`, `"1st of the month"`, `"2nd of the month"`, `"3rd of the month"`, ..., `"31st of the month"`.

No other files or fields are modified. The value stored is the display string (e.g. `"3rd of the month"`), which is what the existing save/load logic already handles via `step2.payday`.

