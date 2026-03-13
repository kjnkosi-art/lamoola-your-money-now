import { useState } from "react";
import { Copy, Check, Key, UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CredentialEntry {
  email: string;
  password: string;
  role: string;
  alreadyExisted: boolean;
  noAuthAccount?: boolean;
  firstName?: string;
  lastName?: string;
  employerId?: string;
  authRole?: string;
}

function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
}

interface TempPasswordModalProps {
  open: boolean;
  onClose: () => void;
  credentials: CredentialEntry[];
  title?: string;
  description?: string;
}

export default function TempPasswordModal({ open, onClose, credentials: initialCredentials, title, description }: TempPasswordModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [credentials, setCredentials] = useState<CredentialEntry[]>([]);
  const [creatingIndex, setCreatingIndex] = useState<number | null>(null);

  // Sync credentials from props when modal opens
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setCredentials([...initialCredentials]);
      setCreatingIndex(null);
      setCopiedIndex(null);
      setCopiedAll(false);
    }
  }

  const handleCopySingle = async (password: string, index: number) => {
    await navigator.clipboard.writeText(password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const lines = credentials.map((c) =>
      c.noAuthAccount
        ? `${c.role}: ${c.email} — No auth account`
        : c.alreadyExisted
          ? `${c.role}: ${c.email} — Existing account (no new password)`
          : `${c.role}: ${c.email} / ${c.password}`
    );
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCreateAccount = async (index: number) => {
    const cred = credentials[index];
    if (!cred.noAuthAccount) return;

    setCreatingIndex(index);
    const tempPassword = generateTempPassword();

    try {
      const { data, error } = await supabase.functions.invoke("create-user-account", {
        body: {
          email: cred.email,
          password: tempPassword,
          first_name: cred.firstName || "",
          last_name: cred.lastName || "",
          role: cred.authRole || "employer_admin",
          employer_id: cred.employerId || null,
        },
      });

      if (error) {
        toast.error(`Failed to create account for ${cred.email}`);
        console.error("Create account error:", error);
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        // Update credential in-place
        setCredentials((prev) =>
          prev.map((c, i) =>
            i === index
              ? { ...c, noAuthAccount: false, alreadyExisted: false, password: tempPassword }
              : c
          )
        );
        toast.success(`Account created for ${cred.email}`);
      }
    } catch (err: any) {
      toast.error(`Failed to create account: ${err?.message || "Unknown error"}`);
    }

    setCreatingIndex(null);
  };

  const newAccounts = credentials.filter((c) => !c.alreadyExisted && !c.noAuthAccount);
  const missingAccounts = credentials.filter((c) => c.noAuthAccount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl min-w-[600px] max-w-[95vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {title || "Accounts Created"}
          </DialogTitle>
          <DialogDescription>
            {description || `${newAccounts.length} new account${newAccounts.length !== 1 ? "s" : ""} created. Share the temporary passwords below — users should change them on first login.`}
            {missingAccounts.length > 0 && (
              <span className="block mt-1 text-destructive font-medium">
                {missingAccounts.length} user{missingAccounts.length !== 1 ? "s" : ""} had no auth account — you can create them below.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border overflow-auto max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((cred, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium whitespace-nowrap">{cred.role}</TableCell>
                    <TableCell className="text-sm">{cred.email}</TableCell>
                    <TableCell>
                      {cred.noAuthAccount ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={creatingIndex !== null}
                          onClick={() => handleCreateAccount(i)}
                          className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                        >
                          {creatingIndex === i ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="h-3.5 w-3.5" />
                          )}
                          Create Account
                        </Button>
                      ) : cred.alreadyExisted ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                          Existing account — no new password
                        </Badge>
                      ) : (
                        <span className="font-mono text-sm tracking-wider">{cred.password}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!cred.alreadyExisted && !cred.noAuthAccount && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopySingle(cred.password, i)}>
                          {copiedIndex === i ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-destructive font-medium">
            ⚠ These passwords will not be shown again. Please copy and share them securely.
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleCopyAll} className="gap-1.5">
            {copiedAll ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copiedAll ? "Copied!" : "Copy All"}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
