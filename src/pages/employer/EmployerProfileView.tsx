import { useEffect, useState } from "react";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useEmployerRole } from "@/hooks/useEmployerRole";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Calendar,
  ShieldCheck,
  Users,
  UserCheck,
  UserPlus,
  Pencil,
  UserX,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import TempPasswordModal, { type CredentialEntry } from "@/components/TempPasswordModal";

type Employer = Tables<"employers">;
type Contact = Tables<"employer_contacts">;

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Active: "bg-accent/15 text-accent border border-accent/30",
  Suspended: "bg-orange-100 text-orange-700 border border-orange-300",
  Terminated: "bg-destructive/15 text-destructive border border-destructive/30",
};

const ROLE_OPTIONS = [
  "Employer System Admin",
  "HR Manager",
  "Supervisor",
  "Finance Manager",
];

const AUTH_ROLE_MAP: Record<string, string> = {
  "Employer System Admin": "employer_admin",
  "HR Manager": "hr_approver",
  Supervisor: "supervisor",
  "Finance Manager": "employer_admin",
};

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function EmployerProfileView() {
  const { roleTitle, isLamoolaStaff, employerId, loading: roleLoading } = useEmployerRole();
  const { toast } = useToast();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authRep, setAuthRep] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  // Manage Users state
  const isAdmin = roleTitle === "Employer System Admin" || isLamoolaStaff;
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", cellphone: "", role_title: "Employer System Admin" });
  const [saving, setSaving] = useState(false);
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  // Credentials modal
  const [credentials, setCredentials] = useState<CredentialEntry[]>([]);
  const [credModalOpen, setCredModalOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading && employerId) fetchData();
  }, [roleLoading, employerId]);

  const fetchData = async () => {
    if (!employerId) return;
    const [{ data: emp }, { data: cts }] = await Promise.all([
      supabase.from("employers").select("*").eq("employer_id", employerId).single(),
      supabase.from("employer_contacts").select("*").eq("employer_id", employerId),
    ]);
    setEmployer(emp);
    setContacts((cts || []).filter((c) => c.contact_type === "general"));
    setAuthRep((cts || []).find((c) => c.contact_type === "authorised_representative") || null);
    setLoading(false);
  };

  const openAddUser = () => {
    setEditingContact(null);
    setFormData({ first_name: "", last_name: "", email: "", cellphone: "", role_title: "Employer System Admin" });
    setUserDialogOpen(true);
  };

  const openEditUser = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email || "",
      cellphone: c.cellphone || "",
      role_title: c.role_title || "Employer System Admin",
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!employerId || !formData.first_name || !formData.last_name || !formData.email) return;
    setSaving(true);

    if (editingContact) {
      const { error } = await supabase
        .from("employer_contacts")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          cellphone: formData.cellphone || null,
          role_title: formData.role_title,
        })
        .eq("contact_id", editingContact.contact_id);

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "User updated" });
      }
    } else {
      // Insert contact
      const { error: insertErr } = await supabase.from("employer_contacts").insert({
        employer_id: employerId,
        contact_type: "general" as const,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        cellphone: formData.cellphone || null,
        role_title: formData.role_title,
      });

      if (insertErr) {
        toast({ title: "Add failed", description: insertErr.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      // Create auth account
      const tempPw = generateTempPassword();
      const authRole = AUTH_ROLE_MAP[formData.role_title] || "employer_admin";

      const { data, error: fnErr } = await supabase.functions.invoke("create-user-account", {
        body: {
          email: formData.email,
          password: tempPw,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: authRole,
          employer_id: employerId,
        },
      });

      if (fnErr || data?.error) {
        toast({ title: "Account creation failed", description: (data?.error || fnErr?.message), variant: "destructive" });
      } else {
        setCredentials([{ email: formData.email, password: tempPw, role: formData.role_title, alreadyExisted: !!data?.already_existed }]);
        setCredModalOpen(true);
      }
    }

    setSaving(false);
    setUserDialogOpen(false);
    fetchData();
  };

  const handleDeactivate = async (contact: Contact) => {
    setDeactivatingId(contact.contact_id);
    const { error } = await supabase
      .from("employer_contacts")
      .update({ is_active: false })
      .eq("contact_id", contact.contact_id);

    if (error) {
      toast({ title: "Deactivation failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${contact.first_name} ${contact.last_name} deactivated` });
      fetchData();
    }
    setDeactivatingId(null);
  };

  const handleResetPassword = async (contact: Contact) => {
    if (!contact.email) return;
    setResettingEmail(contact.email);

    const { data, error } = await supabase.functions.invoke("reset-user-password", {
      body: { email: contact.email },
    });

    if (error || data?.error) {
      toast({ title: "Reset failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      setCredentials([{ email: data.email, password: data.password, role: contact.role_title || "", alreadyExisted: false }]);
      setCredModalOpen(true);
    }
    setResettingEmail(null);
  };

  if (loading || roleLoading) {
    return (
      <EmployerLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </EmployerLayout>
    );
  }

  if (!employer) {
    return (
      <EmployerLayout>
        <p className="text-muted-foreground">Employer not found.</p>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{employer.company_legal_name}</h1>
            <p className="text-sm text-muted-foreground">Company Profile</p>
          </div>
          <Badge className={STATUS_STYLES[employer.status] || ""}>{employer.status}</Badge>
        </div>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DetailRow label="Legal Name" value={employer.company_legal_name} />
            <DetailRow label="Registration Number" value={employer.registration_number} />
            <DetailRow label="VAT Number" value={employer.vat_number} />
            <DetailRow label="Industry" value={employer.industry_sector} />
            <DetailRow label="Physical Address" value={employer.physical_address} />
          </CardContent>
        </Card>

        {/* Payroll */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> Payroll & Pay Cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DetailRow label="Pay Cycle" value={employer.pay_cycle} />
            <DetailRow label="Payday" value={employer.payday} />
            <DetailRow label="Period Start" value={employer.payroll_period_start} />
            <DetailRow label="Period End" value={employer.payroll_period_end} />
            <DetailRow label="Export Format" value={employer.payroll_export_format} />
          </CardContent>
        </Card>

        {/* Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" /> Policy Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DetailRow label="Approval Mode" value={employer.employer_approval_mode} />
            <DetailRow label="Max % Earned" value={employer.max_percent_earned != null ? `${employer.max_percent_earned}%` : null} />
            <DetailRow label="Max / Transaction" value={employer.max_per_transaction != null ? `R${employer.max_per_transaction}` : null} />
            <DetailRow label="Max / Pay Period" value={employer.max_per_pay_period != null ? `R${employer.max_per_pay_period}` : null} />
            <DetailRow label="Cut-off Days" value={employer.cutoff_days} />
            <DetailRow label="Fee %" value={employer.fee_percent != null ? `${employer.fee_percent}%` : null} />
            <DetailRow label="Fee Flat" value={employer.fee_flat_amount != null ? `R${employer.fee_flat_amount}` : null} />
            <DetailRow label="Settlement Method" value={employer.settlement_method} />
          </CardContent>
        </Card>

        {/* System Users — Manage Users only for admin */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" /> System Users
              </CardTitle>
              {isAdmin && (
                <Button size="sm" onClick={openAddUser} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                  <UserPlus className="h-4 w-4" /> Add User
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No system users found.</p>
            ) : (
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.contact_id} className={!(c as any).is_active ? "opacity-50" : ""}>
                        <TableCell className="font-medium text-sm">{c.role_title || "—"}</TableCell>
                        <TableCell className="text-sm">{c.first_name} {c.last_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.email || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.cellphone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={(c as any).is_active === false ? "text-destructive border-destructive/30" : "text-accent border-accent/30"}>
                            {(c as any).is_active === false ? "Inactive" : "Active"}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => openEditUser(c)} className="h-7 px-2">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              {(c as any).is_active !== false && c.email && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResetPassword(c)}
                                  disabled={resettingEmail === c.email}
                                  className="h-7 px-2"
                                >
                                  {resettingEmail === c.email ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                              {(c as any).is_active !== false && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeactivate(c)}
                                  disabled={deactivatingId === c.contact_id}
                                  className="h-7 px-2 text-destructive hover:text-destructive"
                                >
                                  {deactivatingId === c.contact_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authorised Representative */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4" /> Authorised Representative
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {authRep ? (
              <>
                <DetailRow label="Name" value={`${authRep.first_name} ${authRep.last_name}`} />
                <DetailRow label="Email" value={authRep.email} />
                <DetailRow label="Phone" value={authRep.cellphone} />
                <DetailRow
                  label="Linked to System User"
                  value={contacts.some((c) => c.email?.toLowerCase() === authRep.email?.toLowerCase()) ? "Yes" : "No"}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground col-span-3">No authorised representative on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={(o) => !o && setUserDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit User" : "Add System User"}</DialogTitle>
            <DialogDescription>
              {editingContact ? "Update this user's details." : "Add a new system user for your company."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={formData.first_name} onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={formData.last_name} onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} disabled={!!editingContact} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.cellphone} onChange={(e) => setFormData((p) => ({ ...p, cellphone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={formData.role_title} onValueChange={(v) => setFormData((p) => ({ ...p, role_title: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveUser}
              disabled={saving || !formData.first_name || !formData.last_name || !formData.email}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingContact ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <TempPasswordModal
        open={credModalOpen}
        onClose={() => setCredModalOpen(false)}
        credentials={credentials}
        title="User Credentials"
        description="Share these credentials securely. The user should change their password on first login."
      />
    </EmployerLayout>
  );
}

function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
}
