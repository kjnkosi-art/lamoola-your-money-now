import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Loader2,
  CheckCircle,
  RefreshCw,
  Eye,
  Zap,
} from "lucide-react";
import { format, startOfMonth } from "date-fns";

// ── types ──
interface DisbursementRow {
  request_id: string;
  amount_requested: number;
  service_fee: number | null;
  fee_percent_applied: number | null;
  fee_flat_applied: number | null;
  amount_to_receive: number | null;
  request_status: string;
  created_at: string;
  employee: { first_name: string; last_name: string };
  employer: { company_legal_name: string };
  payout: {
    payout_id: string;
    payout_status: string;
    payout_initiated_at: string | null;
    payout_completed_at: string | null;
  } | null;
}

// ── helpers ──
const fmt = (n: number) =>
  `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusConfig: Record<string, { label: string; classes: string }> = {
  Approved: { label: "Approved", classes: "bg-accent/15 text-accent-foreground border-accent" },
  Processing: { label: "Processing", classes: "bg-warning/15 text-warning-foreground border-warning" },
  Paid: { label: "Paid", classes: "bg-accent/15 text-accent-foreground border-accent" },
  Failed: { label: "Failed", classes: "bg-destructive/15 text-destructive border-destructive" },
};

function resolvedStatus(row: DisbursementRow): string {
  if (row.payout) return row.payout.payout_status; // Processing | Paid | Failed
  return row.request_status; // Approved
}

export default function AdminDisbursements() {
  const { toast } = useToast();
  const [rows, setRows] = useState<DisbursementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    // Fetch approved/processed requests with related payouts
    const { data: requests, error } = await supabase
      .from("requests")
      .select(
        "request_id, amount_requested, service_fee, fee_percent_applied, fee_flat_applied, amount_to_receive, request_status, created_at, employee:employees!requests_employee_id_fkey(first_name, last_name), employer:employers!requests_employer_id_fkey(company_legal_name)"
      )
      .in("request_status", ["Approved", "Declined"])
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading disbursements", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Only keep Approved requests for the disbursements view
    const approvedRequests = (requests || []).filter((r: any) => r.request_status === "Approved");

    // Fetch all payouts
    const requestIds = approvedRequests.map((r: any) => r.request_id);
    let payoutsMap: Record<string, any> = {};

    if (requestIds.length > 0) {
      const { data: payouts } = await supabase
        .from("payouts")
        .select("payout_id, payout_status, payout_initiated_at, payout_completed_at, request_id")
        .in("request_id", requestIds);

      (payouts || []).forEach((p: any) => {
        payoutsMap[p.request_id] = p;
      });
    }

    const mapped: DisbursementRow[] = approvedRequests.map((r: any) => ({
      ...r,
      employee: r.employee,
      employer: r.employer,
      payout: payoutsMap[r.request_id] || null,
    }));

    setRows(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── stats ──
  const readyRows = rows.filter((r) => resolvedStatus(r) === "Approved");
  const processingRows = rows.filter((r) => resolvedStatus(r) === "Processing");
  const monthStart = startOfMonth(new Date()).toISOString();
  const paidRows = rows.filter(
    (r) => resolvedStatus(r) === "Paid" && r.payout?.payout_completed_at && r.payout.payout_completed_at >= monthStart
  );

  const readyTotal = readyRows.reduce((s, r) => s + r.amount_requested, 0);
  const processingTotal = processingRows.reduce((s, r) => s + r.amount_requested, 0);
  const paidTotal = paidRows.reduce((s, r) => s + r.amount_requested, 0);

  // ── actions ──
  const createPayout = async (requestId: string) => {
    setProcessing(requestId);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("payouts").insert({
      request_id: requestId,
      payout_status: "Processing",
      payout_initiated_at: new Date().toISOString(),
      payout_initiated_by: user?.id,
    });

    if (error) {
      toast({ title: "Failed to create payout", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("audit_trail").insert({
        user_id: user?.id,
        action_type: "payout_initiated" as const,
        object_type: "request",
        object_id: requestId,
      });
      toast({ title: "Payout initiated", description: "The payout is now processing." });
      await fetchData();
    }
    setProcessing(null);
  };

  const retryPayout = async (row: DisbursementRow) => {
    if (!row.payout) return;
    setProcessing(row.request_id);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("payouts")
      .update({
        payout_status: "Processing",
        payout_failed_at: null,
        failure_reason: null,
        payout_initiated_at: new Date().toISOString(),
        payout_initiated_by: user?.id,
        retry_count: (row.payout as any).retry_count ? (row.payout as any).retry_count + 1 : 1,
      })
      .eq("payout_id", row.payout.payout_id);

    if (error) {
      toast({ title: "Retry failed", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("audit_trail").insert({
        user_id: user?.id,
        action_type: "payout_retried" as const,
        object_type: "payout",
        object_id: row.payout.payout_id,
      });
      toast({ title: "Payout retried", description: "The payout is processing again." });
      await fetchData();
    }
    setProcessing(null);
  };

  const processBatch = async () => {
    if (readyRows.length === 0) return;
    setBatchProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const batchId = `BATCH-${Date.now()}`;

    const inserts = readyRows.map((r) => ({
      request_id: r.request_id,
      payout_status: "Processing" as const,
      payout_initiated_at: new Date().toISOString(),
      payout_initiated_by: user?.id,
      batch_id: batchId,
    }));

    const { error } = await supabase.from("payouts").insert(inserts);

    if (error) {
      toast({ title: "Batch processing failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Batch processed", description: `${readyRows.length} payout(s) initiated.` });
      await fetchData();
    }
    setBatchProcessing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Disbursements</h1>
            <p className="text-muted-foreground">Process and monitor all salary access payouts.</p>
          </div>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={readyRows.length === 0 || batchProcessing}
            onClick={processBatch}
          >
            {batchProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            Process Batch ({readyRows.length})
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Pay</p>
                  <p className="text-xl font-bold text-foreground">{readyRows.length} · {fmt(readyTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/15 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-xl font-bold text-foreground">{processingRows.length} · {fmt(processingTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid This Month</p>
                  <p className="text-xl font-bold text-foreground">{fmt(paidTotal)} · {paidRows.length} txns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-4 text-accent" />
              <p className="text-lg font-medium">No disbursements yet</p>
              <p className="text-sm">Approved requests will appear here for processing.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const status = resolvedStatus(row);
                    const cfg = statusConfig[status] || statusConfig.Approved;
                    const isRowProcessing = processing === row.request_id;

                    return (
                      <TableRow key={row.request_id}>
                        <TableCell className="font-medium">
                          {row.employee.first_name} {row.employee.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.employer.company_legal_name}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {fmt(row.amount_requested)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {fmt(row.service_fee ?? 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.classes}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(row.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {status === "Approved" && (
                            <Button
                              size="sm"
                              className="bg-accent text-accent-foreground hover:bg-accent/90"
                              disabled={isRowProcessing}
                              onClick={() => createPayout(row.request_id)}
                            >
                              {isRowProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
                            </Button>
                          )}
                          {status === "Processing" && (
                            <Button size="sm" variant="outline" disabled>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" /> In Progress
                            </Button>
                          )}
                          {status === "Paid" && (
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          )}
                          {status === "Failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              disabled={isRowProcessing}
                              onClick={() => retryPayout(row)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" /> Retry
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
