import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, CalendarDays, ShieldCheck, Users, Pencil, AlertCircle } from "lucide-react";
import type { Step3Data } from "./Step3PolicyConfig";
import type { Step4Data } from "./Step4Contacts";

interface Step1Data {
  company_legal_name: string;
  registration_number: string;
  vat_number: string;
  industry_sector: string;
  physical_address: string;
}

interface Step2Data {
  pay_cycle: string;
  payday: string;
  payroll_period_start: string;
  payroll_period_end: string;
  payroll_export_format: string;
}

interface ValidationError {
  step: number;
  label: string;
  messages: string[];
}

interface Props {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  saving: boolean;
  validationErrors: ValidationError[];
  onBack: () => void;
  onEdit: (step: number) => void;
  onConfirm: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

function feeLabel(pct: string, flat: string) {
  const p = Number(pct) || 0;
  const f = Number(flat) || 0;
  if (p > 0 && f > 0) return `${p}% + R${f.toFixed(2)} flat`;
  if (p > 0) return `${p}%`;
  return `R${f.toFixed(2)} flat`;
}

export default function Step5ReviewConfirm({ step1, step2, step3, step4, saving, validationErrors, onBack, onEdit, onConfirm }: Props) {
  const hasErrors = validationErrors.length > 0;

  // Resolve effective auth rep
  const effectiveAuthRep = step4.authRepIsSystemUser && step4.authRepSelectedIndex !== null && step4.authRepSelectedIndex < step4.systemUsers.length
    ? step4.systemUsers[step4.authRepSelectedIndex]
    : step4.authorised;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold font-nunito text-foreground">Step 5: Review & Confirm</h2>
      <p className="text-sm text-muted-foreground">Review all details before activating this employer.</p>

      {/* Validation Summary */}
      {hasErrors && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <p className="font-semibold mb-2">Complete all required fields to activate</p>
            {validationErrors.map((group) => (
              <div key={group.step} className="mb-2">
                <button
                  type="button"
                  onClick={() => onEdit(group.step)}
                  className="text-sm font-medium text-destructive underline underline-offset-2 hover:text-destructive/80"
                >
                  Step {group.step} — {group.label}
                </button>
                <ul className="list-disc list-inside text-sm text-destructive/80 mt-0.5">
                  {group.messages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Card 1: Company Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Company Details
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label="Legal Name" value={step1.company_legal_name} />
          <Row label="Registration Number" value={step1.registration_number} />
          <Row label="VAT Number" value={step1.vat_number} />
          <Row label="Industry / Sector" value={step1.industry_sector} />
          <Row label="Physical Address" value={step1.physical_address} />
        </CardContent>
      </Card>

      {/* Card 2: Payroll & Pay Cycle */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Payroll & Pay Cycle
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label="Pay Cycle" value={step2.pay_cycle} />
          <Row label="Payday" value={step2.payday} />
          <Row label="Period" value={`${step2.payroll_period_start} – ${step2.payroll_period_end}`} />
          <Row label="Export Format" value={step2.payroll_export_format} />
        </CardContent>
      </Card>

      {/* Card 3: Policy Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Policy Configuration
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row label="Approval Mode" value={step3.employer_approval_mode} />
          <Row label="Max % Earned" value={`${step3.max_percent_earned}%`} />
          <Row label="Max per Transaction" value={step3.max_per_transaction ? `R${Number(step3.max_per_transaction).toFixed(2)}` : "—"} />
          <Row label="Max per Pay Period" value={step3.max_per_pay_period ? `R${Number(step3.max_per_pay_period).toFixed(2)}` : "—"} />
          <Row label="Cut-off Days" value={`${step3.cutoff_days} days`} />
          <Row label="Fee Model" value={feeLabel(step3.fee_percent, step3.fee_flat_amount)} />
        </CardContent>
      </Card>

      {/* Card 4: Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Contacts
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">System Users</p>
          {step4.systemUsers.map((user, i) => (
            <div key={i} className="divide-y divide-border mb-2">
              <Row label="Role" value={user.role_title} />
              <Row label="Name" value={`${user.first_name} ${user.last_name}`} />
              <Row label="Email" value={user.email} />
              <Row label="Cellphone" value={user.cellphone} />
              {user.landline && <Row label="Landline" value={user.landline} />}
            </div>
          ))}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Authorised Representative</p>
          <div className="divide-y divide-border">
            <Row label="Role / Title" value={effectiveAuthRep.role_title} />
            <Row label="Name" value={`${effectiveAuthRep.first_name} ${effectiveAuthRep.last_name}`} />
            <Row label="Email" value={effectiveAuthRep.email} />
            <Row label="Cellphone" value={effectiveAuthRep.cellphone} />
            {effectiveAuthRep.landline && <Row label="Landline" value={effectiveAuthRep.landline} />}
            {step4.authRepIsSystemUser && <Row label="Source" value="Linked to system user above" />}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={saving}>← Back</Button>
        <div className="flex items-center gap-3">
          {hasErrors && (
            <span className="text-xs text-destructive font-medium">Complete all required fields to activate</span>
          )}
          <Button
            onClick={onConfirm}
            disabled={saving || hasErrors}
            className="bg-[#6AE809] hover:bg-[#5bd007] text-[#062247] font-semibold"
          >
            {saving ? "Activating…" : "Confirm & Activate Employer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
