import { useEffect, useState } from "react";
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
import { DollarSign, Clock, CheckCircle, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DisbursementRow {
  request_id: string;
  amount_requested: number;
  service_fee: number | null;
  amount_to_receive: number | null;
  request_status: string;
  created_at: string;
  employee: { first_name: string; last_name: string };
  employer: { company_legal_name: string };
  payout: {
    payout_id: string;
    payout_status: string;
    payout_completed_at: string | null;
    retry_count: number | null;
  } | null;
}

function formatZAR(n: number) {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type ResolvedStatus = "Approved" | "Processing" | "Paid" | "Failed";

function resolveStatus(row: DisbursementRow): ResolvedStatus {
  if (row.payout) {
    return row.payout.payout_status as ResolvedStatus;
  }
  return "Approved";
}

const statusConfig: Record<ResolvedStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  Approved: { variant: "default", className: "bg-accent text-accent-foreground" },
  Processing: { variant: "secondary", className: "bg-amber-500 text-white" },
  Paid: { variant: "default", className: "bg-accent text-accent-foreground" },
  Failed: { variant: "destructive", className: "" },
};

export default function AdminDisbursements() {
  const { toast } = useToast();
  const [rows, setRows] = useState<DisbursementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const fetchData = async () => {
    // Fetch approved/processed requests
    const { data: requests, error } = await supabase
      .from("requests")
      .select("request_id, amount_requested, service_fee, amount_to_receive, request_status, created_at, employee:employees!requests_employee_id_fkey(first_name, last_name), employer:employers!requests_employer_id_fkey(company_legal_name)")
      .in("request_status", ["Approved", "Declined"])
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading disbursements", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Only keep Approved requests (we need them for payouts)
    const approvedRequests = (requests || []).filter((r: any) => r.request_status === "Approved");
    const requestIds = approvedRequests.map((r: any) => r.request_id);

    // Fetch payouts for these requests
    let payoutMap: Record<string, any> = {};
    if (requestIds.length > 0) {
      const { data: payouts } = await supabase
        .from("payouts")
        .select("payout_id, payout_status, payout_completed_at, retry_count, request_id")
        .in("request_id", requestIds);

      if (payouts) {
        for (const p of payouts) {
          payoutMap[p.request_id] = p;
        }
      }
    }

    // Also fetch payouts that aren't in approved list (e.g. already have payout records)
    const { data: allPayouts } = await supabase
      .from("payouts")
      .select("payout_id, payout_status, payout_completed_at, retry_count, request_id, request:requests!payouts_request_id_fkey(request_id, amount_requested, service_fee, amount_to_receive, request_status, created_at, employee:employees!requests_employee_id_fkey(first_name, last_name), employer:employers!requests_employer_id_fkey(company_legal_name))")
      .order("payout_initiated_at", { ascending: false });

    // Build combined rows: approved without payout + all with payouts
    const combinedMap: Record<string, DisbursementRow> = {};

    for (const req of approvedRequests) {
      combinedMap[req.request_id] = {
        ...(req as any),
        payout: payoutMap[req.request_id] || null,
      };
    }

    if (allPayouts) {
      for (const p of allPayouts) {
        const req = (p as any).request;
        if (req) {
          combinedMap[req.request_id] = {
            request_id: req.request_id,
            amount_requested: req.amount_requested,
            service_fee: req.service_fee,
            amount_to_receive: req.amount_to_receive,
            request_status: req.request_status,
            created_at: req.created_at,
            employee: req.employee,
            employer: req.employer,
            payout: {
              payout_id: p.payout_id,
              payout_status: p.payout_status,
              payout_completed_at: p.payout_completed_at,
              retry_count: p.retry_count,
            },
          };
        }
      }
    }

    setRows(Object.values(combinedMap));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Stats
  const readyToPay = rows.filter((r) => resolveStatus(r) === "Approved");
  const processingRows = rows.filter((r) => resolveStatus(r) === "Processing");
  const monthStart = startOfMonth(new Date()).toISOString();
  const paidThisMonth = rows.filter(
    (r) => resolveStatus(r) === "Paid" && r.payout?.payout_completed_at && r.payout.payout_completed_at >= monthStart
  );

  const sumAmount = (arr: DisbursementRow[]) => arr.reduce((s, r) => s + r.amount_requested, 0);

  const handlePayNow = async (row: DisbursementRow) => {
    setProcessing(row.request_id);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("payouts").insert({
      request_id: row.request_id,
      payout_status: "Processing",
      payout_initiated_at: new Date().toISOString(),
      payout_initiated_by: user?.id,
    });

    if (error) {
      toast({ title: "Payout failed", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("audit_trail").insert({
        user_id: user?.id,
        action_type: "payout_initiated" as const,
        object_type: "payout",
        object_id: row.request_id,
        details: { amount: row.amount_requested },
      });
      toast({ title: "Payout initiated", description: `${formatZAR(row.amount_requested)} is now processing.` });
      await fetchData();
    }
    setProcessing(null);
  };

  const handleRetry = async (row: DisbursementRow) => {
    if (!row.payout) return;
    setProcessing(row.request_id);

    const { error } = await supabase
      .from("payouts")
      .update({
        payout_status: "Processing",
        payout_failed_at: null,
        failure_reason: null,
        retry_count: (row.payout.retry_count ?? 0) + 1,
      })
      .eq("payout_id", row.payout.payout_id);

    if (error) {
      toast({ title: "Retry failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("audit_trail").insert({
        user_id: user?.id,
        action_type: "payout_retried" as const,
        object_type: "payout",
        object_id: row.payout.payout_id,
        details: { amount: row.amount_requested, retry_count: (row.payout.retry_count ?? 0) + 1 },
      });
      toast({ title: "Retry initiated", description: `Payout for ${formatZAR(row.amount_requested)} is being retried.` });
      await fetchData();
    }
    setProcessing(null);
  };

  const handleProcessBatch = async () => {
    const ready = rows.filter((r) => resolveStatus(r) === "Approved");
    if (ready.length === 0) {
      toast({ title: "No requests to process", description: "There are no approved requests ready for payout." });
      return;
    }
    setBatchProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const batchId = crypto.randomUUID();

    const inserts = ready.map((r) => ({
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
      toast({ title: "Batch processed", description: `${ready.length} payout(s) initiated.` });
      await fetchData();
    }
    setBatchProcessing(false);
  };

  const renderActions = (row: DisbursementRow) => {
    const status = resolveStatus(row);
    const isProc = processing === row.request_id;

    switch (status) {
      case "Approved":
        return (
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isProc} onClick={() => handlePayNow(row)}>
            {isProc ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
          </Button>
        );
      case "Processing":
        return <Button size="sm" variant="outline" disabled>In Progress</Button>;
      case "Paid":
        return <Button size="sm" variant="outline">View</Button>;
      case "Failed":
        return (
          <Button size="sm" variant="destructive" disabled={isProc} onClick={() => handleRetry(row)}>
            {isProc ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry"}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Disbursements</h1>
            <p className="text-muted-foreground">Process and monitor all salary access payouts.</p>
          </div>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={batchProcessing || readyToPay.length === 0}
            onClick={handleProcessBatch}
          >
            {batchProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Process Batch ({readyToPay.length})
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Pay</p>
                  <p className="text-xl font-bold text-foreground">{readyToPay.length} · {formatZAR(sumAmount(readyToPay))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-xl font-bold text-foreground">{processingRows.length} · {formatZAR(sumAmount(processingRows))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid This Month</p>
                  <p className="text-xl font-bold text-foreground">{formatZAR(sumAmount(paidThisMonth))} · {paidThisMonth.length} txn{paidThisMonth.length !== 1 ? "s" : ""}</p>
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
                    const status = resolveStatus(row);
                    const config = statusConfig[status];
                    return (
                      <TableRow key={row.request_id}>
                        <TableCell className="font-medium">{row.employee.first_name} {row.employee.last_name}</TableCell>
                        <TableCell>{row.employer.company_legal_name}</TableCell>
                        <TableCell className="text-right font-semibold">{formatZAR(row.amount_requested)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatZAR(row.service_fee ?? 0)}</TableCell>
                        <TableCell>
                          <Badge className={config.className}>{status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(row.created_at), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-right">{renderActions(row)}</TableCell>
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
