"use client";

import { Dialog, DialogContent } from "@core/ui/dialog";
import { GatewaySelectionStep } from "@modules/entitlements/user-subscriptions/src/presentation/components/GatewaySelectionStep";
import { usePaymentGatewaysViewModel } from "@modules/entitlements/payment-gateways/src/presentation/viewmodels/usePaymentGatewaysViewModel";
import { Loader2 } from "lucide-react";

interface GatewaySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gateway: string) => void;
}

export function GatewaySelectionDialog({ open, onOpenChange, onSelect }: GatewaySelectionDialogProps) {
  const { gateways, isLoading } = usePaymentGatewaysViewModel();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-transparent border-0 shadow-none p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8 bg-card rounded-lg h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GatewaySelectionStep 
            gateways={gateways.filter(g => g.enabled && g.gateway !== "Manual")} 
            onSelect={onSelect} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
