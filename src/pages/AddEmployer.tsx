import { useState, useEffect } from "react";
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
import { Check, AlertCircle } from "lucide-react";
import Step3PolicyConfig, { Step3Data, defaultStep3, validateStep3 } from "@/components/employer/Step3PolicyConfig";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Step4Contacts, { Step4Data, defaultStep4, validateStep4 } from "@/components/employer/Step4Contacts";
import Step5ReviewConfirm from "@/components/employer/Step5ReviewConfirm";
import TempPasswordModal from "@/components/TempPasswordModal";

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

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export default function AddEmployer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = Number(searchParams.get("step") || "1");

  const [saving, setSaving] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(searchParams.get("employer") || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempPasswordModal, setTempPasswordModal] = useState<{ open: boolean; email: string; password: string }>({ open: false, email: "", password: "" });
  const [draftLoaded, setDraftLoaded] = useState(!searchParams.get("employer")); // false if we need to load

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

  // Load draft employer data when resuming
  useEffect(() => {
    const resumeId = searchParams.get("employer");
    if (!resumeId) return;

    const loadDraft = async () => {
      console.log("[AddEmployer] Loading draft employer:", resumeId);

      const [employerRes, contactsRes] = await Promise.all([
        supabase.from("employers").select("*").eq("employer_id", resumeId).single(),
        supabase.from("employer_contacts").select("*").eq("employer_id", resumeId),
      ]);

      if (employerRes.error) {
        console.error("[AddEmployer] Failed to fetch employer:", employerRes.error);
        toast.error("Failed to load employer data");
        setDraftLoaded(true);
        return;
      }

      const emp = employerRes.data;
      const contacts = contactsRes.data || [];
      console.log("[AddEmployer] Fetched employer:", emp);
      console.log("[AddEmployer] Fetched contacts:", contacts);

      // Populate Step 1
      setStep1({
        company_legal_name: emp.company_legal_name || "",
        registration_number: emp.registration_number || "",
        vat_number: emp.vat_number || "",
        industry_sector: emp.industry_sector || "",
        physical_address: emp.physical_address || "",
      });

      // Populate Step 2
      setStep2({
        payroll_contact_first_name: emp.payroll_contact_first_name || "",
        payroll_contact_last_name: emp.payroll_contact_last_name || "",
        payroll_contact_email: emp.payroll_contact_email || "",
        payroll_contact_phone: emp.payroll_contact_phone || "",
        pay_cycle: emp.pay_cycle || "",
        payday: emp.payday || "",
        payroll_period_start: emp.payroll_period_start || "",
        payroll_period_end: emp.payroll_period_end || "",
        payroll_export_format: emp.payroll_export_format || "",
      });

      // Populate Step 3
      setStep3({
        employer_approval_mode: emp.employer_approval_mode || "Auto-Approved",
        max_percent_earned: String(emp.max_percent_earned ?? 30),
        max_per_transaction: emp.max_per_transaction ? String(emp.max_per_transaction) : "",
        max_per_pay_period: emp.max_per_pay_period ? String(emp.max_per_pay_period) : "",
        cutoff_days: String(emp.cutoff_days ?? 3),
        fee_percent: String(emp.fee_percent ?? 0),
        fee_flat_amount: String(emp.fee_flat_amount ?? 25),
      });

      // Populate Step 4 from contacts
      const generalContacts = contacts.filter((c) => c.contact_type === "general");
      const authRep = contacts.find((c) => c.contact_type === "authorised_representative");

      setStep4({
        systemUsers: generalContacts.length > 0
          ? generalContacts.map((c) => ({
              role_title: c.role_title || "",
              first_name: c.first_name || "",
              last_name: c.last_name || "",
              email: c.email || "",
              cellphone: c.cellphone || "",
              landline: c.landline || "",
            }))
          : [{ role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" }],
        authorised: authRep
          ? {
              role_title: authRep.role_title || "",
              first_name: authRep.first_name || "",
              last_name: authRep.last_name || "",
              email: authRep.email || "",
              cellphone: authRep.cellphone || "",
              landline: authRep.landline || "",
            }
          : { role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" },
      });

      setDraftLoaded(true);
    };

    loadDraft();
  }, []);

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

  const updateSystemUser = (index: number, field: string, value: string) => {
    setStep4((prev) => ({
      ...prev,
      systemUsers: prev.systemUsers.map((u, i) => i === index ? { ...u, [field]: value } : u),
    }));
    const key = `systemUsers.${index}.${field}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const addSystemUser = () => {
    setStep4((prev) => ({
      ...prev,
      systemUsers: [...prev.systemUsers, { role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" }],
    }));
  };

  const removeSystemUser = (index: number) => {
    setStep4((prev) => ({
      ...prev,
      systemUsers: prev.systemUsers.filter((_, i) => i !== index),
    }));
  };

  const updateAuthorised = (field: string, value: string) => {
    setStep4((prev) => ({
      ...prev,
      authorised: { ...prev.authorised, [field]: value },
    }));
    const key = `authorised.${field}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const getStep1Errors = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!step1.company_legal_name.trim()) e.company_legal_name = "Company Legal Name is required";
    if (!step1.registration_number.trim()) {
      e.registration_number = "Registration Number is required";
    } else if (!/^\d{4}\/\d{7}\/\d{2}$/.test(step1.registration_number.trim())) {
      e.registration_number = "Registration Number format: YYYY/NNNNNNN/NN";
    }
    if (!step1.industry_sector) e.industry_sector = "Industry / Sector is required";
    if (!step1.physical_address.trim()) e.physical_address = "Physical Address is required";
    return e;
  };

  const getStep2Errors = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!step2.payroll_contact_first_name.trim()) e.payroll_contact_first_name = "Payroll Contact First Name is required";
    if (!step2.payroll_contact_last_name.trim()) e.payroll_contact_last_name = "Payroll Contact Last Name is required";
    if (!step2.payroll_contact_email.trim()) {
      e.payroll_contact_email = "Payroll Contact Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step2.payroll_contact_email.trim())) {
      e.payroll_contact_email = "Payroll Contact Email is invalid";
    }
    if (!step2.payroll_contact_phone.trim()) {
      e.payroll_contact_phone = "Payroll Contact Phone is required";
    } else if (!/^0[6-8]\d{8}$/.test(step2.payroll_contact_phone.trim())) {
      e.payroll_contact_phone = "Payroll Contact Phone: SA mobile 10 digits starting 06/07/08";
    }
    if (!step2.pay_cycle) e.pay_cycle = "Pay Cycle is required";
    if (!step2.payday) e.payday = "Payday is required";
    if (!step2.payroll_period_start.trim()) e.payroll_period_start = "Payroll Period Start is required";
    if (!step2.payroll_period_end.trim()) e.payroll_period_end = "Payroll Period End is required";
    return e;
  };

  const validateStep1 = () => {
    const e = getStep1Errors();
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = getStep2Errors();
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Check which steps are valid (for stepper icons)
  const stepValidation = {
    1: Object.keys(getStep1Errors()).length === 0,
    2: Object.keys(getStep2Errors()).length === 0,
    3: Object.keys(validateStep3(step3)).length === 0,
    4: Object.keys(validateStep4(step4)).length === 0,
  };

  // Full cross-step validation for activation
  const getAllValidationErrors = (): { step: number; label: string; messages: string[] }[] => {
    const result: { step: number; label: string; messages: string[] }[] = [];
    const s1 = getStep1Errors();
    if (Object.keys(s1).length > 0) result.push({ step: 1, label: "Company Details", messages: Object.values(s1) });
    const s2 = getStep2Errors();
    if (Object.keys(s2).length > 0) result.push({ step: 2, label: "Payroll & Pay Cycle", messages: Object.values(s2) });
    const s3 = validateStep3(step3);
    if (Object.keys(s3).length > 0) result.push({ step: 3, label: "Policy Configuration", messages: Object.values(s3) });
    const s4 = validateStep4(step4);
    if (Object.keys(s4).length > 0) result.push({ step: 4, label: "Contacts", messages: Object.values(s4) });
    return result;
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

  const goToStep = (step: number) => {
    setErrors({});
    setSearchParams({ ...(employerId ? { employer: employerId } : {}), step: String(step) });
  };

  const handleStep1Next = async () => {
    const ok = await saveEmployer("1 of 5 steps complete");
    if (ok) goToStep(2);
  };

  const handleStep2Back = () => goToStep(1);

  const handleStep2Next = async () => {
    const ok = await saveEmployer("2 of 5 steps complete");
    if (ok) goToStep(3);
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
            // Steps 1-4 show validation status; step 5 has no fields
            const isValid = stepNum <= 4 ? stepValidation[stepNum as 1|2|3|4] : true;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div
                  className="flex items-center gap-2 min-w-0 cursor-pointer"
                  onClick={() => goToStep(stepNum)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : stepNum <= 4 && isValid
                        ? "bg-[#6AE809]/20 text-[#6AE809] border-2 border-[#6AE809]"
                        : stepNum <= 4 && !isValid
                        ? "bg-destructive/10 text-destructive border-2 border-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNum <= 4 && isValid && !isActive ? (
                      <Check className="w-4 h-4" />
                    ) : stepNum <= 4 && !isValid && !isActive ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span className={`text-xs font-medium truncate hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded bg-muted`} />
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
            onBack={() => goToStep(2)}
            onNext={async () => {
              const ok = await saveEmployer("3 of 5 steps complete");
              if (ok) goToStep(4);
            }}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {/* ===== STEP 4 ===== */}
        {currentStep === 4 && (
          <Step4Contacts
            data={step4}
            onChangeSystemUser={updateSystemUser}
            onAddSystemUser={addSystemUser}
            onRemoveSystemUser={removeSystemUser}
            onChangeAuthorised={updateAuthorised}
            errors={errors}
            saving={saving}
            onBack={() => { setErrors({}); setSearchParams({ step: "3" }); }}
            onNext={async () => {
              const e = validateStep4(step4);
              setErrors(e);
              if (Object.keys(e).length > 0) return;
              const ok = await saveEmployer("4 of 5 steps complete");
              if (!ok) return;
              try {
                // Build contacts array: all system users + authorised rep
                const contacts: any[] = step4.systemUsers.map((u) => ({
                  employer_id: employerId!,
                  contact_type: "general" as const,
                  role_title: u.role_title,
                  first_name: u.first_name.trim(),
                  last_name: u.last_name.trim(),
                  email: u.email.trim(),
                  cellphone: u.cellphone.trim(),
                  landline: u.landline.trim() || null,
                }));
                contacts.push({
                  employer_id: employerId!,
                  contact_type: "authorised_representative" as const,
                  role_title: step4.authorised.role_title.trim(),
                  first_name: step4.authorised.first_name.trim(),
                  last_name: step4.authorised.last_name.trim(),
                  email: step4.authorised.email.trim(),
                  cellphone: step4.authorised.cellphone.trim(),
                  landline: step4.authorised.landline.trim() || null,
                });
                // Delete existing contacts for this employer, then insert fresh
                await supabase.from("employer_contacts").delete().eq("employer_id", employerId!);
                const { error } = await supabase.from("employer_contacts").insert(contacts);
                if (error) throw error;

                // Create auth account for first Employer System Admin
                const adminUser = step4.systemUsers.find((u) => u.role_title === "Employer System Admin");
                if (adminUser) {
                  const contactEmail = adminUser.email.trim();
                  const tempPassword = generateTempPassword();
                  const { data: fnData, error: fnError } = await supabase.functions.invoke("create-user-account", {
                    body: {
                      email: contactEmail,
                      password: tempPassword,
                      first_name: adminUser.first_name.trim(),
                      last_name: adminUser.last_name.trim(),
                      role: "employer_admin",
                      employer_id: employerId,
                    },
                  });

                  if (fnError || fnData?.error) {
                    toast.error("Contacts saved, but employer admin account creation failed: " + (fnData?.error || fnError?.message));
                  } else {
                    toast.success("Step 4 complete — employer admin account created.");
                    setTempPasswordModal({ open: true, email: contactEmail, password: tempPassword });
                    return;
                  }
                }

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
      <TempPasswordModal
        open={tempPasswordModal.open}
        onClose={() => {
          setTempPasswordModal({ open: false, email: "", password: "" });
          setErrors({});
          setSearchParams({ step: "5" });
        }}
        email={tempPasswordModal.email}
        password={tempPasswordModal.password}
        role="employer admin"
      />
      </div>
    </AdminLayout>
  );
}
