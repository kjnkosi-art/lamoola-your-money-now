import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, Eye, Play, Trash2, RotateCcw, Key } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import TempPasswordModal, { CredentialEntry } from "@/components/TempPasswordModal";
import ReshareLoginsModal from "@/components/admin/ReshareLoginsModal";

type Employer = Tables<"employers">;
type EmployerStatus = Employer["status"];

const STATUS_STYLES: Record<EmployerStatus, string> = {
  Active: "bg-accent/15 text-accent-foreground border-accent",
  Draft: "bg-muted text-muted-foreground border-muted-foreground/30",
  Suspended: "bg-primary/15 text-primary border-primary",
  Terminated: "bg-destructive/15 text-destructive border-destructive",
};

const TABS: { label: string; value: EmployerStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Draft", value: "Draft" },
  { label: "Suspended", value: "Suspended" },
  { label: "Terminated", value: "Terminated" },
];

export default function AdminEmployers() {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<EmployerStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [discardTarget, setDiscardTarget] = useState<Employer | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const [reshareTarget, setReshareTarget] = useState<Employer | null>(null);
  const [reshareCredentials, setReshareCredentials] = useState<CredentialEntry[]>([]);
  const [showReshareCredentials, setShowReshareCredentials] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    const { data: employerData } = await supabase
      .from("employers")
      .select("*")
      .order("created_at", { ascending: false });

    const emps = employerData || [];
    setEmployers(emps);

    // Fetch employee counts per employer
    if (emps.length > 0) {
      const ids = emps.map((e) => e.employer_id);
      const { data: employees } = await supabase
        .from("employees")
        .select("employer_id")
        .in("employer_id", ids);

      const counts: Record<string, number> = {};
      (employees || []).forEach((emp) => {
        counts[emp.employer_id] = (counts[emp.employer_id] || 0) + 1;
      });
      setEmployeeCounts(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusCounts = employers.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const filtered =
    activeTab === "All"
      ? employers
      : employers.filter((e) => e.status === activeTab);

  const handleDiscard = async () => {
    if (!discardTarget) return;
    setDiscarding(true);
    const { error } = await supabase
      .from("employers")
      .update({ status: "Terminated" as EmployerStatus })
      .eq("employer_id", discardTarget.employer_id);

    if (error) {
      toast.error("Failed to discard employer.");
    } else {
      toast.success(`${discardTarget.company_legal_name} has been discarded.`);
      fetchData();
    }
    setDiscarding(false);
    setDiscardTarget(null);
  };

  const handleReactivate = async (employer: Employer) => {
    const { error } = await supabase
      .from("employers")
      .update({ status: "Active" as EmployerStatus })
      .eq("employer_id", employer.employer_id);

    if (error) {
      toast.error("Failed to reactivate employer.");
    } else {
      toast.success(`${employer.company_legal_name} has been reactivated.`);
      fetchData();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All employers onboarded to Lamoola.
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/employers/new")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Employer
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map((tab) => {
            const count =
              tab.value === "All"
                ? employers.length
                : statusCounts[tab.value] || 0;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({count})
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t" />
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-6 w-6 border-4 border-accent border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No employers found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Registration No.</TableHead>
                    <TableHead className="text-center">Employees</TableHead>
                    <TableHead>Pay Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((employer) => (
                    <TableRow key={employer.employer_id}>
                      <TableCell>
                        <button
                          onClick={() =>
                            navigate(`/admin/employers/${employer.employer_id}`)
                          }
                          className="font-semibold text-secondary hover:text-primary hover:underline transition-colors text-left"
                        >
                          {employer.company_legal_name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employer.registration_number || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {employeeCounts[employer.employer_id] || 0}
                      </TableCell>
                      <TableCell>{employer.pay_cycle}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${STATUS_STYLES[employer.status]}`}
                        >
                          {employer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {employer.status === "Active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/admin/employers/${employer.employer_id}`
                                )
                              }
                              className="gap-1.5 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                          )}
                          {employer.status === "Draft" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/employers/new?employer=${employer.employer_id}`
                                  )
                                }
                                className="gap-1.5 text-xs"
                              >
                                <Play className="h-3.5 w-3.5" />
                                Resume
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDiscardTarget(employer)}
                                className="gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Discard
                              </Button>
                            </>
                          )}
                          {employer.status === "Suspended" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivate(employer)}
                              className="gap-1.5 text-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discard Confirmation Modal */}
      <Dialog
        open={!!discardTarget}
        onOpenChange={(open) => !open && setDiscardTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Draft Employer</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard{" "}
              <span className="font-semibold text-foreground">
                {discardTarget?.company_legal_name}
              </span>
              ? This will mark the employer as terminated and cannot be undone
              easily.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDiscardTarget(null)}
              disabled={discarding}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={discarding}
            >
              {discarding ? "Discarding..." : "Discard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
