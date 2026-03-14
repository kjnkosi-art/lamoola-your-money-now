

## Plan: Add Fee Stat Cards to Both Dashboards

### Current State
- **Admin Dashboard** (`src/pages/AdminDashboard.tsx`): Already has 4 stat cards (Active Employers, Active Employees, Pending Approvals, This Month Payouts). Missing "Total Fees This Month".
- **Employer Dashboard** (`src/pages/EmployerDashboard.tsx`): Has 3 stat cards (Active Employees, Pending Approvals, Recent Payouts). Missing "Total Fees This Month" card; also needs Active Requests to filter by both 'Pending' and 'Pending Approval'.

### Changes

**1. `src/pages/AdminDashboard.tsx`**
- Add `monthFees` state variable
- In the data fetch, after calculating `monthPayouts`, also sum `service_fee` from approved requests for the current month to get total fees
- Replace the existing 4-card grid with the requested 4 cards: Total Employers, Total Employees, Total Advanced This Month, Total Fees This Month
- Use Lamoola green (`text-lamoola-green` / `bg-lamoola-green/10`) for positive monetary indicators
- Keep the icon-left, number-prominent, label-underneath layout already in place

**2. `src/pages/EmployerDashboard.tsx`**
- Add `monthFees` state variable
- Update the pending approvals query to use `.in("request_status", ["Pending", "Pending Approval"])` for Active Requests
- Add fee calculation: sum `service_fee` from approved requests for the current month, scoped to this employer
- Change from 3-card to 4-card grid (`grid-cols-4`)
- Cards: Total Employees, Active Requests, Total Advanced This Month, Total Fees This Month
- Match the same clean styling with icon on left and Lamoola green accents

### Styling
Both dashboards will use the existing card pattern (icon in colored rounded box on left, label + number on right). Monetary values use Lamoola green. No other dashboard content is modified.

