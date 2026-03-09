import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logoGreenWhite from "@/assets/logo-green-white.png";

interface TermsAcceptanceProps {
  employeeId: string;
  bankVerified: boolean;
  onAccepted: () => void;
}

export default function TermsAcceptance({ employeeId, bankVerified, onAccepted }: TermsAcceptanceProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDashboardCta, setShowDashboardCta] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setSubmitting(true);

    const updateFields: Record<string, unknown> = {
      tcs_accepted: true,
      tcs_accepted_date: new Date().toISOString(),
    };

    // Auto-activate if bank is also verified
    if (bankVerified) {
      updateFields.status = "Active";
    }

    const { error } = await supabase
      .from("employees")
      .update(updateFields)
      .eq("employee_id", employeeId);

    if (error) {
      toast.error("Failed to save acceptance. Please try again.");
      setSubmitting(false);
      return;
    }

    toast.success("Terms accepted successfully!");
    setSubmitting(false);
    setShowDashboardCta(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary px-4 py-3 flex items-center border-b border-accent/30">
        <img src={logoGreenWhite} alt="Lamoola" className="h-8" />
      </header>

      <main className="mx-auto max-w-[520px] px-4 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed space-y-3">
              <p className="font-semibold text-foreground">LAMOOLA EARLY WAGE ACCESS — TERMS OF USE</p>
              <p>
                By using the Lamoola Early Wage Access service, you agree to the following terms and conditions.
                Please read them carefully before proceeding.
              </p>
              <p>
                <strong>1. Service Description</strong><br />
                Lamoola provides early access to a portion of your earned salary before your regular payday.
                The amount available is calculated based on the number of working days elapsed in the current
                payroll period and the access limits set by your employer.
              </p>
              <p>
                <strong>2. Fees</strong><br />
                A service fee may apply to each withdrawal. The fee structure is determined by your employer
                and will be clearly displayed before you confirm any request. Fees are deducted from the
                requested amount.
              </p>
              <p>
                <strong>3. Repayment</strong><br />
                All amounts accessed through the service will be deducted from your salary on your next payday.
                You acknowledge that accessed funds reduce your net pay for the current payroll period.
              </p>
              <p>
                <strong>4. Eligibility</strong><br />
                You must be an active employee of a registered Lamoola partner employer. Your bank details
                must be verified before you can submit requests.
              </p>
              <p>
                <strong>5. Privacy</strong><br />
                Your personal and financial information is processed in accordance with the Protection of
                Personal Information Act (POPIA). We do not share your data with third parties without
                your consent, except as required by law.
              </p>
              <p>
                <strong>6. Limitation of Liability</strong><br />
                Lamoola acts as a facilitator between you and your employer. We are not responsible for
                delays caused by banking systems or employer payroll processing.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-tcs"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
              />
              <label htmlFor="accept-tcs" className="text-sm text-foreground cursor-pointer leading-snug">
                I have read and accept the Terms & Conditions
              </label>
            </div>

            <Button
              onClick={handleAccept}
              disabled={!accepted || submitting}
              className="w-full h-12 text-base font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
            >
              {submitting ? "Saving…" : "Accept & Continue"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
