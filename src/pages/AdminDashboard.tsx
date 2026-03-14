import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Banknote, Receipt } from "lucide-react";
import citrusWheel from "@/assets/citrus-wheel.png";
import { startOfMonth } from "date-fns";

interface EmployerActivity {
  employer_id: string;
  company_legal_name: string;
  status: string;
  employee_count: number;
}

interface PendingApproval {
  request_id: string;
  amount_requested: number;
  employee_name: string;
  employer_name: string;
}

const AdminDashboard = () => {
  const [firstName, setFirstName] = useState("");
  const [activeEmployers, setActiveEmployers] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [monthPayouts, setMonthPayouts] = useState(0);
  const [monthFees, setMonthFees] = useState(0);
  const [recentEmployers, setRecentEmployers] = useState<EmployerActivity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingApproval[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();
      if (profile) setFirstName(profile.first_name);

      // Active employers count
      const { count: empCount } = await supabase
        .from("employers")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active");
      setActiveEmployers(empCount || 0);

      // Active employees count
      const { count: eeCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active");
      setActiveEmployees(eeCount || 0);

      // This month approved requests
      const monthStart = startOfMonth(new Date()).toISOString();
      const { data: monthReqs } = await supabase
        .from("requests")
        .select("amount_requested, service_fee")
        .eq("request_status", "Approved")
        .gte("created_at", monthStart);

      if (monthReqs) {
        const totalAdvanced = monthReqs.reduce((sum, r) => sum + Number(r.amount_requested), 0);
        const totalFees = monthReqs.reduce((sum, r) => sum + Number(r.service_fee || 0), 0);
        setMonthPayouts(totalAdvanced);
        setMonthFees(totalFees);
      }

      // Recent employers with employee counts
      const { data: employers } = await supabase
        .from("employers")
        .select("employer_id, company_legal_name, status")
        .order("created_at", { ascending: false })
        .limit(5);

      if (employers) {
        const withCounts = await Promise.all(
          employers.map(async (emp) => {
            const { count } = await supabase
              .from("employees")
              .select("*", { count: "exact", head: true })
              .eq("employer_id", emp.employer_id);
            return { ...emp, employee_count: count || 0 };
          })
        );
        setRecentEmployers(withCounts);
      }

      // Pending requests with names
      const { data: requests } = await supabase
        .from("requests")
        .select("request_id, amount_requested, employee_id, employer_id")
        .eq("request_status", "Pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (requests && requests.length > 0) {
        const mapped = await Promise.all(
          requests.map(async (req) => {
            const { data: emp } = await supabase
              .from("employees")
              .select("first_name, last_name")
              .eq("employee_id", req.employee_id)
              .single();
            const { data: er } = await supabase
              .from("employers")
              .select("company_legal_name")
              .eq("employer_id", req.employer_id)
              .single();
            return {
              request_id: req.request_id,
              amount_requested: req.amount_requested,
              employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
              employer_name: er?.company_legal_name || "Unknown",
            };
          })
        );
        setPendingRequests(mapped);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-accent/15 text-accent-foreground border-accent";
      case "Draft": return "bg-muted text-muted-foreground border-border";
      case "Suspended": return "bg-primary/15 text-primary border-primary";
      case "Terminated": return "bg-destructive/15 text-destructive border-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {/* Decorative citrus wheel */}
        <img
          src={citrusWheel}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -bottom-8 -right-8 w-48 opacity-[0.06] rotate-[20deg]"
          style={{ filter: "brightness(1.1) saturate(1.3) hue-rotate(-10deg)" }}
        />

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {firstName || "Admin"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across Lamoola today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-lamoola-navy/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-lamoola-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeEmployers}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Employers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-lamoola-navy/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-lamoola-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Employees</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-lamoola-green/10 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-lamoola-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-lamoola-green">
                  R{monthPayouts.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Advanced This Month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-lamoola-green/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-lamoola-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-lamoola-green">
                  R{monthFees.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Fees This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Employer Activity */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">Recent Employer Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEmployers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No employers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-muted-foreground text-xs uppercase">Company</th>
                        <th className="text-center py-2 font-semibold text-muted-foreground text-xs uppercase">Employees</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground text-xs uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEmployers.map((emp) => (
                        <tr key={emp.employer_id} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium text-foreground">{emp.company_legal_name}</td>
                          <td className="py-3 text-center text-muted-foreground">{emp.employee_count}</td>
                          <td className="py-3 text-right">
                            <Badge variant="outline" className={`text-[10px] font-bold ${statusColor(emp.status)}`}>
                              {emp.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending approvals.</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.request_id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{req.employee_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{req.employer_name}</p>
                      </div>
                      <div className="text-right ml-3 flex items-center gap-3">
                        <span className="text-sm font-bold text-primary whitespace-nowrap">
                          R{req.amount_requested.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                        </span>
                        <Button size="sm" variant="outline" className="text-xs h-7 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
