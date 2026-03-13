import { useState } from "react";
import { Copy, Check, Key } from "lucide-react";
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

export interface CredentialEntry {
  email: string;
  password: string;
  role: string;
  alreadyExisted: boolean;
}

interface TempPasswordModalProps {
  open: boolean;
  onClose: () => void;
  credentials: CredentialEntry[];
  title?: string;
  description?: string;
}

export default function TempPasswordModal({ open, onClose, credentials }: TempPasswordModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopySingle = async (password: string, index: number) => {
    await navigator.clipboard.writeText(password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const lines = credentials.map((c) =>
      c.alreadyExisted
        ? `${c.role}: ${c.email} — Existing account (no new password)`
        : `${c.role}: ${c.email} / ${c.password}`
    );
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const newAccounts = credentials.filter((c) => !c.alreadyExisted);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Accounts Created
          </DialogTitle>
          <DialogDescription>
            {newAccounts.length} new account{newAccounts.length !== 1 ? "s" : ""} created. Share the temporary passwords below — users should change them on first login.
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
                      {cred.alreadyExisted ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                          Existing account — no new password
                        </Badge>
                      ) : (
                        <span className="font-mono text-sm tracking-wider">{cred.password}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!cred.alreadyExisted && (
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
