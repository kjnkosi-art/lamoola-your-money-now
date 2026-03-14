import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, FileSignature, Plus, Trash2 } from "lucide-react";

const SYSTEM_USER_ROLES = [
  "Employer System Admin",
  "HR Manager",
  "Finance Manager",
  "Supervisor",
  "Payroll Contact",
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
  authRepIsSystemUser: boolean;
  authRepSelectedIndex: number | null;
}

export const defaultSystemUser: SystemUserData = {
  role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "",
};

export const defaultStep4: Step4Data = {
  systemUsers: [{ ...defaultSystemUser }],
  authorised: { role_title: "", first_name: "", last_name: "", email: "", cellphone: "", landline: "" },
  authRepIsSystemUser: true,
  authRepSelectedIndex: null,
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
  if (data.authRepIsSystemUser) {
    if (data.authRepSelectedIndex === null || data.authRepSelectedIndex < 0 || data.authRepSelectedIndex >= data.systemUsers.length) {
      e["authRepSelectedIndex"] = "Please select a system user as the Authorised Representative";
    }
  }
  // Always validate authorised fields (editable in both modes)
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

  // Intra-form duplicate detection (system users only, skip auth rep if linked)
  const allEntries: { email: string; cellphone: string; label: string; emailKey: string; phoneKey: string }[] = [];

  data.systemUsers.forEach((user, i) => {
    allEntries.push({
      email: user.email.trim().toLowerCase(),
      cellphone: user.cellphone.trim(),
      label: `User ${i + 1}`,
      emailKey: `systemUsers.${i}.email`,
      phoneKey: `systemUsers.${i}.cellphone`,
    });
  });

  // Only check auth rep duplicates if manually entered (not linked to system user)
  if (!data.authRepIsSystemUser) {
    allEntries.push({
      email: data.authorised.email.trim().toLowerCase(),
      cellphone: data.authorised.cellphone.trim(),
      label: "Authorised Rep",
      emailKey: "authorised.email",
      phoneKey: "authorised.cellphone",
    });
  }

  // Intra-form duplicate email detection
  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    if (!entry.email || e[entry.emailKey]) continue;
    for (let j = 0; j < i; j++) {
      if (allEntries[j].email === entry.email) {
        e[entry.emailKey] = "This email is already used by another user above";
        break;
      }
    }
  }

  // Intra-form duplicate phone detection
  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    if (!entry.cellphone || e[entry.phoneKey]) continue;
    for (let j = 0; j < i; j++) {
      if (allEntries[j].cellphone === entry.cellphone) {
        e[entry.phoneKey] = "This phone number is already used by another user above";
        break;
      }
    }
  }

  return e;
}

interface Props {
  data: Step4Data;
  onChangeSystemUser: (index: number, field: string, value: string) => void;
  onAddSystemUser: () => void;
  onRemoveSystemUser: (index: number) => void;
  onChangeAuthorised: (field: string, value: string) => void;
  onToggleAuthRepIsSystemUser: (value: boolean) => void;
  onSelectAuthRepFromUser: (index: number | null) => void;
  errors: Record<string, string>;
  saving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const FieldError = ({ field, errors }: { field: string; errors: Record<string, string> }) =>
  errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

export default function Step4Contacts({ data, onChangeSystemUser, onAddSystemUser, onRemoveSystemUser, onChangeAuthorised, onToggleAuthRepIsSystemUser, onSelectAuthRepFromUser, errors, saving, onBack, onNext, onSaveDraft }: Props) {
  // Get the effective auth rep data (from selected system user or manual)
  const effectiveAuthRep = data.authRepIsSystemUser && data.authRepSelectedIndex !== null && data.authRepSelectedIndex < data.systemUsers.length
    ? data.systemUsers[data.authRepSelectedIndex]
    : data.authorised;

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

          {/* Toggle: Is auth rep a system user? */}
          <div className="flex items-center gap-3">
            <Switch
              checked={data.authRepIsSystemUser}
              onCheckedChange={onToggleAuthRepIsSystemUser}
              disabled={saving}
            />
            <Label className="text-sm font-medium cursor-pointer" onClick={() => onToggleAuthRepIsSystemUser(!data.authRepIsSystemUser)}>
              Is the Authorised Representative one of the system users listed above?
            </Label>
          </div>

          {data.authRepIsSystemUser && (
            <div className="space-y-1.5">
              <Label>Pre-fill from System User</Label>
              <Select
                value={data.authRepSelectedIndex !== null ? String(data.authRepSelectedIndex) : ""}
                onValueChange={(v) => onSelectAuthRepFromUser(v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a system user to pre-fill" />
                </SelectTrigger>
                <SelectContent>
                  {data.systemUsers.map((user, i) => {
                    const hasName = user.first_name.trim() || user.last_name.trim();
                    const label = hasName
                      ? `${user.first_name} ${user.last_name}${user.role_title ? ` — ${user.role_title}` : ""}`
                      : `User ${i + 1}${user.role_title ? ` — ${user.role_title}` : ""}`;
                    return (
                      <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FieldError field="authRepSelectedIndex" errors={errors} />
            </div>
          )}

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
