import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Users, FileSignature } from "lucide-react";

export interface ContactData {
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  landline: string;
}

export interface Step4Data {
  general: ContactData;
  authorised: ContactData & { role_title: string };
}

export const defaultStep4: Step4Data = {
  general: { first_name: "", last_name: "", email: "", cellphone: "", landline: "" },
  authorised: { role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" },
};

export function validateStep4(data: Step4Data): Record<string, string> {
  const e: Record<string, string> = {};
  // General
  if (!data.general.first_name.trim()) e["general.first_name"] = "Required";
  if (!data.general.last_name.trim()) e["general.last_name"] = "Required";
  if (!data.general.email.trim()) {
    e["general.email"] = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.general.email.trim())) {
    e["general.email"] = "Invalid email";
  }
  if (!data.general.cellphone.trim()) {
    e["general.cellphone"] = "Required";
  } else if (!/^0[6-8]\d{8}$/.test(data.general.cellphone.trim())) {
    e["general.cellphone"] = "SA mobile: 10 digits starting 06/07/08";
  }
  // Authorised
  if (!data.authorised.role_title.trim()) e["authorised.role_title"] = "Required";
  if (!data.authorised.first_name.trim()) e["authorised.first_name"] = "Required";
  if (!data.authorised.last_name.trim()) e["authorised.last_name"] = "Required";
  if (!data.authorised.email.trim()) {
    e["authorised.email"] = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.authorised.email.trim())) {
    e["authorised.email"] = "Invalid email";
  }
  if (!data.authorised.cellphone.trim()) {
    e["authorised.cellphone"] = "Required";
  } else if (!/^0[6-8]\d{8}$/.test(data.authorised.cellphone.trim())) {
    e["authorised.cellphone"] = "SA mobile: 10 digits starting 06/07/08";
  }
  return e;
}

interface Props {
  data: Step4Data;
  onChange: (section: "general" | "authorised", field: string, value: string) => void;
  errors: Record<string, string>;
  saving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const FieldError = ({ field, errors }: { field: string; errors: Record<string, string> }) =>
  errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

export default function Step4Contacts({ data, onChange, errors, saving, onBack, onNext, onSaveDraft }: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Section 1: General Contact */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold font-nunito text-foreground">General Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gen_first_name">First Name *</Label>
              <Input id="gen_first_name" value={data.general.first_name} onChange={(e) => onChange("general", "first_name", e.target.value)} placeholder="First name" />
              <FieldError field="general.first_name" errors={errors} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen_last_name">Last Name *</Label>
              <Input id="gen_last_name" value={data.general.last_name} onChange={(e) => onChange("general", "last_name", e.target.value)} placeholder="Last name" />
              <FieldError field="general.last_name" errors={errors} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gen_email">Email *</Label>
              <Input id="gen_email" type="email" value={data.general.email} onChange={(e) => onChange("general", "email", e.target.value)} placeholder="email@company.co.za" />
              <FieldError field="general.email" errors={errors} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen_cellphone">Cellphone *</Label>
              <Input id="gen_cellphone" value={data.general.cellphone} onChange={(e) => onChange("general", "cellphone", e.target.value)} placeholder="0712345678" />
              <FieldError field="general.cellphone" errors={errors} />
            </div>
          </div>

          <div className="sm:w-1/2">
            <div className="space-y-1.5">
              <Label htmlFor="gen_landline">Landline</Label>
              <Input id="gen_landline" value={data.general.landline} onChange={(e) => onChange("general", "landline", e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 2: Authorised Representative */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold font-nunito text-foreground">Authorised Representative</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This person signs the employer agreement on behalf of the company. Their details are pulled into the contract document.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="auth_role_title">Role / Title *</Label>
            <Input id="auth_role_title" value={data.authorised.role_title} onChange={(e) => onChange("authorised", "role_title", e.target.value)} placeholder="e.g. CEO, HR Director" />
            <FieldError field="authorised.role_title" errors={errors} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="auth_first_name">First Name *</Label>
              <Input id="auth_first_name" value={data.authorised.first_name} onChange={(e) => onChange("authorised", "first_name", e.target.value)} placeholder="First name" />
              <FieldError field="authorised.first_name" errors={errors} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth_last_name">Last Name *</Label>
              <Input id="auth_last_name" value={data.authorised.last_name} onChange={(e) => onChange("authorised", "last_name", e.target.value)} placeholder="Last name" />
              <FieldError field="authorised.last_name" errors={errors} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="auth_email">Email *</Label>
              <Input id="auth_email" type="email" value={data.authorised.email} onChange={(e) => onChange("authorised", "email", e.target.value)} placeholder="email@company.co.za" />
              <FieldError field="authorised.email" errors={errors} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth_cellphone">Cellphone *</Label>
              <Input id="auth_cellphone" value={data.authorised.cellphone} onChange={(e) => onChange("authorised", "cellphone", e.target.value)} placeholder="0712345678" />
              <FieldError field="authorised.cellphone" errors={errors} />
            </div>
          </div>

          <div className="sm:w-1/2">
            <div className="space-y-1.5">
              <Label htmlFor="auth_landline">Landline</Label>
              <Input id="auth_landline" value={data.authorised.landline} onChange={(e) => onChange("authorised", "landline", e.target.value)} placeholder="Optional" />
            </div>
          </div>
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
