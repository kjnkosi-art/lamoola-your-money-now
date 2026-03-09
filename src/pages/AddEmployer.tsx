import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import Step3PolicyConfig, { Step3Data, defaultStep3, validateStep3 } from "@/components/employer/Step3PolicyConfig";
import Step4Contacts, { Step4Data, defaultStep4, validateStep4 } from "@/components/employer/Step4Contacts";
import Step5ReviewConfirm from "@/components/employer/Step5ReviewConfirm";

const STEPS = [
  "Company Details",
  "Payroll & Pay Cycle",
  "Policy Configuration",
  "Contacts",
  "Review & Confirm",
];

const INDUSTRY_SECTORS = [
  "Food & Beverage", "Security", "Cleaning", "Retail", "Construction", "Logistics", "Other",
] as const;

const PAY_CYCLES = ["Weekly", "Bi-weekly", "Monthly"] as const;

const PAYDAY_OPTIONS = [
  "Last working day of month",
  "25th of the month",
  "15th of the month",
  "Custom date",
];

const PAYROLL_FORMATS = [
  "Standard Lamoola CSV", "Sage Pastel", "VIP Payroll", "SARS EMP201", "Custom CSV",
] as const;

export default function AddEmployer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = Number(searchParams.get("step") || "1");

  const [saving, setSaving] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 fields
  const [step1, setStep1] = useState({
    company_legal_name: "",
    registration_number: "",
    vat_number: "",
    industry_sector: "",
    physical_address: "",
  });

  // Step 2 fields
  const [step2, setStep2] = useState({
    payroll_contact_first_name: "",
    payroll_contact_last_name: "",
    payroll_contact_email: "",
    payroll_contact_phone: "",
    pay_cycle: "",
    payday: "",
    payroll_period_start: "",
    payroll_period_end: "",
    payroll_export_format: "",
  });

  // Step 3 fields
  const [step3, setStep3] = useState<Step3Data>(defaultStep3);

  // Step 4 fields
  const [step4, setStep4] = useState<Step4Data>(defaultStep4);

  const updateStep1 = (field: string, value: string) => {
    setStep1((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateStep2 = (field: string, value: string) => {
    setStep2((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateStep3 = (field: string, value: string) => {
    setStep3((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateStep4 = (section: "general" | "authorised", field: string, value: string) => {
    setStep4((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    const key = `${section}.${field}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!step1.company_legal_name.trim()) e.company_legal_name = "Required";
    if (!step1.registration_number.trim()) {
      e.registration_number = "Required";
    } else if (!/^\d{4}\/\d{7}\/\d{2}$/.test(step1.registration_number.trim())) {
      e.registration_number = "Format: YYYY/NNNNNNN/NN";
    }
    if (!step1.industry_sector) e.industry_sector = "Required";
    if (!step1.physical_address.trim()) e.physical_address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!step2.payroll_contact_first_name.trim()) e.payroll_contact_first_name = "Required";
    if (!step2.payroll_contact_last_name.trim()) e.payroll_contact_last_name = "Required";
    if (!step2.payroll_contact_email.trim()) {
      e.payroll_contact_email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step2.payroll_contact_email.trim())) {
      e.payroll_contact_email = "Invalid email";
    }
    if (!step2.payroll_contact_phone.trim()) {
      e.payroll_contact_phone = "Required";
    } else if (!/^0[6-8]\d{8}$/.test(step2.payroll_contact_phone.trim())) {
      e.payroll_contact_phone = "SA mobile: 10 digits starting 06/07/08";
    }
    if (!step2.pay_cycle) e.pay_cycle = "Required";
    if (!step2.payday) e.payday = "Required";
    if (!step2.payroll_period_start.trim()) e.payroll_period_start = "Required";
    if (!step2.payroll_period_end.trim()) e.payroll_period_end = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return null; }
    return user;
  };

  // Insert or update employer record
  const saveEmployer = async (progressLabel: string) => {
    setSaving(true);
    try {
      const user = await getUser();
      if (!user) return false;

      const payload: any = {
        company_legal_name: step1.company_legal_name.trim(),
        registration_number: step1.registration_number.trim() || null,
        vat_number: step1.vat_number.trim() || null,
        industry_sector: step1.industry_sector || null,
        physical_address: step1.physical_address.trim() || null,
        pay_cycle: (step2.pay_cycle || "Monthly") as any,
        payroll_contact_first_name: step2.payroll_contact_first_name.trim() || null,
        payroll_contact_last_name: step2.payroll_contact_last_name.trim() || null,
        payroll_contact_email: step2.payroll_contact_email.trim() || null,
        payroll_contact_phone: step2.payroll_contact_phone.trim() || null,
        payday: step2.payday || null,
        payroll_period_start: step2.payroll_period_start.trim() || null,
        payroll_period_end: step2.payroll_period_end.trim() || null,
        payroll_export_format: step2.payroll_export_format || null,
        employer_approval_mode: (step3.employer_approval_mode || "Auto-Approved") as any,
        max_percent_earned: Number(step3.max_percent_earned) || 30,
        max_per_transaction: Number(step3.max_per_transaction) || null,
        max_per_pay_period: Number(step3.max_per_pay_period) || null,
        cutoff_days: Number(step3.cutoff_days) ?? 3,
        fee_percent: Number(step3.fee_percent) || 0,
        fee_flat_amount: Number(step3.fee_flat_amount) || 25,
        status: "Draft" as const,
        onboarding_progress: progressLabel,
      };

      if (employerId) {
        const { error } = await supabase.from("employers").update(payload).eq("employer_id", employerId);
        if (error) throw error;
      } else {
        payload.created_by = user.id;
        const { data, error } = await supabase.from("employers").insert(payload).select("employer_id").single();
        if (error) throw error;
        setEmployerId(data.employer_id);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to save employer");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!step1.company_legal_name.trim()) {
      setErrors({ company_legal_name: "Company name required to save draft" });
      return;
    }
    const stepLabel = `${currentStep} of 5 steps complete`;
    const ok = await saveEmployer(stepLabel);
    if (ok) {
      toast.success("Employer saved as draft");
      navigate("/admin/employers");
    }
  };

  const handleStep1Next = async () => {
    if (!validateStep1()) return;
    const ok = await saveEmployer("1 of 5 steps complete");
    if (ok) {
      setErrors({});
      setSearchParams({ step: "2" });
    }
  };

  const handleStep2Back = () => {
    setErrors({});
    setSearchParams({ step: "1" });
  };

  const handleStep2Next = async () => {
    if (!validateStep2()) return;
    const ok = await saveEmployer("2 of 5 steps complete");
    if (ok) {
      toast.success("Step 2 complete");
      setErrors({});
      setSearchParams({ step: "3" });
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-nunito text-foreground">Add Employer</h1>
          <p className="text-sm text-muted-foreground mt-1">Onboard a new employer to the platform.</p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepNum < currentStep;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      isComplete
                        ? "bg-accent text-accent-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={`text-xs font-medium truncate hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded ${isComplete ? "bg-accent" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ===== STEP 1 ===== */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <h2 className="text-lg font-semibold font-nunito text-foreground">Step 1: Company Details</h2>

              <div className="space-y-1.5">
                <Label htmlFor="company_legal_name">Company Legal Name *</Label>
                <Input id="company_legal_name" value={step1.company_legal_name} onChange={(e) => updateStep1("company_legal_name", e.target.value)} placeholder="e.g. Acme Holdings (Pty) Ltd" />
                <FieldError field="company_legal_name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input id="registration_number" value={step1.registration_number} onChange={(e) => updateStep1("registration_number", e.target.value)} placeholder="YYYY/NNNNNNN/NN" />
                  <FieldError field="registration_number" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vat_number">VAT Number</Label>
                  <Input id="vat_number" value={step1.vat_number} onChange={(e) => updateStep1("vat_number", e.target.value)} placeholder="Optional" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Industry / Sector *</Label>
                <Select value={step1.industry_sector} onValueChange={(v) => updateStep1("industry_sector", v)}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FieldError field="industry_sector" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="physical_address">Physical Address *</Label>
                <Textarea id="physical_address" value={step1.physical_address} onChange={(e) => updateStep1("physical_address", e.target.value)} placeholder="Full street address" rows={3} />
                <FieldError field="physical_address" />
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>Save as Draft</Button>
                <Button onClick={handleStep1Next} disabled={saving}>Next →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== STEP 2 ===== */}
        {currentStep === 2 && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <h2 className="text-lg font-semibold font-nunito text-foreground">Step 2: Payroll & Pay Cycle</h2>

              {/* Payroll Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_contact_first_name">Payroll Contact First Name *</Label>
                  <Input id="payroll_contact_first_name" value={step2.payroll_contact_first_name} onChange={(e) => updateStep2("payroll_contact_first_name", e.target.value)} placeholder="First name" />
                  <FieldError field="payroll_contact_first_name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_contact_last_name">Payroll Contact Last Name *</Label>
                  <Input id="payroll_contact_last_name" value={step2.payroll_contact_last_name} onChange={(e) => updateStep2("payroll_contact_last_name", e.target.value)} placeholder="Last name" />
                  <FieldError field="payroll_contact_last_name" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_contact_email">Payroll Contact Email *</Label>
                  <Input id="payroll_contact_email" type="email" value={step2.payroll_contact_email} onChange={(e) => updateStep2("payroll_contact_email", e.target.value)} placeholder="email@company.co.za" />
                  <FieldError field="payroll_contact_email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_contact_phone">Payroll Contact Phone *</Label>
                  <Input id="payroll_contact_phone" value={step2.payroll_contact_phone} onChange={(e) => updateStep2("payroll_contact_phone", e.target.value)} placeholder="0712345678" />
                  <FieldError field="payroll_contact_phone" />
                </div>
              </div>

              {/* Pay Cycle & Payday */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Pay Cycle *</Label>
                  <Select value={step2.pay_cycle} onValueChange={(v) => updateStep2("pay_cycle", v)}>
                    <SelectTrigger><SelectValue placeholder="Select pay cycle" /></SelectTrigger>
                    <SelectContent>
                      {PAY_CYCLES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError field="pay_cycle" />
                </div>
                <div className="space-y-1.5">
                  <Label>Payday *</Label>
                  <Select value={step2.payday} onValueChange={(v) => updateStep2("payday", v)}>
                    <SelectTrigger><SelectValue placeholder="Select payday" /></SelectTrigger>
                    <SelectContent>
                      {PAYDAY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError field="payday" />
                </div>
              </div>

              {/* Payroll Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_period_start">Payroll Period Start *</Label>
                  <Input id="payroll_period_start" value={step2.payroll_period_start} onChange={(e) => updateStep2("payroll_period_start", e.target.value)} placeholder="e.g. 1st of month" />
                  <FieldError field="payroll_period_start" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_period_end">Payroll Period End *</Label>
                  <Input id="payroll_period_end" value={step2.payroll_period_end} onChange={(e) => updateStep2("payroll_period_end", e.target.value)} placeholder="e.g. Last day of month" />
                  <FieldError field="payroll_period_end" />
                </div>
              </div>

              {/* Payroll Export Format */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label>Payroll Export Format</Label>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">Phase 2</Badge>
                </div>
                <Select value={step2.payroll_export_format} onValueChange={(v) => updateStep2("payroll_export_format", v)}>
                  <SelectTrigger><SelectValue placeholder="Select format (optional)" /></SelectTrigger>
                  <SelectContent>
                    {PAYROLL_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">For MVP, settlement reports are available within the system and via email.</p>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleStep2Back} disabled={saving}>← Back</Button>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>Save as Draft</Button>
                </div>
                <Button onClick={handleStep2Next} disabled={saving}>Next →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== STEP 3 ===== */}
        {currentStep === 3 && (
          <Step3PolicyConfig
            data={step3}
            onChange={updateStep3}
            errors={errors}
            saving={saving}
            onBack={() => { setErrors({}); setSearchParams({ step: "2" }); }}
            onNext={async () => {
              const e = validateStep3(step3);
              setErrors(e);
              if (Object.keys(e).length > 0) return;
              const ok = await saveEmployer("3 of 5 steps complete");
              if (ok) {
                toast.success("Step 3 complete");
                setErrors({});
                setSearchParams({ step: "4" });
              }
            }}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {/* ===== STEP 4 ===== */}
        {currentStep === 4 && (
          <Step4Contacts
            data={step4}
            onChange={updateStep4}
            errors={errors}
            saving={saving}
            onBack={() => { setErrors({}); setSearchParams({ step: "3" }); }}
            onNext={async () => {
              const e = validateStep4(step4);
              setErrors(e);
              if (Object.keys(e).length > 0) return;
              // Save employer progress
              const ok = await saveEmployer("4 of 5 steps complete");
              if (!ok) return;
              // Save contacts to employer_contacts table
              try {
                const contacts = [
                  {
                    employer_id: employerId!,
                    contact_type: "general" as const,
                    first_name: step4.general.first_name.trim(),
                    last_name: step4.general.last_name.trim(),
                    email: step4.general.email.trim(),
                    cellphone: step4.general.cellphone.trim(),
                    landline: step4.general.landline.trim() || null,
                  },
                  {
                    employer_id: employerId!,
                    contact_type: "authorised_representative" as const,
                    role_title: step4.authorised.role_title.trim(),
                    first_name: step4.authorised.first_name.trim(),
                    last_name: step4.authorised.last_name.trim(),
                    email: step4.authorised.email.trim(),
                    cellphone: step4.authorised.cellphone.trim(),
                    landline: step4.authorised.landline.trim() || null,
                  },
                ];
                // Delete existing contacts for this employer, then insert fresh
                await supabase.from("employer_contacts").delete().eq("employer_id", employerId!);
                const { error } = await supabase.from("employer_contacts").insert(contacts);
                if (error) throw error;
                toast.success("Step 4 complete");
                setErrors({});
                setSearchParams({ step: "5" });
              } catch (err: any) {
                toast.error(err.message || "Failed to save contacts");
              }
            }}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {/* ===== STEP 5 ===== */}
        {currentStep === 5 && (
          <Step5ReviewConfirm
            step1={step1}
            step2={step2}
            step3={step3}
            step4={step4}
            saving={saving}
            onBack={() => { setErrors({}); setSearchParams({ step: "4" }); }}
            onEdit={(step) => { setErrors({}); setSearchParams({ step: String(step) }); }}
            onConfirm={async () => {
              if (!employerId) {
                toast.error("Employer record not found. Please complete previous steps first.");
                return;
              }
              setSaving(true);
              try {
                const user = await getUser();
                if (!user) return;

                // Update status to Active
                const { error: updateError } = await supabase
                  .from("employers")
                  .update({ status: "Active" as const, onboarding_progress: "5 of 5 steps complete" })
                  .eq("employer_id", employerId);
                if (updateError) throw updateError;

                // Write audit trail
                const { error: auditError } = await supabase.from("audit_trail").insert({
                  user_id: user.id,
                  action_type: "employer_activated" as const,
                  object_type: "employer",
                  object_id: employerId,
                  details: { company_legal_name: step1.company_legal_name },
                });
                if (auditError) console.error("Audit log failed:", auditError);

                toast.success("Employer activated successfully!");
                navigate("/admin/employers");
              } catch (err: any) {
                toast.error(err.message || "Failed to activate employer");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
