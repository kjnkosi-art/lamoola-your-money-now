import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogOut, ArrowLeft, CheckCircle2, Clock, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import logoGreenWhite from "@/assets/logo-green-white.png";
import { calculateSalary, formatR, type SalaryCalcResult } from "@/lib/salary-calculations";

type Employee = Tables<"employees">;
type Employer = Tables<"employers">;

/**
 * Calculate fee breakdown for the "receive amount" model.
 * The employee selects the amount they want to RECEIVE.
 * Fees are calculated on top: total_advance = receive_amount + fees.
 * Percentage fee is split 50/50 into "Service fee" and "Admin fee".
 */
function calcFees(receiveAmount: number, feePercent: number, feeFlat: number) {
  const percentageFee = (receiveAmount * feePercent) / 100;
  const serviceFee = percentageFee / 2; // half of percentage component
  const adminFee = percentageFee / 2;   // other half
  const transactionFee = feeFlat;       // flat component
  const totalFees = transactionFee + serviceFee + adminFee;
  const totalAdvance = receiveAmount + totalFees;
  return { transactionFee, serviceFee, adminFee, totalFees, totalAdvance };
}

/** Max receive amount such that receive + fees <= availableBalance */
function calcMaxReceive(availableBalance: number, maxPerTransaction: number, feePercent: number, feeFlat: number) {
  // totalAdvance = receive + (receive * feePercent/100) + feeFlat
  // totalAdvance = receive * (1 + feePercent/100) + feeFlat
  // receive = (cap - feeFlat) / (1 + feePercent/100)
  const cap = Math.min(availableBalance, maxPerTransaction);
  const maxReceive = (cap - feeFlat) / (1 + feePercent / 100);
  return Math.max(0, Math.floor(maxReceive / 100) * 100);
}

export default function RequestSalaryAccess() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = Number(searchParams.get("step") || "1");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [receiveAmount, setReceiveAmount] = useState(100);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultMode, setResultMode] = useState<"auto" | "pending">("auto");

  /* ── load data ── */
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: emp } = await supabase
        .from("employees").select("*").eq("user_id", user.id).single();
      if (!emp) { toast.error("Employee record not found"); setLoading(false); return; }
      setEmployee(emp);

      const { data: er } = await supabase
        .from("employers").select("*").eq("employer_id", emp.employer_id).single();
      if (er) setEmployer(er);

      const { data: reqs } = await supabase
        .from("requests")
        .select("amount_requested, request_status")
        .eq("employee_id", emp.employee_id)
        .eq("request_status", "Approved");
      setApprovedTotal((reqs || []).reduce((s, r) => s + Number(r.amount_requested), 0));
      setLoading(false);
    };
    load();
  }, [navigate]);

  const calc: SalaryCalcResult | null = useMemo(() => {
    if (!employee || !employer) return null;
    return calculateSalary(employee, employer, approvedTotal);
  }, [employee, employer, approvedTotal]);

  /* ── fee breakdown (receive-amount model) ── */
  const fees = calc ? calcFees(receiveAmount, calc.feePercent, calc.feeFlat) : null;
  const maxSlider = calc
    ? calcMaxReceive(calc.availableBalance, calc.maxPerTransaction, calc.feePercent, calc.feeFlat)
    : 0;

  const exceedsBalance = calc && fees ? fees.totalAdvance > calc.availableBalance : false;
  const exceedsMaxTx = calc && fees ? fees.totalAdvance > calc.maxPerTransaction : false;
  const hasWarning = exceedsBalance || exceedsMaxTx;

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!employee || !employer || !calc || !fees) return;
    setSubmitting(true);

    const isAuto = calc.approvalMode === "Auto-Approved";

    // amount_requested = total salary advance (receive + fees)
    // service_fee = total fees
    // amount_to_receive = what employee selected
    const { error } = await supabase.from("requests").insert([{
      employee_id: employee.employee_id,
      employer_id: employee.employer_id,
      amount_requested: fees.totalAdvance,
      service_fee: fees.totalFees,
      fee_percent_applied: calc.feePercent,
      fee_flat_applied: calc.feeFlat,
      amount_to_receive: receiveAmount,
      earned_salary_at_request: calc.earnedToDate,
      available_balance_at_request: calc.availableBalance,
      approval_mode_applied: calc.approvalMode as "Auto-Approved" | "Supervisor Approval" | "HR Approval",
      request_status: isAuto ? "Approved" as const : "Pending" as const,
      approved_at: isAuto ? new Date().toISOString() : null,
      bank_account_masked: calc.bankLabel,
    }]);

    if (error) { toast.error(error.message); setSubmitting(false); return; }
    setResultMode(isAuto ? "auto" : "pending");
    setShowSuccess(true);
    setSubmitting(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/login"); };

  if (loading || !calc || !fees) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ═══════════════ FEE BREAKDOWN COMPONENT ═══════════════ */
  const FeeBreakdown = () => (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Transaction fee (flat component) */}
        {fees.transactionFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction fee</span>
            <span className="font-semibold text-foreground">{formatR(fees.transactionFee)}</span>
          </div>
        )}
        {/* Service fee (half of percentage) */}
        {fees.serviceFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service fee</span>
            <span className="font-semibold text-foreground">{formatR(fees.serviceFee)}</span>
          </div>
        )}
        {/* Admin fee (other half of percentage) */}
        {fees.adminFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Admin fee</span>
            <span className="font-semibold text-foreground">{formatR(fees.adminFee)}</span>
          </div>
        )}
        {/* Total salary advance */}
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total salary advance</span>
          <span className="text-lg font-extrabold text-accent">{formatR(fees.totalAdvance)}</span>
        </div>
      </CardContent>
    </Card>
  );

  /* ═══════════════ STEP 1 ═══════════════ */
  const Step1 = () => (
    <div className="space-y-6">
      <div className="rounded-xl bg-secondary p-4 text-center">
        <p className="text-xs text-secondary-foreground/70 uppercase tracking-wider font-bold mb-1">Available</p>
        <p className="text-2xl font-extrabold text-secondary-foreground">{formatR(calc.availableBalance)}</p>
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-2">Amount to receive</p>
        <p className="text-5xl font-extrabold text-foreground tracking-tight">{formatR(receiveAmount)}</p>
      </div>

      <div className="px-2">
        <Slider
          min={100}
          max={Math.max(100, maxSlider)}
          step={100}
          value={[receiveAmount]}
          onValueChange={([v]) => setReceiveAmount(v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>R 100</span>
          <span>{formatR(maxSlider)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">R</span>
        <Input
          type="number"
          min={100}
          max={maxSlider}
          step={100}
          value={receiveAmount}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= 0) setReceiveAmount(v);
          }}
          className="text-center font-bold"
        />
      </div>

      {exceedsBalance && (
        <p className="text-sm text-destructive text-center font-medium">
          Total advance exceeds your available balance of {formatR(calc.availableBalance)}
        </p>
      )}
      {exceedsMaxTx && !exceedsBalance && (
        <p className="text-sm text-destructive text-center font-medium">
          Total advance exceeds the maximum per transaction of {formatR(calc.maxPerTransaction)}
        </p>
      )}

      <FeeBreakdown />

      <Button
        onClick={() => setSearchParams({ step: "2" })}
        disabled={hasWarning || receiveAmount < 100}
        className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
      >
        Continue
      </Button>
    </div>
  );

  /* ═══════════════ STEP 2 ═══════════════ */
  const Step2 = () => (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground">Confirm your request</h2>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You will receive</span>
            <span className="font-bold text-foreground">{formatR(receiveAmount)}</span>
          </div>

          {fees.transactionFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction fee</span>
              <span className="font-semibold text-foreground">{formatR(fees.transactionFee)}</span>
            </div>
          )}
          {fees.serviceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span className="font-semibold text-foreground">{formatR(fees.serviceFee)}</span>
            </div>
          )}
          {fees.adminFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Admin fee</span>
              <span className="font-semibold text-foreground">{formatR(fees.adminFee)}</span>
            </div>
          )}

          <div className="border-t border-border pt-3 flex justify-between items-baseline">
            <span className="text-sm font-medium text-muted-foreground">Total salary advance</span>
            <span className="text-xl font-extrabold text-accent">{formatR(fees.totalAdvance)}</span>
          </div>

          <div className="flex justify-between items-center text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">Bank account</span>
            <span className="font-medium text-foreground flex items-center gap-2">
              {calc.bankLabel}
              {calc.bankVerified && (
                <Badge variant="outline" className="text-xs bg-accent/15 text-accent-foreground border-accent">Verified</Badge>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {calc.approvalMode === "Auto-Approved" ? (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">This request is auto-approved</p>
            <p className="text-xs text-blue-600 mt-0.5">Funds will be processed immediately upon submission.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              This request requires {calc.approvalMode === "Supervisor Approval" ? "supervisor" : "HR"} approval
            </p>
            <p className="text-xs text-amber-600 mt-0.5">You will be notified once your request has been reviewed.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setSearchParams({ step: "1" })} className="flex-1 h-14 rounded-xl text-base">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 h-14 rounded-xl text-base font-bold bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {submitting ? "Submitting..." : "Confirm & Submit"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary px-4 py-3 flex items-center justify-between border-b border-accent/30">
        <img src={logoGreenWhite} alt="Lamoola" className="h-8" />
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-secondary-foreground hover:text-accent gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </header>

      <main className="mx-auto max-w-[420px] px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-accent" : "bg-muted"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-accent" : "bg-muted"}`} />
        </div>
        {step === 1 ? <Step1 /> : <Step2 />}
      </main>

      <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) navigate("/employee/dashboard"); }}>
        <DialogContent className="max-w-[360px] text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {resultMode === "auto" ? (
                <span className="flex items-center justify-center gap-2">
                  <PartyPopper className="h-6 w-6 text-accent" /> Request Approved!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Clock className="h-6 w-6 text-amber-500" /> Request Submitted
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {resultMode === "auto" ? (
                <>
                  You will receive <span className="font-bold text-accent">{formatR(receiveAmount)}</span> in your bank account.
                  Total salary advance: <span className="font-bold text-foreground">{formatR(fees.totalAdvance)}</span>.
                </>
              ) : (
                <>
                  Your request to receive <span className="font-bold text-foreground">{formatR(receiveAmount)}</span> has been submitted and is pending approval.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => navigate("/employee/dashboard")} className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
            Back to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
