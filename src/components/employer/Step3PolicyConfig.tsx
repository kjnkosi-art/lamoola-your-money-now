import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

const APPROVAL_MODES = ["Auto-Approved", "Supervisor Approval", "HR Approval"] as const;

const APPROVAL_HELP: Record<string, string> = {
  "Auto-Approved": "Requests go straight through with no review. Best for fixed-salary, low-risk employees.",
  "Supervisor Approval": "The employee's supervisor must approve each request before payout.",
  "HR Approval": "HR must approve each request before payout.",
};

export interface Step3Data {
  employer_approval_mode: string;
  max_percent_earned: string;
  max_per_transaction: string;
  max_per_pay_period: string;
  cutoff_days: string;
  fee_percent: string;
  fee_flat_amount: string;
}

export const defaultStep3: Step3Data = {
  employer_approval_mode: "Auto-Approved",
  max_percent_earned: "30",
  max_per_transaction: "",
  max_per_pay_period: "",
  cutoff_days: "3",
  fee_percent: "0",
  fee_flat_amount: "25",
};

interface Props {
  data: Step3Data;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  saving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

export function validateStep3(data: Step3Data): Record<string, string> {
  const e: Record<string, string> = {};
  if (!data.employer_approval_mode) e.employer_approval_mode = "Required";

  const pct = Number(data.max_percent_earned);
  if (!data.max_percent_earned || isNaN(pct) || pct < 1 || pct > 100) {
    e.max_percent_earned = "Enter a value between 1 and 100";
  }

  if (!data.max_per_transaction.trim() || isNaN(Number(data.max_per_transaction)) || Number(data.max_per_transaction) <= 0) {
    e.max_per_transaction = "Enter a valid amount";
  }

  if (!data.max_per_pay_period.trim() || isNaN(Number(data.max_per_pay_period)) || Number(data.max_per_pay_period) <= 0) {
    e.max_per_pay_period = "Enter a valid amount";
  }

  const cutoff = Number(data.cutoff_days);
  if (data.cutoff_days === "" || isNaN(cutoff) || cutoff < 0 || cutoff > 10) {
    e.cutoff_days = "Enter a value between 0 and 10";
  }

  const feePct = Number(data.fee_percent) || 0;
  const feeFlat = Number(data.fee_flat_amount) || 0;
  if (feePct <= 0 && feeFlat <= 0) {
    e.fee_percent = "At least one fee component must be greater than 0";
    e.fee_flat_amount = "At least one fee component must be greater than 0";
  }

  return e;
}

export default function Step3PolicyConfig({ data, onChange, errors, saving, onBack, onNext, onSaveDraft }: Props) {
  const feeExample = useMemo(() => {
    const amount = 1000;
    const pct = Number(data.fee_percent) || 0;
    const flat = Number(data.fee_flat_amount) || 0;
    const fee = (amount * pct / 100) + flat;
    const receive = amount - fee;
    return { fee: fee.toFixed(2), receive: receive.toFixed(2) };
  }, [data.fee_percent, data.fee_flat_amount]);

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <h2 className="text-lg font-semibold font-nunito text-foreground">Step 3: Policy Configuration</h2>

        {/* Approval Mode */}
        <div className="space-y-1.5">
          <Label>Approval Mode *</Label>
          <Select value={data.employer_approval_mode} onValueChange={(v) => onChange("employer_approval_mode", v)}>
            <SelectTrigger><SelectValue placeholder="Select approval mode" /></SelectTrigger>
            <SelectContent>
              {APPROVAL_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          {data.employer_approval_mode && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              {APPROVAL_HELP[data.employer_approval_mode]}
            </p>
          )}
          <p className="text-xs text-muted-foreground italic">
            This is the default for all employees. Individual employees can be overridden on their employee record.
          </p>
          <FieldError field="employer_approval_mode" />
        </div>

        {/* Max % Earned */}
        <div className="space-y-1.5">
          <Label htmlFor="max_percent_earned">Max % of Earned Salary *</Label>
          <Input
            id="max_percent_earned"
            type="number"
            min={1}
            max={100}
            value={data.max_percent_earned}
            onChange={(e) => onChange("max_percent_earned", e.target.value)}
            placeholder="30"
          />
          <p className="text-xs text-muted-foreground">e.g. 30 means employees can access up to 30% of earned salary</p>
          <FieldError field="max_percent_earned" />
        </div>

        {/* Max per Transaction & Pay Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="max_per_transaction">Max per Transaction (R) *</Label>
            <Input
              id="max_per_transaction"
              type="number"
              min={0}
              step="0.01"
              value={data.max_per_transaction}
              onChange={(e) => onChange("max_per_transaction", e.target.value)}
              placeholder="e.g. 2000.00"
            />
            <FieldError field="max_per_transaction" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_per_pay_period">Max per Pay Period (R) *</Label>
            <Input
              id="max_per_pay_period"
              type="number"
              min={0}
              step="0.01"
              value={data.max_per_pay_period}
              onChange={(e) => onChange("max_per_pay_period", e.target.value)}
              placeholder="e.g. 5000.00"
            />
            <FieldError field="max_per_pay_period" />
          </div>
        </div>

        {/* Cut-off Days */}
        <div className="space-y-1.5">
          <Label htmlFor="cutoff_days">Cut-off Days Before Payday *</Label>
          <Input
            id="cutoff_days"
            type="number"
            min={0}
            max={10}
            value={data.cutoff_days}
            onChange={(e) => onChange("cutoff_days", e.target.value)}
            placeholder="3"
          />
          <p className="text-xs text-muted-foreground">Requests blocked this many days before payday</p>
          <FieldError field="cutoff_days" />
        </div>

        {/* Fees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fee_percent">Fee Percentage (%)</Label>
            <Input
              id="fee_percent"
              type="number"
              min={0}
              step="0.01"
              value={data.fee_percent}
              onChange={(e) => onChange("fee_percent", e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">Percentage component e.g. 7.5 means 7.5%</p>
            <FieldError field="fee_percent" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fee_flat_amount">Fee Flat Amount (R)</Label>
            <Input
              id="fee_flat_amount"
              type="number"
              min={0}
              step="0.01"
              value={data.fee_flat_amount}
              onChange={(e) => onChange("fee_flat_amount", e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">Flat amount added per transaction e.g. 10.00</p>
            <FieldError field="fee_flat_amount" />
          </div>
        </div>

        {/* Live Fee Example */}
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-1">
          <p className="text-sm font-medium text-foreground">Fee Example</p>
          <p className="text-sm text-muted-foreground">
            On a <span className="font-semibold text-foreground">R1,000</span> request, fee ={" "}
            <span className="font-semibold text-primary">R{feeExample.fee}</span>, employee receives{" "}
            <span className="font-semibold text-accent">R{feeExample.receive}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack} disabled={saving}>← Back</Button>
            <Button variant="outline" onClick={onSaveDraft} disabled={saving}>Save as Draft</Button>
          </div>
          <Button onClick={onNext} disabled={saving}>Next →</Button>
        </div>
      </CardContent>
    </Card>
  );
}
