import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { Step3Data } from "./Step3PolicyConfig";
import { Step4Data } from "./Step4Contacts";

interface Step1Data {
  company_legal_name: string;
  registration_number: string;
  vat_number: string;
  industry_sector: string;
  physical_address: string;
}

interface Step2Data {
  payroll_contact_first_name: string;
  payroll_contact_last_name: string;
  payroll_contact_email: string;
  payroll_contact_phone: string;
  pay_cycle: string;
  payday: string;
  payroll_period_start: string;
  payroll_period_end: string;
  payroll_export_format: string;
}

interface Props {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  saving: boolean;
  onEdit: (step: number) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-1.5">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value || "—"}</span>
  </div>
);

function feeExample(feePercent: string, feeFlat: string) {
  const pct = Number(feePercent) || 0;
  const flat = Number(feeFlat) || 0;
  const amount = 1000;
  const fee = (amount * pct) / 100 + flat;
  const parts: string[] = [];
  if (pct > 0) parts.push(`${pct}%`);
  if (flat > 0) parts.push(`R${flat.toFixed(2)} flat`);
  return `R${fee.toFixed(2)} on R${amount} (${parts.join(" + ") || "no fee"})`;
}

export default function Step5ReviewConfirm({ step1, step2, step3, step4, saving, onEdit, onBack, onConfirm }: Props) {
  return (
    <div className="space-y-4">
      {/* Company Details */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold font-nunito text-foreground">Company Details</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)} className="gap-1.5 text-xs">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
          <Row label="Company Legal Name" value={step1.company_legal_name} />
          <Row label="Registration Number" value={step1.registration_number} />
          <Row label="VAT Number" value={step1.vat_number} />
          <Row label="Industry / Sector" value={step1.industry_sector} />
          <Row label="Physical Address" value={step1.physical_address} />
        </CardContent>
      </Card>

      {/* Payroll & Pay Cycle */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold font-nunito text-foreground">Payroll & Pay Cycle</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)} className="gap-1.5 text-xs">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
          <Row label="Payroll Contact" value={`${step2.payroll_contact_first_name} ${step2.payroll_contact_last_name}`.trim()} />
          <Row label="Email" value={step2.payroll_contact_email} />
          <Row label="Phone" value={step2.payroll_contact_phone} />
          <Row label="Pay Cycle" value={step2.pay_cycle} />
          <Row label="Payday" value={step2.payday} />
          <Row label="Period Start" value={step2.payroll_period_start} />
          <Row label="Period End" value={step2.payroll_period_end} />
          <Row label="Export Format" value={step2.payroll_export_format} />
        </CardContent>
      </Card>

      {/* Policy Configuration */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold font-nunito text-foreground">Policy Configuration</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(3)} className="gap-1.5 text-xs">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
          <Row label="Approval Mode" value={step3.employer_approval_mode} />
          <Row label="Max % of Earned Salary" value={`${step3.max_percent_earned}%`} />
          <Row label="Max per Transaction" value={step3.max_per_transaction ? `R${Number(step3.max_per_transaction).toFixed(2)}` : "No limit"} />
          <Row label="Max per Pay Period" value={step3.max_per_pay_period ? `R${Number(step3.max_per_pay_period).toFixed(2)}` : "No limit"} />
          <Row label="Cut-off Days" value={`${step3.cutoff_days} days before payday`} />
          <Row label="Fee Percentage" value={`${step3.fee_percent}%`} />
          <Row label="Fee Flat Amount" value={`R${Number(step3.fee_flat_amount || 0).toFixed(2)}`} />
          <Separator className="my-2" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Fee example:</span> {feeExample(step3.fee_percent, step3.fee_flat_amount)}
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold font-nunito text-foreground">Contacts</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)} className="gap-1.5 text-xs">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">General Contact</p>
          <Row label="Name" value={`${step4.general.first_name} ${step4.general.last_name}`.trim()} />
          <Row label="Email" value={step4.general.email} />
          <Row label="Cellphone" value={step4.general.cellphone} />
          <Row label="Landline" value={step4.general.landline} />
          <Separator className="my-3" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Authorised Representative</p>
          <Row label="Role / Title" value={step4.authorised.role_title} />
          <Row label="Name" value={`${step4.authorised.first_name} ${step4.authorised.last_name}`.trim()} />
          <Row label="Email" value={step4.authorised.email} />
          <Row label="Cellphone" value={step4.authorised.cellphone} />
          <Row label="Landline" value={step4.authorised.landline} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={saving}>← Back</Button>
        <Button
          onClick={onConfirm}
          disabled={saving}
          className="bg-[#6AE809] hover:bg-[#5BD007] text-[#062247] font-semibold gap-2"
        >
          ✓ Confirm & Activate Employer
        </Button>
      </div>
    </div>
  );
}
