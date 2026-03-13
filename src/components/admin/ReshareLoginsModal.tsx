import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CredentialEntry } from "@/components/TempPasswordModal";
import type { Tables } from "@/integrations/supabase/types";

type Employer = Tables<"employers">;

const ROLE_MAP: Record<string, string | null> = {
  "Employer System Admin": "employer_admin",
  "HR Manager": "hr_approver",
  "Supervisor": "supervisor",
  "Finance Manager": null,
};

interface SystemUser {
  email: string;
  first_name: string;
  last_name: string;
  displayRole: string;
}

interface ReshareLoginsModalProps {
  open: boolean;
  onClose: () => void;
  employer: Employer | null;
  onCredentialsReady: (credentials: CredentialEntry[]) => void;
}

export default function ReshareLoginsModal({
  open,
  onClose,
  employer,
  onCredentialsReady,
}: ReshareLoginsModalProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [resettingEmails, setResettingEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && employer) {
      fetchUsers();
    } else {
      setUsers([]);
      setSelected(new Set());
      setResettingEmails(new Set());
    }
  }, [open, employer]);

  const fetchUsers = async () => {
    if (!employer) return;
    setLoading(true);

    const collected: SystemUser[] = [];

    // Fetch system user contacts
    const { data: contacts } = await supabase
      .from("employer_contacts")
      .select("*")
      .eq("employer_id", employer.employer_id)
      .eq("contact_type", "general");

    // Also fetch authorised_representative contacts
    const { data: authReps } = await supabase
      .from("employer_contacts")
      .select("*")
      .eq("employer_id", employer.employer_id)
      .eq("contact_type", "authorised_representative");

    const allContacts = [...(contacts || []), ...(authReps || [])];

    for (const c of allContacts) {
      const authRole = ROLE_MAP[c.role_title || ""];
      if (authRole && c.email) {
        collected.push({
          email: c.email,
          first_name: c.first_name,
          last_name: c.last_name,
          displayRole: c.role_title || "",
        });
      }
    }

    // Add payroll contact
    if (employer.payroll_contact_email) {
      const alreadyIncluded = collected.some(
        (u) => u.email.toLowerCase() === employer.payroll_contact_email!.toLowerCase()
      );
      if (!alreadyIncluded) {
        collected.push({
          email: employer.payroll_contact_email,
          first_name: employer.payroll_contact_first_name || "",
          last_name: employer.payroll_contact_last_name || "",
          displayRole: "Payroll Contact",
        });
      }
    }

    setUsers(collected);
    setLoading(false);
  };

  const toggleSelect = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.email)));
    }
  };

  const resetPasswords = async (emails: string[]) => {
    setResettingEmails((prev) => new Set([...prev, ...emails]));
    const credentials: CredentialEntry[] = [];
    const failedEmails: string[] = [];

    for (const email of emails) {
      try {
        const { data, error } = await supabase.functions.invoke("reset-user-password", {
          body: { email },
        });

        if (error) {
          let msg = error.message;
          try {
            const ctx = await (error as any).context?.json?.();
            if (ctx?.error) msg = ctx.error;
          } catch { /* ignore parse errors */ }
          failedEmails.push(email);
          console.warn(`Failed to reset ${email}: ${msg}`);
        } else if (data?.error) {
          failedEmails.push(email);
          console.warn(`Failed to reset ${email}: ${data.error}`);
        } else {
          const user = users.find((u) => u.email === email);
          credentials.push({
            email: data.email,
            password: data.password,
            role: user?.displayRole || "",
            alreadyExisted: false,
          });
        }
      } catch (err: any) {
        failedEmails.push(email);
        console.warn(`Failed to reset ${email}: ${err?.message || "Unknown error"}`);
      }
    }

    // Build credential entries for failed users so admin can create accounts
    for (const email of failedEmails) {
      const user = users.find((u) => u.email === email);
      const authRole = user ? ROLE_MAP[user.displayRole] : null;
      credentials.push({
        email,
        password: "",
        role: user?.displayRole || "",
        alreadyExisted: false,
        noAuthAccount: true,
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        employerId: employer?.employer_id || "",
        authRole: authRole || "employer_admin",
      });
    }

    setResettingEmails(new Set());

    if (failedEmails.length > 0) {
      toast.error(`Reset ${credentials.length - failedEmails.length} of ${emails.length} — ${failedEmails.length} user(s) have no auth account`);
    }

    if (credentials.length > 0) {
      onClose();
      onCredentialsReady(credentials);
    }
  };

  const handleResetSingle = (email: string) => resetPasswords([email]);

  const handleResetSelected = () => {
    if (selected.size === 0) {
      toast.error("No users selected.");
      return;
    }
    resetPasswords(Array.from(selected));
  };

  const handleResetAll = () => resetPasswords(users.map((u) => u.email));

  const isResetting = resettingEmails.size > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl min-w-[600px] max-w-[95vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Reshare Login Credentials
          </DialogTitle>
          <DialogDescription>
            Select users to reset their passwords for{" "}
            <span className="font-semibold text-foreground">
              {employer?.company_legal_name}
            </span>
            . New temporary passwords will be generated.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No system users found for this employer.
            </div>
          ) : (
            <div className="rounded-md border overflow-auto max-h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selected.size === users.length && users.length > 0}
                        onCheckedChange={toggleAll}
                        disabled={isResetting}
                      />
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-24 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(user.email)}
                          onCheckedChange={() => toggleSelect(user.email)}
                          disabled={isResetting}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">
                        {user.displayRole}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isResetting}
                          onClick={() => handleResetSingle(user.email)}
                          className="gap-1.5 text-xs"
                        >
                          {resettingEmails.has(user.email) ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {users.length > 0 && (
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResetSelected}
                disabled={isResetting || selected.size === 0}
                className="gap-1.5"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Reset Selected ({selected.size})
              </Button>
              <Button
                variant="default"
                onClick={handleResetAll}
                disabled={isResetting}
                className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Reset All
              </Button>
            </div>
            <Button variant="ghost" onClick={onClose} disabled={isResetting}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
