"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
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
    <Dialog
      open={!!rotatedKey}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-warning/15 text-warning">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">
            {t("apikeys.rotate.successTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("apikeys.rotate.successDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex select-all items-center gap-2 overflow-x-auto rounded-nx-md border border-nx-line bg-nx-raised p-3 font-mono text-xs">
          <code className="flex-1 select-all break-all">{rotatedKey?.plainTextKey}</code>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink motion-reduce:transition-none"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">
            {t("common.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
