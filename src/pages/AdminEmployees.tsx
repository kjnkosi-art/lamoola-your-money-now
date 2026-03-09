import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Upload, PlusCircle, Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Employee = Tables<"employees">;
type EmployeeStatus = Employee["status"];
type BankStatus = Employee["bank_verification_status"];

const STATUS_STYLES: Record<EmployeeStatus, string> = {
  Active: "bg-accent/15 text-accent-foreground border-accent",
  "Pending Invite": "bg-blue-500/15 text-blue-700 border-blue-400",
  Draft: "bg-muted text-muted-foreground border-muted-foreground/30",
  "On Hold": "bg-primary/15 text-primary border-primary",
  Terminated: "bg-destructive/15 text-destructive border-destructive",
};

const BANK_STYLES: Record<BankStatus, string> = {
  Verified: "bg-accent/15 text-accent-foreground border-accent",
  Pending: "bg-blue-500/15 text-blue-700 border-blue-400",
  Failed: "bg-destructive/15 text-destructive border-destructive",
};

const TABS: { label: string; value: EmployeeStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Pending Invite", value: "Pending Invite" },
  { label: "Draft", value: "Draft" },
  { label: "On Hold", value: "On Hold" },
  { label: "Terminated", value: "Terminated" },
];

function maskId(id: string | null): string {
  if (!id) return "—";
  return id.length > 4 ? "••••" + id.slice(-4) : id;
}

export default function AdminEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<EmployeeStatus | "All">("All");
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load employees");
    }
    setEmployees(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const statusCounts = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const filtered =
    activeTab === "All"
      ? employees
      : employees.filter((e) => e.status === activeTab);

  const handleRetryVerification = async (employee: Employee) => {
    toast.info(`Bank verification retry triggered for ${employee.first_name} ${employee.last_name}`);
    // Phase 2: integrate actual bank verification API
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {employees.length} employee{employees.length !== 1 ? "s" : ""} across all employers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/employees/bulk-upload")}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => navigate("/admin/employees/new")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map((tab) => {
            const count = tab.value === "All" ? employees.length : statusCounts[tab.value] || 0;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
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
                No employees found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Employee No.</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bank Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((emp) => (
                    <TableRow key={emp.employee_id}>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/admin/employees/${emp.employee_id}`)}
                          className="font-semibold text-secondary hover:text-primary hover:underline transition-colors text-left"
                        >
                          {emp.first_name} {emp.last_name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.employee_number || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {maskId(emp.sa_id_or_passport)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-semibold ${STATUS_STYLES[emp.status]}`}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-semibold ${BANK_STYLES[emp.bank_verification_status]}`}>
                          {emp.bank_verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/employees/${emp.employee_id}`)}
                            className="gap-1.5 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          {emp.bank_verification_status === "Failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryVerification(emp)}
                              className="gap-1.5 text-xs text-primary hover:text-primary border-primary/30 hover:bg-primary/10"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Retry
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
    </AdminLayout>
  );
}
