"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { RotateCw } from "lucide-react";

interface RotateKeyWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { reason: string; autoMigrate?: boolean }) => void;
  isLoading?: boolean;
}

/**
 * Documentation for RotateKeyWizardDialog
 */
export function RotateKeyWizardDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: RotateKeyWizardDialogProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [autoMigrate, setAutoMigrate] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm({ reason: reason.trim(), autoMigrate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <RotateCw className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t("customFieldsSecurity.rotateDialogTitle")}</DialogTitle>
                <DialogDescription className="pt-1 text-xs">
                  {t("customFieldsSecurity.rotateDialogDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rotate-reason">
                {t("customFieldsSecurity.rotateReasonLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rotate-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("customFieldsSecurity.rotateReasonPlaceholder")}
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="auto-migrate"
                checked={autoMigrate}
                onCheckedChange={(c) => setAutoMigrate(Boolean(c))}
              />
              <Label
                htmlFor="auto-migrate"
                className="cursor-pointer text-xs font-normal leading-tight"
              >
                {t("customFieldsSecurity.autoMigrateCheckbox")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("customFieldsSecurity.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !reason.trim()} className="gap-1.5">
              {isLoading ? "Rotating..." : t("customFieldsSecurity.confirmRotate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
