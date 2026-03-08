import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

const STEPS = [
  "Company Details",
  "Payroll & Pay Cycle",
  "Policy Configuration",
  "Contacts",
  "Review & Confirm",
];

const INDUSTRY_SECTORS = [
  "Food & Beverage",
  "Security",
  "Cleaning",
  "Retail",
  "Construction",
  "Logistics",
  "Other",
] as const;

export default function AddEmployer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentStep = Number(searchParams.get("step") || "1");

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_legal_name: "",
    registration_number: "",
    vat_number: "",
    industry_sector: "",
    physical_address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.company_legal_name.trim()) newErrors.company_legal_name = "Company legal name is required";
    if (!form.registration_number.trim()) {
      newErrors.registration_number = "Registration number is required";
    } else if (!/^\d{4}\/\d{7}\/\d{2}$/.test(form.registration_number.trim())) {
      newErrors.registration_number = "Format must be YYYY/NNNNNNN/NN";
    }
    if (!form.industry_sector) newErrors.industry_sector = "Industry sector is required";
    if (!form.physical_address.trim()) newErrors.physical_address = "Physical address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToDb = async (status: "Draft" | "Active") => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { error } = await supabase.from("employers").insert({
        company_legal_name: form.company_legal_name.trim(),
        registration_number: form.registration_number.trim(),
        vat_number: form.vat_number.trim() || null,
        industry_sector: form.industry_sector as any,
        physical_address: form.physical_address.trim(),
        pay_cycle: "Monthly" as const,
        status,
        onboarding_progress: "1 of 5 steps complete",
        created_by: user.id,
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to save employer");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    // Draft doesn't require full validation — just need a company name
    if (!form.company_legal_name.trim()) {
      setErrors({ company_legal_name: "Company legal name is required to save draft" });
      return;
    }
    const ok = await saveToDb("Draft");
    if (ok) {
      toast.success("Employer saved as draft");
      navigate("/admin/employers");
    }
  };

  const handleNext = async () => {
    if (!validate()) return;
    // For now save as draft and go to step 2 placeholder
    const ok = await saveToDb("Draft");
    if (ok) {
      toast.success("Step 1 complete");
      navigate("/admin/employers/new?step=2");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-nunito text-foreground">Add Employer</h1>
          <p className="text-sm text-muted-foreground mt-1">Onboard a new employer to the platform.</p>
        </div>

        {/* Step Progress */}
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
                  <span
                    className={`text-xs font-medium truncate hidden sm:block ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 rounded ${
                      isComplete ? "bg-accent" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 Form */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <h2 className="text-lg font-semibold font-nunito text-foreground">Step 1: Company Details</h2>

              <div className="space-y-1.5">
                <Label htmlFor="company_legal_name">Company Legal Name *</Label>
                <Input
                  id="company_legal_name"
                  value={form.company_legal_name}
                  onChange={(e) => updateField("company_legal_name", e.target.value)}
                  placeholder="e.g. Acme Holdings (Pty) Ltd"
                />
                {errors.company_legal_name && <p className="text-xs text-destructive">{errors.company_legal_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input
                    id="registration_number"
                    value={form.registration_number}
                    onChange={(e) => updateField("registration_number", e.target.value)}
                    placeholder="YYYY/NNNNNNN/NN"
                  />
                  {errors.registration_number && <p className="text-xs text-destructive">{errors.registration_number}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vat_number">VAT Number</Label>
                  <Input
                    id="vat_number"
                    value={form.vat_number}
                    onChange={(e) => updateField("vat_number", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Industry / Sector *</Label>
                <Select value={form.industry_sector} onValueChange={(v) => updateField("industry_sector", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry_sector && <p className="text-xs text-destructive">{errors.industry_sector}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="physical_address">Physical Address *</Label>
                <Textarea
                  id="physical_address"
                  value={form.physical_address}
                  onChange={(e) => updateField("physical_address", e.target.value)}
                  placeholder="Full street address"
                  rows={3}
                />
                {errors.physical_address && <p className="text-xs text-destructive">{errors.physical_address}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  Save as Draft
                </Button>
                <Button onClick={handleNext} disabled={saving}>
                  Next →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for future steps */}
        {currentStep > 1 && (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">Step {currentStep}: {STEPS[currentStep - 1]}</p>
              <p className="text-sm mt-2">Coming soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
