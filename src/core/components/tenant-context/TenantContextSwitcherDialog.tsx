"use client";

import React from "react";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContextSwitcher } from "@core/hooks/useTenantContextSwitcher";
import { TenantContextSwitcherList } from "./TenantContextSwitcherList";

export interface TenantContextSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Override destination path after switch (defaults to current pathname+search). */
  redirectTo?: string | null;
  /** Optional exit destination when exiting tenant context from within the dialog. */
  exitRedirectTo?: string | null;
  showExitToPlatform?: boolean;
}

/**
 * Reusable modal dialog housing the inline tenant context switcher.
 * Fetches candidates only while opened to avoid unnecessary startup requests.
 */
export function TenantContextSwitcherDialog({
  open,
  onOpenChange,
  redirectTo,
  exitRedirectTo,
  showExitToPlatform = true,
}: TenantContextSwitcherDialogProps): React.ReactElement {
  const { t, direction } = useI18n();
  const switcherState = useTenantContextSwitcher({ enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={direction} className="sm:max-w-lg" data-testid="tenant-switcher-dialog">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-control border border-info/30 bg-info/10 text-info">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle>{t("contextGates.switcher.dialogTitle")}</DialogTitle>
              <DialogDescription>{t("contextGates.switcher.dialogDescription")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <TenantContextSwitcherList
          switcherState={switcherState}
          redirectTo={redirectTo}
          exitRedirectTo={exitRedirectTo}
          showExitToPlatform={showExitToPlatform}
          onSwitched={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
