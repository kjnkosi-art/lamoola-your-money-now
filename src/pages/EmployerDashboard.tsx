import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, Clock, Banknote, KeyRound } from "lucide-react";
import { startOfMonth, format } from "date-fns";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

interface RecentActivity {
  employeeName: string;
  status: string;
  lastAction: string;
  date: string;
}

const statusColor = (s: string) => {
  switch (s) {
    case "Active": return "bg-green-100 text-green-800 border-green-300";
    case "Draft": return "bg-gray-100 text-gray-700 border-gray-300";
    case "Pending Invite": return "bg-blue-100 text-blue-700 border-blue-300";
    case "On Hold": return "bg-orange-100 text-orange-700 border-orange-300";
    case "Terminated": return "bg-red-100 text-red-700 border-red-300";
    default: return "bg-muted text-muted-foreground";
  }
};

const EmployerDashboard = () => {
  const [companyName, setCompanyName] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [recentPayoutsTotal, setRecentPayoutsTotal] = useState(0);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employerId } = await supabase.rpc("get_user_employer_id", { _user_id: user.id });
      if (!employerId) { setLoading(false); return; }

      // Company name
      const { data: employer } = await supabase
        .from("employers")
        .select("company_legal_name")
        .eq("employer_id", employerId)
        .single();
      if (employer) setCompanyName(employer.company_legal_name);

      // Active employees count
      const { count: ac } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", employerId)
        .eq("status", "Active");
      setActiveCount(ac || 0);

      // Pending approvals
      const { count: pc } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", employerId)
        .eq("request_status", "Pending");
      setPendingApprovals(pc || 0);

      // Recent payouts this month
      const monthStart = startOfMonth(new Date()).toISOString();
      const { data: reqs } = await supabase
        .from("requests")
        .select("request_id, amount_requested")
        .eq("employer_id", employerId)
        .eq("request_status", "Approved");

      if (reqs && reqs.length > 0) {
        const reqIds = reqs.map((r) => r.request_id);
        const { data: payouts } = await supabase
          .from("payouts")
          .select("request_id, payout_status, payout_completed_at")
          .in("request_id", reqIds)
          .eq("payout_status", "Paid")
          .gte("payout_completed_at", monthStart);

        if (payouts) {
          const paidReqIds = new Set(payouts.map((p) => p.request_id));
          const total = reqs
            .filter((r) => paidReqIds.has(r.request_id))
            .reduce((sum, r) => sum + Number(r.amount_requested), 0);
          setRecentPayoutsTotal(total);
        }
      }

      // Recent employee activity
      const { data: employees } = await supabase
        .from("employees")
        .select("first_name, last_name, status, updated_at")
        .eq("employer_id", employerId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (employees) {
        setActivity(
          employees.map((e) => ({
            employeeName: `${e.first_name} ${e.last_name}`,
            status: e.status,
            lastAction: e.status === "Active" ? "Profile updated" : `Status: ${e.status}`,
            date: format(new Date(e.updated_at), "dd MMM yyyy"),
          }))
        );
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <EmployerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{companyName || "Employer Dashboard"}</h1>
          <p className="text-sm text-muted-foreground">Welcome to your company dashboard.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingApprovals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Payouts</CardTitle>
              <Banknote className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                R{recentPayoutsTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Employee Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent activity.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Action</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activity.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor(a.status)}>{a.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.lastAction}</TableCell>
                      <TableCell className="text-muted-foreground">{a.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
