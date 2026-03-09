import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, UserX, RefreshCw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Employee = Tables<"employees">;

const statusColors: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Pending Invite": "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  "On Hold": "bg-orange-100 text-orange-800",
  Terminated: "bg-red-100 text-red-800",
};

const bankStatusColors: Record<string, string> = {
  Pending: "bg-blue-100 text-blue-800",
  Verified: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
};

function maskAccount(acc: string | null) {
  if (!acc || acc.length < 4) return acc || "—";
  return "••••" + acc.slice(-4);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employerName, setEmployerName] = useState("");
  const [employerApprovalMode, setEmployerApprovalMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTerminate, setShowTerminate] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [terminating, setTerminating] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("employee_id", id)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "Employee not found", variant: "destructive" });
        navigate("/admin/employees");
        return;
      }

      setEmployee(data);

      // Fetch employer name & approval mode
      const { data: emp } = await supabase
        .from("employers")
        .select("company_legal_name, employer_approval_mode")
        .eq("employer_id", data.employer_id)
        .single();

      if (emp) {
        setEmployerName(emp.company_legal_name);
        setEmployerApprovalMode(emp.employer_approval_mode);
      }
      setLoading(false);
    };
    load();
  }, [id, navigate, toast]);

  const handleTerminate = async () => {
    if (!employee || !terminateReason.trim()) return;
    setTerminating(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("employees")
      .update({ status: "Terminated" })
      .eq("employee_id", employee.employee_id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setTerminating(false);
      return;
    }

    await supabase.from("audit_trail").insert({
      action_type: "employee_terminated" as const,
      object_type: "employee",
      object_id: employee.employee_id,
      user_id: user?.id,
      details: { reason: terminateReason },
    });

    toast({ title: "Employee terminated" });
    setShowTerminate(false);
    setEmployee({ ...employee, status: "Terminated" });
    setTerminating(false);
  };

  const handleMarkVerified = async () => {
    if (!employee) return;
    const updates: Record<string, string> = { bank_verification_status: "Verified" };
    const shouldActivate = employee.tcs_accepted && employee.status !== "Active";
    if (shouldActivate) updates.status = "Active";

    const { error } = await supabase
      .from("employees")
      .update(updates)
      .eq("employee_id", employee.employee_id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    const updatedEmployee = { ...employee, bank_verification_status: "Verified" as const, ...(shouldActivate ? { status: "Active" as const } : {}) };
    setEmployee(updatedEmployee);
    toast({ title: "Bank verified", description: shouldActivate ? "Employee status set to Active." : "Bank verification status updated." });
  };

  const handleMarkFailed = async () => {
    if (!employee) return;
    const { error } = await supabase
      .from("employees")
      .update({ bank_verification_status: "Failed" })
      .eq("employee_id", employee.employee_id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setEmployee({ ...employee, bank_verification_status: "Failed" as const });
    toast({ title: "Bank verification failed", description: "Status set to Failed." });
  };

  const handleRetryVerification = async () => {
    if (!employee) return;
    const { error } = await supabase
      .from("employees")
      .update({ bank_verification_status: "Pending" })
      .eq("employee_id", employee.employee_id);

    if (!error) {
      toast({ title: "Verification retried", description: "Bank verification status reset to Pending." });
      setEmployee({ ...employee, bank_verification_status: "Pending" });
    }
  };

  const handleAcceptTCs = async () => {
    if (!employee) return;
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { tcs_accepted: true, tcs_accepted_date: now };
    const shouldActivate = employee.bank_verification_status === "Verified" && employee.status !== "Active";
    if (shouldActivate) updates.status = "Active";

    const { error } = await supabase
      .from("employees")
      .update(updates)
      .eq("employee_id", employee.employee_id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setEmployee({
      ...employee,
      tcs_accepted: true,
      tcs_accepted_date: now,
      ...(shouldActivate ? { status: "Active" as const } : {}),
    });
    toast({ title: "T&Cs accepted", description: shouldActivate ? "Employee status set to Active." : "Terms acceptance recorded." });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!employee) return null;

  const approvalDisplay = employee.approval_mode
    ? `${employee.approval_mode} (Override)`
    : `${employerApprovalMode} (Inherited)`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/employees")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {employee.first_name} {employee.last_name}
                </h1>
                <Badge className={statusColors[employee.status] || ""}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {employee.employee_number ? `#${employee.employee_number}` : "No employee number"} · {employerName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {employee.status === "Draft" && (
              <Button variant="outline" onClick={() => navigate(`/admin/employees/${employee.employee_id}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
            {employee.status !== "Terminated" && (
              <Button variant="destructive" onClick={() => setShowTerminate(true)}>
                <UserX className="h-4 w-4 mr-2" /> Terminate Employee
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="bank">Bank & Verification</TabsTrigger>
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="activity">Activity History</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="First Name" value={employee.first_name} />
                <InfoRow label="Last Name" value={employee.last_name} />
                <InfoRow label="ID Document Type" value={employee.id_document_type === "sa_id" ? "SA ID" : employee.id_document_type === "passport" ? "Passport" : "—"} />
                <InfoRow label="SA ID / Passport" value={employee.sa_id_or_passport} />
                <InfoRow label="Date of Birth" value={employee.date_of_birth} />
                <InfoRow label="Mobile Number" value={employee.mobile_number} />
                <InfoRow label="Email" value={employee.email_address} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment">
            <Card>
              <CardHeader><CardTitle>Employment Details</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="Employee Number" value={employee.employee_number} />
                <InfoRow label="Employer" value={employerName} />
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Employment Status" value={employee.employment_status} />
                <InfoRow label="Start Date" value={employee.employment_start_date} />
                <InfoRow label="Gross Salary" value={employee.gross_salary ? `R ${Number(employee.gross_salary).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : null} />
                <InfoRow label="Approval Mode" value={approvalDisplay} />
                <InfoRow label="Pay Cycle" value={employee.pay_cycle} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardHeader><CardTitle>Bank & Verification</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="Bank Name" value={employee.bank_name} />
                <InfoRow label="Account Number" value={maskAccount(employee.bank_account_number)} />
                <InfoRow label="Account Type" value={employee.account_type} />
                <InfoRow label="Account Holder" value={employee.account_holder_name} />
                <InfoRow
                  label="Verification Status"
                  value={
                    <div className="flex items-center gap-2">
                      <Badge className={bankStatusColors[employee.bank_verification_status] || ""}>
                        {employee.bank_verification_status}
                      </Badge>
                      {employee.bank_verification_status === "Pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleMarkVerified}>
                            Mark as Verified
                          </Button>
                          <Button size="sm" variant="destructive" onClick={handleMarkFailed}>
                            Mark as Failed
                          </Button>
                        </>
                      )}
                      {employee.bank_verification_status === "Failed" && (
                        <Button variant="outline" size="sm" onClick={handleRetryVerification}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry Verification
                        </Button>
                      )}
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            <Card>
              <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
              <CardContent>
                <InfoRow
                  label="T&Cs Accepted"
                  value={
                    <div className="flex items-center gap-2">
                      <span>{employee.tcs_accepted ? "Yes" : "No"}</span>
                      {!employee.tcs_accepted && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAcceptTCs}>
                          Accept T&Cs
                        </Button>
                      )}
                    </div>
                  }
                />
                <InfoRow label="Acceptance Date" value={employee.tcs_accepted_date ? new Date(employee.tcs_accepted_date).toLocaleString("en-ZA") : "—"} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Activity history will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Terminate Modal */}
      <Dialog open={showTerminate} onOpenChange={setShowTerminate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Employee</DialogTitle>
            <DialogDescription>
              This will terminate {employee.first_name} {employee.last_name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason for termination</label>
            <Textarea
              placeholder="Enter reason..."
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminate(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleTerminate}
              disabled={!terminateReason.trim() || terminating}
            >
              {terminating ? "Terminating..." : "Confirm Termination"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}