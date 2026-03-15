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
import TempPasswordModal, { CredentialEntry } from "@/components/TempPasswordModal";

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

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const PAYDAY_OPTIONS = [
  "Last working day",
  ...Array.from({ length: 31 }, (_, i) => String(i + 1)),
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
  const [tempPasswordModal, setTempPasswordModal] = useState<{ open: boolean; credentials: CredentialEntry[] }>({ open: false, credentials: [] });
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
    pay_cycle: "",
    payday: "",
    payroll_period_start: "1",
    payroll_period_end: "31",
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

      const systemUsers = generalContacts.length > 0
        ? generalContacts.map((c) => ({
            role_title: c.role_title || "",
            first_name: c.first_name || "",
            last_name: c.last_name || "",
            email: c.email || "",
            cellphone: c.cellphone || "",
            landline: c.landline || "",
          }))
        : [{ role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" }];

      const authRepData = authRep
        ? {
            role_title: authRep.role_title || "",
            first_name: authRep.first_name || "",
            last_name: authRep.last_name || "",
            email: authRep.email || "",
            cellphone: authRep.cellphone || "",
            landline: authRep.landline || "",
          }
        : { role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" };

      // Detect if auth rep matches a system user (for toggle restore)
      let authRepIsSystemUser = true;
      let authRepSelectedIndex: number | null = null;
      if (authRep) {
        const matchIdx = systemUsers.findIndex(
          (u) => u.email.trim().toLowerCase() === (authRep.email || "").trim().toLowerCase() && u.email.trim() !== ""
        );
        if (matchIdx >= 0) {
          authRepIsSystemUser = true;
          authRepSelectedIndex = matchIdx;
        } else {
          authRepIsSystemUser = false;
          authRepSelectedIndex = null;
        }
      }

      const resumedStep4: Step4Data = {
        systemUsers,
        authorised: authRepData,
        authRepIsSystemUser,
        authRepSelectedIndex,
      };
      console.log("[AddEmployer] Resumed Step 4:", resumedStep4);
      setStep4(resumedStep4);

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

  const toggleAuthRepIsSystemUser = (value: boolean) => {
    setStep4((prev) => ({
      ...prev,
      authRepIsSystemUser: value,
      authRepSelectedIndex: value ? prev.authRepSelectedIndex : null,
    }));
    if (errors["authRepSelectedIndex"]) setErrors((prev) => ({ ...prev, authRepSelectedIndex: "" }));
  };

  const selectAuthRepFromUser = (index: number | null) => {
    setStep4((prev) => {
      const updated = { ...prev, authRepSelectedIndex: index };
      if (index !== null && index < prev.systemUsers.length) {
        const user = prev.systemUsers[index];
        updated.authorised = {
          role_title: user.role_title,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          cellphone: user.cellphone,
          landline: user.landline,
        };
      }
      return updated;
    });
    if (errors["authRepSelectedIndex"]) setErrors((prev) => ({ ...prev, authRepSelectedIndex: "" }));
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
        payroll_contact_first_name: null,
        payroll_contact_last_name: null,
        payroll_contact_email: null,
        payroll_contact_phone: null,
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

  const saveContacts = async (eid: string) => {
    console.log("[AddEmployer] Saving contacts for employer:", eid);
    console.log("[AddEmployer] System users to save:", step4.systemUsers);
    console.log("[AddEmployer] Authorised rep to save:", step4.authorised);

    const contacts: any[] = step4.systemUsers.map((u) => ({
      employer_id: eid,
      contact_type: "general" as const,
      role_title: u.role_title,
      first_name: u.first_name.trim(),
      last_name: u.last_name.trim(),
      email: u.email.trim(),
      cellphone: u.cellphone.trim(),
      landline: u.landline.trim() || null,
    }));

    // Resolve auth rep: if linked to system user, use that user's data
    const effectiveAuthRep = step4.authRepIsSystemUser && step4.authRepSelectedIndex !== null && step4.authRepSelectedIndex < step4.systemUsers.length
      ? step4.systemUsers[step4.authRepSelectedIndex]
      : step4.authorised;

    if (effectiveAuthRep.first_name.trim()) {
      contacts.push({
        employer_id: eid,
        contact_type: "authorised_representative" as const,
        role_title: effectiveAuthRep.role_title.trim(),
        first_name: effectiveAuthRep.first_name.trim(),
        last_name: effectiveAuthRep.last_name.trim(),
        email: effectiveAuthRep.email.trim(),
        cellphone: effectiveAuthRep.cellphone.trim(),
        landline: effectiveAuthRep.landline.trim() || null,
      });
    }

    // Only save if there's meaningful data
    const hasData = contacts.some((c) => c.first_name || c.last_name || c.email);
    if (!hasData) {
      console.log("[AddEmployer] No contact data to save, skipping");
      return;
    }

    await supabase.from("employer_contacts").delete().eq("employer_id", eid);
    const { error } = await supabase.from("employer_contacts").insert(contacts);
    if (error) {
      console.error("[AddEmployer] Failed to save contacts:", error);
      throw error;
    }
    console.log("[AddEmployer] Contacts saved successfully:", contacts.length, "records");
  };

  const handleSaveDraft = async () => {
    if (!step1.company_legal_name.trim()) {
      setErrors({ company_legal_name: "Company name required to save draft" });
      return;
    }
    const stepLabel = `${currentStep} of 5 steps complete`;
    const ok = await saveEmployer(stepLabel);
    if (ok) {
      try {
        const eid = employerId || searchParams.get("employer");
        if (eid) {
          await saveContacts(eid);
        }
      } catch (err: any) {
        console.error("[AddEmployer] Contact save error during draft:", err);
      }
      toast.success("Employer saved as draft");
      navigate("/admin/employers");
    }
  };

  const goToStep = (step: number) => {
    console.log("[AddEmployer] Navigating to step", step);
    console.log("[AddEmployer] Step 4 state at navigation:", JSON.stringify(step4));
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
                  <Select value={step2.payroll_period_start || "1"} onValueChange={(v) => updateStep2("payroll_period_start", v)}>
                    <SelectTrigger id="payroll_period_start"><SelectValue placeholder="Select day" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (<SelectItem key={d} value={String(d)}>{d}</SelectItem>))}</SelectContent>
                  </Select>
                  <FieldError field="payroll_period_start" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payroll_period_end">Payroll Period End *</Label>
                  <Select value={step2.payroll_period_end || "31"} onValueChange={(v) => updateStep2("payroll_period_end", v)}>
                    <SelectTrigger id="payroll_period_end"><SelectValue placeholder="Select day" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (<SelectItem key={d} value={String(d)}>{d}</SelectItem>))}</SelectContent>
                  </Select>
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
            onToggleAuthRepIsSystemUser={toggleAuthRepIsSystemUser}
            onSelectAuthRepFromUser={selectAuthRepFromUser}
            errors={errors}
            saving={saving}
            onBack={() => goToStep(3)}
            onNext={async () => {
              // Validate step 4 (includes intra-form duplicate checks)
              const s4Errors = validateStep4(step4);
              if (Object.keys(s4Errors).length > 0) {
                setErrors(s4Errors);
                return;
              }

              const ok = await saveEmployer("4 of 5 steps complete");
              if (!ok) return;
              try {
                await saveContacts(employerId!);

                // DB-level duplicate checks for all system users + auth rep phones AND emails
                let hasDuplicates = false;
                const effectiveAuthRepForCheck = step4.authRepIsSystemUser && step4.authRepSelectedIndex !== null && step4.authRepSelectedIndex < step4.systemUsers.length
                  ? step4.systemUsers[step4.authRepSelectedIndex]
                  : step4.authorised;
                const allContacts = step4.authRepIsSystemUser
                  ? [...step4.systemUsers] // auth rep is already in system users, no double-check
                  : [...step4.systemUsers, effectiveAuthRepForCheck];
                for (const contact of allContacts) {
                  const phone = contact.cellphone.trim();
                  const email = contact.email.trim().toLowerCase();

                  // Phone duplicate checks
                  if (phone) {
                    const { data: existingContacts } = await supabase
                      .from("employer_contacts")
                      .select("cellphone")
                      .eq("cellphone", phone)
                      .neq("employer_id", employerId!)
                      .limit(1);
                    if (existingContacts && existingContacts.length > 0) {
                      toast.error(`Phone number ${phone} is already registered — linked to existing account.`);
                      hasDuplicates = true;
                    }

                    const { data: existingEmployees } = await supabase
                      .from("employees")
                      .select("mobile_number")
                      .eq("mobile_number", phone)
                      .limit(1);
                    if (existingEmployees && existingEmployees.length > 0) {
                      toast.error(`Phone number ${phone} is already registered — linked to existing employee.`);
                      hasDuplicates = true;
                    }
                  }

                  // Email duplicate checks
                  if (email) {
                    const { data: existingContactEmails } = await supabase
                      .from("employer_contacts")
                      .select("email")
                      .eq("email", email)
                      .neq("employer_id", employerId!)
                      .limit(1);
                    if (existingContactEmails && existingContactEmails.length > 0) {
                      toast.error(`Email ${email} is already registered — linked to existing account.`);
                      hasDuplicates = true;
                    }

                    const { data: existingEmployeeEmails } = await supabase
                      .from("employees")
                      .select("email_address")
                      .eq("email_address", email)
                      .limit(1);
                    if (existingEmployeeEmails && existingEmployeeEmails.length > 0) {
                      toast.error(`Email ${email} is already registered — linked to existing employee.`);
                      hasDuplicates = true;
                    }
                  }
                }

                if (hasDuplicates) {
                  toast.error("Please resolve duplicate contacts before proceeding.");
                  return;
                }

                // Role mapping: UI role → auth role
                const ROLE_MAP: Record<string, string | null> = {
                  "Employer System Admin": "employer_admin",
                  "HR Manager": "hr_approver",
                  "Supervisor": "supervisor",
                  "Finance Manager": "employer_admin",
                  "Payroll Contact": "employer_admin",
                };

                // Collect all users that need auth accounts
                const usersToProvision: { email: string; first_name: string; last_name: string; authRole: string; displayRole: string }[] = [];

                for (const user of step4.systemUsers) {
                  const authRole = ROLE_MAP[user.role_title];
                  if (authRole) {
                    usersToProvision.push({
                      email: user.email.trim(),
                      first_name: user.first_name.trim(),
                      last_name: user.last_name.trim(),
                      authRole,
                      displayRole: user.role_title,
                    });
                  }
                }

                // Create accounts for all provisioned users
                const collectedCredentials: CredentialEntry[] = [];
                let hasErrors = false;

                for (const user of usersToProvision) {
                  const tempPassword = generateTempPassword();
                  const { data: fnData, error: fnError } = await supabase.functions.invoke("create-user-account", {
                    body: {
                      email: user.email,
                      password: tempPassword,
                      first_name: user.first_name,
                      last_name: user.last_name,
                      role: user.authRole,
                      employer_id: employerId,
                    },
                  });

                  if (fnError || fnData?.error) {
                    toast.error(`Account creation failed for ${user.email}: ${fnData?.error || fnError?.message}`);
                    hasErrors = true;
                  } else if (fnData?.already_existed) {
                    collectedCredentials.push({
                      email: user.email,
                      password: "",
                      role: user.displayRole,
                      alreadyExisted: true,
                    });
                  } else {
                    collectedCredentials.push({
                      email: user.email,
                      password: tempPassword,
                      role: user.displayRole,
                      alreadyExisted: false,
                    });
                  }
                }

                if (collectedCredentials.length > 0) {
                  const newCount = collectedCredentials.filter((c) => !c.alreadyExisted).length;
                  if (newCount > 0) {
                    toast.success(`Step 4 complete — ${newCount} account${newCount !== 1 ? "s" : ""} created.`);
                    setTempPasswordModal({ open: true, credentials: collectedCredentials });
                    return;
                  } else {
                    toast.info("All users already have existing accounts.");
                  }
                }

                goToStep(5);
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
            validationErrors={getAllValidationErrors()}
            onBack={() => goToStep(4)}
            onEdit={(step) => goToStep(step)}
            onConfirm={async () => {
              const allErrors = getAllValidationErrors();
              if (allErrors.length > 0) {
                toast.error("Please complete all required fields before activating.");
                return;
              }
              if (!employerId) {
                toast.error("Employer record not found. Please save the employer first.");
                return;
              }
              setSaving(true);
              try {
                const user = await getUser();
                if (!user) return;

                const { error: updateError } = await supabase
                  .from("employers")
                  .update({ status: "Active" as const, onboarding_progress: "5 of 5 steps complete" })
                  .eq("employer_id", employerId);
                if (updateError) throw updateError;

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
          setTempPasswordModal({ open: false, credentials: [] });
          setErrors({});
          setSearchParams({ step: "5" });
        }}
        credentials={tempPasswordModal.credentials}
      />
      </div>
    </AdminLayout>
  );
}
