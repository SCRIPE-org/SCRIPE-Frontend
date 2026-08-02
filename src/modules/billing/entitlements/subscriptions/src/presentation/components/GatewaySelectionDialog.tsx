"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogTitle } from "@core/ui/dialog";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { GatewaySelectionStep, usePaymentGatewaysViewModel } from "@modules/entitlements/core";

interface GatewaySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gateway: string) => void;
}

/**
 * Presentation UI component rendering the gateway selection dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function GatewaySelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: GatewaySelectionDialogProps) {
  const { t } = useI18n();
  const { gateways, isLoading } = usePaymentGatewaysViewModel();

  // Guards the window between the first click and the dialog actually
  // unmounting: the caller flips `open` to false synchronously from inside
  // `onSelect`, but the DOM removal still waits for the next render, so a
  // fast double-click on two different gateway buttons could otherwise fire
  // two checkout-session requests before either button ever visually
  // disabled. Resets whenever the dialog is (re)opened.
  //
  // Adjusted during render (not an effect): resetting from an effect means
  // React commits the stale `isSelecting` for one frame before the effect
  // fires and schedules a second render to clear it. Tracking the previous
  // `open` value lets the reset happen in the same render pass instead.
  const [isSelecting, setIsSelecting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsSelecting(false);
  }

  const handleSelect = useCallback(
    (gateway: string) => {
      if (isSelecting) return;
      setIsSelecting(true);
      onSelect(gateway);
    },
    [isSelecting, onSelect]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 bg-transparent p-0 shadow-none">
        {/* GatewaySelectionStep renders its own visible heading inside its
            Card — this title exists only so the dialog has an accessible
            name at all; it previously had none. */}
        <DialogTitle className="sr-only">{t("billing.dialogs.selectGateway")}</DialogTitle>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center rounded-nx-lg border border-nx-line bg-nx-surface p-8">
            <LoadingSpinner showText={false} />
          </div>
        ) : (
          <div className="relative">
            <GatewaySelectionStep
              gateways={gateways.filter((g) => g.enabled && g.gateway !== "Manual")}
              onSelect={handleSelect}
            />
            {/* GatewaySelectionStep's buttons live in another package and
                cannot take a `disabled`/`loading` prop from here, so the
                double-click guard above is paired with this overlay: it
                blocks further pointer interaction and gives the same visual
                feedback a per-button loading state would. */}
            {isSelecting && (
              <div className="absolute inset-0 flex items-center justify-center rounded-nx-lg bg-scrim">
                <LoadingSpinner showText={false} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
