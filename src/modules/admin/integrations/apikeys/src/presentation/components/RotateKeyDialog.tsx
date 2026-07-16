"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Copy, Check, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { CreateApiKeyResult } from "../../domain/entities/ApiKey";
import { useI18n } from "@core/providers/i18n-provider";

interface RotateKeyDialogProps {
  rotatedKey: CreateApiKeyResult | null;
  onClose: () => void;
}

export function RotateKeyDialog({ rotatedKey, onClose }: RotateKeyDialogProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!rotatedKey) return;
    await navigator.clipboard.writeText(rotatedKey.plainTextKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!rotatedKey} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-600 mb-2">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">
            {t("apikeys.rotate.successTitle") || "API Key Rotated Successfully"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("apikeys.rotate.successDesc") || "Please copy your new secret key now. It won't be shown again!"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 border rounded-lg p-3 bg-muted/30 font-mono text-xs overflow-x-auto select-all">
          <code className="flex-1 select-all break-all">{rotatedKey?.plainTextKey}</code>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">
            {t("common.done") || "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
