import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileSignature, Plus, Trash2 } from "lucide-react";

const SYSTEM_USER_ROLES = [
  "Employer System Admin",
  "HR Manager",
  "Finance Manager",
  "Supervisor",
] as const;

export interface SystemUserData {
  role_title: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  landline: string;
}

export interface AuthorisedRepData {
  role_title: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  landline: string;
}

export interface Step4Data {
  systemUsers: SystemUserData[];
  authorised: AuthorisedRepData;
}

export const defaultSystemUser: SystemUserData = {
  role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "",
};

export const defaultStep4: Step4Data = {
  systemUsers: [{ ...defaultSystemUser }],
  authorised: { role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" },
};

export function validateStep4(data: Step4Data): Record<string, string> {
  const e: Record<string, string> = {};
  
  // Validate each system user
  data.systemUsers.forEach((user, i) => {
    if (!user.role_title) e[`systemUsers.${i}.role_title`] = "Required";
    if (!user.first_name.trim()) e[`systemUsers.${i}.first_name`] = "Required";
    if (!user.last_name.trim()) e[`systemUsers.${i}.last_name`] = "Required";
    if (!user.email.trim()) {
      e[`systemUsers.${i}.email`] = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) {
      e[`systemUsers.${i}.email`] = "Invalid email";
    }
    if (!user.cellphone.trim()) {
      e[`systemUsers.${i}.cellphone`] = "Required";
    } else if (!/^0[6-8]\d{8}$/.test(user.cellphone.trim())) {
      e[`systemUsers.${i}.cellphone`] = "SA mobile: 10 digits starting 06/07/08";
    }
  });

  // Validate authorised rep
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
  onChangeSystemUser: (index: number, field: string, value: string) => void;
  onAddSystemUser: () => void;
  onRemoveSystemUser: (index: number) => void;
  onChangeAuthorised: (field: string, value: string) => void;
  errors: Record<string, string>;
  saving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const FieldError = ({ field, errors }: { field: string; errors: Record<string, string> }) =>
  errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

export default function Step4Contacts({ data, onChangeSystemUser, onAddSystemUser, onRemoveSystemUser, onChangeAuthorised, errors, saving, onBack, onNext, onSaveDraft }: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Section 1: System Users */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold font-nunito text-foreground">System Users</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Add users who will access the system on behalf of this employer. At least one user is required.
          </p>

          {data.systemUsers.map((user, i) => (
            <div key={i} className="space-y-4 p-4 border rounded-lg relative">
              {data.systemUsers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive hover:text-destructive"
                  onClick={() => onRemoveSystemUser(i)}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <p className="text-sm font-medium text-foreground">User {i + 1}</p>

              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select value={user.role_title} onValueChange={(v) => onChangeSystemUser(i, "role_title", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_USER_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field={`systemUsers.${i}.role_title`} errors={errors} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name *</Label>
                  <Input value={user.first_name} onChange={(e) => onChangeSystemUser(i, "first_name", e.target.value)} placeholder="First name" />
                  <FieldError field={`systemUsers.${i}.first_name`} errors={errors} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name *</Label>
                  <Input value={user.last_name} onChange={(e) => onChangeSystemUser(i, "last_name", e.target.value)} placeholder="Last name" />
                  <FieldError field={`systemUsers.${i}.last_name`} errors={errors} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={user.email} onChange={(e) => onChangeSystemUser(i, "email", e.target.value)} placeholder="email@company.co.za" />
                  <FieldError field={`systemUsers.${i}.email`} errors={errors} />
                </div>
                <div className="space-y-1.5">
                  <Label>Cellphone *</Label>
                  <Input value={user.cellphone} onChange={(e) => onChangeSystemUser(i, "cellphone", e.target.value)} placeholder="0712345678" />
                  <FieldError field={`systemUsers.${i}.cellphone`} errors={errors} />
                </div>
              </div>

              <div className="sm:w-1/2">
                <div className="space-y-1.5">
                  <Label>Landline</Label>
                  <Input value={user.landline} onChange={(e) => onChangeSystemUser(i, "landline", e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={onAddSystemUser} disabled={saving} className="gap-1">
            <Plus className="w-4 h-4" /> Add Another User
          </Button>
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
            <Label>Role / Title *</Label>
            <Input value={data.authorised.role_title} onChange={(e) => onChangeAuthorised("role_title", e.target.value)} placeholder="e.g. CEO, HR Director" />
            <FieldError field="authorised.role_title" errors={errors} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input value={data.authorised.first_name} onChange={(e) => onChangeAuthorised("first_name", e.target.value)} placeholder="First name" />
              <FieldError field="authorised.first_name" errors={errors} />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input value={data.authorised.last_name} onChange={(e) => onChangeAuthorised("last_name", e.target.value)} placeholder="Last name" />
              <FieldError field="authorised.last_name" errors={errors} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={data.authorised.email} onChange={(e) => onChangeAuthorised("email", e.target.value)} placeholder="email@company.co.za" />
              <FieldError field="authorised.email" errors={errors} />
            </div>
            <div className="space-y-1.5">
              <Label>Cellphone *</Label>
              <Input value={data.authorised.cellphone} onChange={(e) => onChangeAuthorised("cellphone", e.target.value)} placeholder="0712345678" />
              <FieldError field="authorised.cellphone" errors={errors} />
            </div>
          </div>

          <div className="sm:w-1/2">
            <div className="space-y-1.5">
              <Label>Landline</Label>
              <Input value={data.authorised.landline} onChange={(e) => onChangeAuthorised("landline", e.target.value)} placeholder="Optional" />
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
