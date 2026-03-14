import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PendingRequest {
  request_id: string;
  amount_requested: number;
  service_fee: number | null;
  fee_percent_applied: number | null;
  fee_flat_applied: number | null;
  amount_to_receive: number | null;
  earned_salary_at_request: number | null;
  available_balance_at_request: number | null;
  approval_mode_applied: string | null;
  created_at: string;
  employee: {
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  employer: {
    employer_id: string;
    company_legal_name: string;
  };
}

const AVATAR_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
  "bg-destructive text-destructive-foreground",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatZAR(n: number) {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function feeLabel(percent: number | null, flat: number | null) {
  const parts: string[] = [];
  if (percent && percent > 0) parts.push(`${percent}%`);
  if (flat && flat > 0) parts.push(`R${flat} flat`);
  return parts.join(" + ") || "None";
}

export default function ApprovalQueue() {
  const location = useLocation();
  const isEmployerRoute = location.pathname.startsWith("/employer/");
  const Layout = isEmployerRoute ? EmployerLayout : AdminLayout;
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<PendingRequest | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const fetchPending = async () => {
    const { data, error } = await supabase
      .from("requests")
      .select("*, employee:employees!requests_employee_id_fkey(employee_id, first_name, last_name), employer:employers!requests_employer_id_fkey(employer_id, company_legal_name)")
      .eq("request_status", "Pending")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error loading requests", description: error.message, variant: "destructive" });
    } else {
      setRequests((data as unknown as PendingRequest[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (req: PendingRequest) => {
    setProcessing(req.request_id);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("requests")
      .update({
        request_status: "Approved",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq("request_id", req.request_id);

    if (error) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
      setProcessing(null);
      return;
    }

    // Audit trail
    await supabase.from("audit_trail").insert({
      user_id: user?.id,
      action_type: "request_approved" as const,
      object_type: "request",
      object_id: req.request_id,
      details: { amount: req.amount_requested, employee_id: req.employee.employee_id },
    });

    toast({ title: "Request approved", description: `${formatZAR(req.amount_requested)} for ${req.employee.first_name} ${req.employee.last_name}` });
    setRequests((prev) => prev.filter((r) => r.request_id !== req.request_id));
    setProcessing(null);
  };

  const handleDeclineSubmit = async () => {
    if (!declineTarget || !declineReason.trim()) return;
    setProcessing(declineTarget.request_id);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("requests")
      .update({
        request_status: "Declined",
        declined_by: user?.id,
        declined_at: new Date().toISOString(),
        decline_reason: declineReason.trim(),
      })
      .eq("request_id", declineTarget.request_id);

    if (error) {
      toast({ title: "Decline failed", description: error.message, variant: "destructive" });
      setProcessing(null);
      return;
    }

    await supabase.from("audit_trail").insert({
      user_id: user?.id,
      action_type: "request_declined" as const,
      object_type: "request",
      object_id: declineTarget.request_id,
      details: { amount: declineTarget.amount_requested, employee_id: declineTarget.employee.employee_id, reason: declineReason.trim() },
    });

    toast({ title: "Request declined", description: `Request from ${declineTarget.employee.first_name} ${declineTarget.employee.last_name} declined.` });
    setRequests((prev) => prev.filter((r) => r.request_id !== declineTarget.request_id));
    setDeclineTarget(null);
    setDeclineReason("");
    setProcessing(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approval Queue</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading…" : `${requests.length} pending request${requests.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4 text-accent" />
              <p className="text-lg font-medium">All clear!</p>
              <p className="text-sm">No pending requests to review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const fullName = `${req.employee.first_name} ${req.employee.last_name}`;
              const initials = `${req.employee.first_name[0]}${req.employee.last_name[0]}`.toUpperCase();
              const avatarColor = getAvatarColor(fullName);
              const approvalType = req.approval_mode_applied === "HR Approval" ? "HR" : "Supervisor";
              const isProcessing = processing === req.request_id;

              return (
                <Card key={req.request_id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}>
                        {initials}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{fullName}</span>
                          <Badge variant="outline" className={approvalType === "HR" ? "border-amber-500 text-amber-600" : "border-blue-500 text-blue-600"}>
                            {approvalType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{req.employer.company_legal_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                          {req.earned_salary_at_request != null && (
                            <p>Earned: {formatZAR(req.earned_salary_at_request)} · Available: {formatZAR(req.available_balance_at_request ?? 0)}</p>
                          )}
                          <p>Fee: {formatZAR(req.service_fee ?? 0)} ({feeLabel(req.fee_percent_applied, req.fee_flat_applied)})</p>
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-3">
                        <span className="text-xl font-bold text-foreground">{formatZAR(req.amount_requested)}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            disabled={isProcessing}
                            onClick={() => { setDeclineTarget(req); setDeclineReason(""); }}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Decline
                          </Button>
                          <Button
                            size="sm"
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            disabled={isProcessing}
                            onClick={() => handleApprove(req)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Decline modal */}
      <Dialog open={!!declineTarget} onOpenChange={(open) => { if (!open) { setDeclineTarget(null); setDeclineReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Decline Request
            </DialogTitle>
            <DialogDescription>
              Declining request of {declineTarget ? formatZAR(declineTarget.amount_requested) : ""} from{" "}
              {declineTarget ? `${declineTarget.employee.first_name} ${declineTarget.employee.last_name}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason for declining *</label>
            <Textarea
              placeholder="Provide a reason for declining this request…"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeclineTarget(null); setDeclineReason(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!declineReason.trim() || !!processing}
              onClick={handleDeclineSubmit}
            >
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
