"use client";

import { Dialog, DialogContent } from "@core/ui/dialog";
import { GatewaySelectionStep, usePaymentGatewaysViewModel } from "@modules/entitlements/core";
import { Loader2 } from "lucide-react";

interface GatewaySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gateway: string) => void;
}

export function GatewaySelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: GatewaySelectionDialogProps) {
  const { gateways, isLoading } = usePaymentGatewaysViewModel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 bg-transparent p-0 shadow-none">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg bg-card p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GatewaySelectionStep
            gateways={gateways.filter((g) => g.enabled && g.gateway !== "Manual")}
            onSelect={onSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
