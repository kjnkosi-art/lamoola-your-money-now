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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TempPasswordModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  password: string;
  role: string;
}

export default function TempPasswordModal({ open, onClose, email, password, role }: TempPasswordModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Account Created
          </DialogTitle>
          <DialogDescription>
            A user account has been created for the {role}. Share the temporary password below — the user should change it on first login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Email</Label>
            <Input value={email} readOnly className="bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Temporary Password</Label>
            <div className="flex gap-2">
              <Input value={password} readOnly className="bg-muted font-mono tracking-wider" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-destructive font-medium">
            ⚠ This password will not be shown again. Please copy and share it securely.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
