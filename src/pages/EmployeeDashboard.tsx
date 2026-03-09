import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LogOut, KeyRound } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import logoGreenWhite from "@/assets/logo-green-white.png";
import TermsAcceptance from "./TermsAcceptance";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

type Employee = Tables<"employees">;
type Request = Tables<"requests">;

const STATUS_CHIP: Record<string, string> = {
  Pending: "bg-blue-500/15 text-blue-700 border-blue-400",
  Approved: "bg-accent/15 text-accent-foreground border-accent",
  Declined: "bg-destructive/15 text-destructive border-destructive",
};

function getWorkingDaysInMonth(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function getWorkingDaysElapsed(start: Date, today: Date): number {
  let count = 0;
  const cur = new Date(start);
  const end = today < start ? start : today;
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function daysUntil(dateStr: string | null, periodEnd: string | null, cutoffDays: number): number {
  const ref = dateStr || periodEnd;
  if (!ref) return 0;
  const target = new Date(ref);
  target.setDate(target.getDate() - cutoffDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employer, setEmployer] = useState<Tables<"employers"> | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsTcs, setNeedsTcs] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    const { data: emp } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!emp) {
      toast.error("Employee record not found");
      setLoading(false);
      return;
    }

    // Check T&Cs
    if (!emp.tcs_accepted) {
      setEmployee(emp);
      setNeedsTcs(true);
      setLoading(false);
      return;
    }

    setEmployee(emp);
    setNeedsTcs(false);

    const { data: er } = await supabase
      .from("employers")
      .select("*")
      .eq("employer_id", emp.employer_id)
      .single();
    if (er) setEmployer(er);

    const { data: reqs } = await supabase
      .from("requests")
      .select("*")
      .eq("employee_id", emp.employee_id)
      .order("created_at", { ascending: false })
      .limit(10);
    setRequests(reqs || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // If T&Cs not accepted, show acceptance screen
  if (!loading && needsTcs && employee) {
    return (
      <TermsAcceptance
        employeeId={employee.employee_id}
        bankVerified={employee.bank_verification_status === "Verified"}
        onAccepted={() => {
          setLoading(true);
          loadData();
        }}
      />
    );
  }

  // Calculations
  const grossSalary = Number(employee?.gross_salary || 0);
  const maxPercent = employee?.access_limit_override_percent ?? employer?.max_percent_earned ?? 50;
  const cutoffDays = employer?.cutoff_days ?? 0;

  const periodStart = employee?.payroll_period_start || employer?.payroll_period_start;
  const periodEnd = employee?.payroll_period_end || employer?.payroll_period_end;
  const payday = employee?.payday || employer?.payday;

  const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = periodEnd ? new Date(periodEnd) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalWorkingDays = getWorkingDaysInMonth(startDate, endDate);
  const daysElapsed = getWorkingDaysElapsed(startDate, today > endDate ? endDate : today);
  const dailyRate = totalWorkingDays > 0 ? grossSalary / totalWorkingDays : 0;
  const earned = dailyRate * daysElapsed;
  const accessible = earned * (maxPercent / 100);

  const totalAccessed = requests
    .filter((r) => r.request_status === "Approved")
    .reduce((sum, r) => sum + Number(r.amount_requested), 0);

  const available = Math.max(0, accessible - totalAccessed);
  const cutoffDaysLeft = daysUntil(payday, periodEnd, cutoffDays);

  const formatR = (n: number) =>
    `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary px-4 py-3 flex items-center justify-between border-b border-accent/30">
        <img src={logoGreenWhite} alt="Lamoola" className="h-8" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-secondary-foreground hover:text-accent gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </header>

      <main className="mx-auto max-w-[420px] px-4 py-6 space-y-5">
        <h1 className="text-xl font-bold text-foreground">
          Welcome back, {employee?.first_name} 👋
        </h1>

        {/* Balance Card */}
        <div className="rounded-2xl p-6 text-secondary-foreground bg-secondary">
          <p className="text-sm opacity-80 mb-1">Available to access</p>
          <p className="text-4xl font-extrabold tracking-tight mb-3">
            {formatR(available)}
          </p>
          <p className="text-xs opacity-70">
            Based on {maxPercent}% of {formatR(earned)} earned so far · {cutoffDaysLeft} day{cutoffDaysLeft !== 1 ? "s" : ""} until cut-off
          </p>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Earned</p>
            <p className="text-sm font-bold text-foreground">{formatR(earned)}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Accessed</p>
            <p className="text-sm font-bold text-foreground">{formatR(totalAccessed)}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Payday</p>
            <p className="text-sm font-bold text-foreground">{payday || "—"}</p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate("/employee/request?step=1")}
          className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
        >
          Request Salary Access
        </Button>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No requests yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.request_id}>
                      <TableCell className="font-semibold text-sm">
                        {formatR(Number(req.amount_requested))}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString("en-ZA")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${STATUS_CHIP[req.request_status] || ""}`}
                        >
                          {req.request_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Button
          variant="ghost"
          onClick={() => setShowChangePw(true)}
          className="w-full text-muted-foreground hover:text-foreground gap-2"
        >
          <KeyRound className="h-4 w-4" />
          Change Password
        </Button>
      </main>

      <ChangePasswordModal open={showChangePw} onClose={() => setShowChangePw(false)} />
    </div>
  );
}
