import type { Tables } from "@/integrations/supabase/types";

type Employee = Tables<"employees">;
type Employer = Tables<"employers">;

/**
 * Earned Salary Calculation Engine
 *
 * Parses text-based payroll period fields (e.g. "1st of month", "25th", "Last working day")
 * and calculates earned salary, available balance, fees, and cutoff status.
 */

/* ── Date parsing helpers ── */

/** Extract a day number from text like "1st of month", "25th", "15", etc. Returns null if unparseable. */
function extractDayFromText(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/(\d+)/);
  if (match) {
    const day = parseInt(match[1], 10);
    if (day >= 1 && day <= 31) return day;
  }
  return null;
}

/** Get the current pay period start date based on a text description. Defaults to day 1 of current month. */
function parsePeriodStart(text: string | null): Date {
  const now = new Date();
  const day = extractDayFromText(text) ?? 1;
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), day);
  // If the start day is in the future, the current period started last month
  if (startThisMonth > now) {
    return new Date(now.getFullYear(), now.getMonth() - 1, day);
  }
  return startThisMonth;
}

/** Get the current pay period end date based on a text description. Defaults to last day of month. */
function parsePeriodEnd(text: string | null, periodStart: Date): Date {
  const day = extractDayFromText(text);
  if (day) {
    // End is on 'day' of the next month relative to period start (or same month if end > start day)
    const endSameMonth = new Date(periodStart.getFullYear(), periodStart.getMonth(), day);
    if (endSameMonth > periodStart) return endSameMonth;
    // Otherwise it's in the following month
    return new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, day);
  }
  // Default: last day of the month containing periodStart
  return new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
}

/** Parse payday text into a Date for the current period. Returns null if unparseable. */
function parsePayday(text: string | null, periodEnd: Date): Date | null {
  const day = extractDayFromText(text);
  if (!day) return null;
  // Payday is typically on or after period end
  const paydayThisMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), day);
  if (paydayThisMonth >= periodEnd) return paydayThisMonth;
  return new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, day);
}

/* ── Working day helpers ── */

function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/* ── Main calculation ── */

export interface SalaryCalcResult {
  grossSalary: number;
  periodStart: Date;
  periodEnd: Date;
  totalWorkingDays: number;
  workingDaysElapsed: number;
  dailyRate: number;
  earnedToDate: number;
  maxPercent: number;
  accessibleAmount: number;
  alreadyAccessed: number;
  availableBalance: number;
  maxPerTransaction: number;
  maxPerPayPeriod: number | null;
  feePercent: number;
  feeFlat: number;
  approvalMode: string;
  cutoffDays: number;
  daysUntilCutoff: number | null;
  paydayText: string | null;
  bankLabel: string;
  bankVerified: boolean;
}

export function calculateSalary(
  employee: Employee,
  employer: Employer,
  approvedTotal: number
): SalaryCalcResult {
  const grossSalary = Number(employee.gross_salary || 0);

  // Effective fields: employee overrides employer
  const periodStartText = employee.payroll_period_start || employer.payroll_period_start;
  const periodEndText = employee.payroll_period_end || employer.payroll_period_end;
  const paydayText = employee.payday || employer.payday;
  const maxPercent = employee.access_limit_override_percent ?? employer.max_percent_earned ?? 50;
  const maxPerTransaction = Number(employee.max_transaction_override ?? employer.max_per_transaction ?? 999999);
  const maxPerPayPeriod = employer.max_per_pay_period ? Number(employer.max_per_pay_period) : null;
  const cutoffDays = employer.cutoff_days ?? 0;
  const feePercent = Number(employer.fee_percent ?? 0);
  const feeFlat = Number(employer.fee_flat_amount ?? 0);
  const approvalMode = employee.approval_mode || employer.employer_approval_mode;

  // Parse period dates from text
  const periodStart = parsePeriodStart(periodStartText);
  const periodEnd = parsePeriodEnd(periodEndText, periodStart);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalWorkingDays = countWorkingDays(periodStart, periodEnd);
  const effectiveEnd = today > periodEnd ? periodEnd : today;
  const workingDaysElapsed = effectiveEnd >= periodStart ? countWorkingDays(periodStart, effectiveEnd) : 0;

  const dailyRate = totalWorkingDays > 0 ? grossSalary / totalWorkingDays : 0;
  const earnedToDate = dailyRate * workingDaysElapsed;
  const accessibleAmount = earnedToDate * (maxPercent / 100);

  let availableBalance = Math.max(0, accessibleAmount - approvedTotal);
  // Cap at max_per_pay_period if set
  if (maxPerPayPeriod !== null) {
    const remainingPeriodCap = Math.max(0, maxPerPayPeriod - approvedTotal);
    availableBalance = Math.min(availableBalance, remainingPeriodCap);
  }

  // Cutoff calculation
  let daysUntilCutoff: number | null = null;
  const paydayDate = parsePayday(paydayText, periodEnd);
  if (paydayDate) {
    const cutoffDate = new Date(paydayDate);
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);
    const diffMs = cutoffDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    daysUntilCutoff = Math.max(0, diffDays);
  }

  // Bank info
  const bankName = employee.bank_name || "Bank";
  const acc = employee.bank_account_number;
  const bankLabel = acc && acc.length >= 4 ? `${bankName} ••••${acc.slice(-4)}` : `${bankName} ••••`;
  const bankVerified = employee.bank_verification_status === "Verified";

  return {
    grossSalary,
    periodStart,
    periodEnd,
    totalWorkingDays,
    workingDaysElapsed,
    dailyRate,
    earnedToDate,
    maxPercent,
    accessibleAmount,
    alreadyAccessed: approvedTotal,
    availableBalance,
    maxPerTransaction,
    maxPerPayPeriod,
    feePercent,
    feeFlat,
    approvalMode,
    cutoffDays,
    daysUntilCutoff,
    paydayText,
    bankLabel,
    bankVerified,
  };
}

export const formatR = (n: number) =>
  `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
