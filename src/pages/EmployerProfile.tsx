import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Key } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import ReshareLoginsModal from "@/components/admin/ReshareLoginsModal";
import TempPasswordModal, { CredentialEntry } from "@/components/TempPasswordModal";

type Employer = Tables<"employers">;
type Contact = Tables<"employer_contacts">;

const STATUS_STYLES: Record<Employer["status"], string> = {
  Active: "bg-accent/15 text-accent-foreground border-accent",
  Draft: "bg-muted text-muted-foreground border-muted-foreground/30",
  Suspended: "bg-primary/15 text-primary border-primary",
  Terminated: "bg-destructive/15 text-destructive border-destructive",
};

const ROLE_MAP: Record<string, string | null> = {
  "Employer System Admin": "employer_admin",
  "HR Manager": "hr_approver",
  "Supervisor": "supervisor",
  "Finance Manager": "employer_admin",
};

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground mt-0.5">{value ?? "—"}</dd>
    </div>
  );
}

export default function EmployerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authReps, setAuthReps] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [reshareOpen, setReshareOpen] = useState(false);
  const [reshareCredentials, setReshareCredentials] = useState<CredentialEntry[]>([]);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const [{ data: emp }, { data: generalContacts }, { data: arContacts }] = await Promise.all([
        supabase.from("employers").select("*").eq("employer_id", id).single(),
        supabase.from("employer_contacts").select("*").eq("employer_id", id).eq("contact_type", "general"),
        supabase.from("employer_contacts").select("*").eq("employer_id", id).eq("contact_type", "authorised_representative"),
      ]);
      setEmployer(emp);
      setContacts(generalContacts || []);
      setAuthReps(arContacts || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!employer) {
    return (
      <AdminLayout>
        <div className="text-center py-24 text-muted-foreground">Employer not found.</div>
      </AdminLayout>
    );
  }

  const authRep = authReps[0] || null;
  const authRepLinked = authRep
    ? contacts.some(
        (c) =>
          c.email?.toLowerCase() === authRep.email?.toLowerCase() &&
          c.first_name === authRep.first_name &&
          c.last_name === authRep.last_name
      )
    : false;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/employers")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{employer.company_legal_name}</h1>
                <Badge variant="outline" className={`text-xs font-semibold ${STATUS_STYLES[employer.status]}`}>
                  {employer.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Employer profile — read-only view</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReshareOpen(true);
              }}
              className="gap-1.5"
            >
              <Key className="h-4 w-4" />
              Reshare Logins
            </Button>
            <Button
              onClick={() => navigate(`/admin/employers/new?employer=${id}`)}
              className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Section 1 — Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Legal Name" value={employer.company_legal_name} />
              <Field label="Registration Number" value={employer.registration_number} />
              <Field label="VAT Number" value={employer.vat_number} />
              <Field label="Industry Sector" value={employer.industry_sector} />
              <Field label="Physical Address" value={employer.physical_address} />
            </dl>
          </CardContent>
        </Card>

        {/* Section 2 — Payroll & Pay Cycle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payroll & Pay Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Pay Cycle" value={employer.pay_cycle} />
              <Field label="Payday" value={employer.payday} />
              <Field label="Period Start" value={employer.payroll_period_start} />
              <Field label="Period End" value={employer.payroll_period_end} />
              <Field label="Export Format" value={employer.payroll_export_format} />
            </dl>
          </CardContent>
        </Card>

        {/* Section 3 — Policy Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Approval Mode" value={employer.employer_approval_mode} />
              <Field label="Max % of Earned Salary" value={employer.max_percent_earned != null ? `${employer.max_percent_earned}%` : null} />
              <Field label="Max per Transaction" value={employer.max_per_transaction != null ? `R ${Number(employer.max_per_transaction).toFixed(2)}` : null} />
              <Field label="Max per Pay Period" value={employer.max_per_pay_period != null ? `R ${Number(employer.max_per_pay_period).toFixed(2)}` : null} />
              <Field label="Cut-off Days" value={employer.cutoff_days} />
              <Field label="Fee %" value={employer.fee_percent != null ? `${employer.fee_percent}%` : null} />
              <Field label="Fee Flat Amount" value={employer.fee_flat_amount != null ? `R ${Number(employer.fee_flat_amount).toFixed(2)}` : null} />
              <Field label="Settlement Method" value={employer.settlement_method} />
            </dl>
          </CardContent>
        </Card>

        {/* Section 4 — System Users */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">System Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No system users found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow key={c.contact_id}>
                      <TableCell className="font-medium text-sm">{c.role_title || "—"}</TableCell>
                      <TableCell className="text-sm">{c.first_name} {c.last_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.email || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.cellphone || c.landline || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {/* Payroll contact if not already in contacts */}
                  {employer.payroll_contact_email &&
                    !contacts.some((c) => c.email?.toLowerCase() === employer.payroll_contact_email?.toLowerCase()) && (
                      <TableRow>
                        <TableCell className="font-medium text-sm">Payroll Contact</TableCell>
                        <TableCell className="text-sm">
                          {employer.payroll_contact_first_name} {employer.payroll_contact_last_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{employer.payroll_contact_email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{employer.payroll_contact_phone || "—"}</TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Section 5 — Authorised Representative */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Authorised Representative</CardTitle>
          </CardHeader>
          <CardContent>
            {authRep ? (
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                <Field label="Name" value={`${authRep.first_name} ${authRep.last_name}`} />
                <Field label="Email" value={authRep.email} />
                <Field label="Phone" value={authRep.cellphone || authRep.landline} />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Linked to System User</dt>
                  <dd className="mt-0.5">
                    <Badge variant="outline" className={`text-xs ${authRepLinked ? "border-accent text-accent-foreground" : "border-muted-foreground/30 text-muted-foreground"}`}>
                      {authRepLinked ? "Yes" : "No"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No authorised representative on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reshare Logins Modal */}
      <ReshareLoginsModal
        open={reshareOpen}
        onClose={() => setReshareOpen(false)}
        employer={employer}
        onCredentialsReady={(creds) => {
          setReshareCredentials(creds);
          setShowCredentials(true);
        }}
      />
      <TempPasswordModal
        open={showCredentials}
        onClose={() => {
          setShowCredentials(false);
          setReshareCredentials([]);
        }}
        credentials={reshareCredentials}
        title="Password Reset"
        description="New temporary passwords have been generated. Share them securely."
      />
    </AdminLayout>
  );
}
