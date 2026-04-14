/**
 * EmptyState — No Subscription CTA
 *
 * Premium empty state shown when tenant has no active subscription.
 * Features a centered CTA to assign an edition.
 */
"use client";

import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Package, Zap } from "lucide-react";
import type { useSubscriptionsViewModel } from "../../viewmodels/useSubscriptionsViewModel";

interface EmptyStateProps {
  vm: ReturnType<typeof useSubscriptionsViewModel>;
  t: (key: string) => string;
}

export function EmptyState({ vm, t }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-border/60">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {t("entSubscriptions.noSubscriptions") || "No Active Subscription"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {t("entSubscriptions.assignDesc") || "Assign a subscription plan to get started."}
        </p>
        <Button
          size="lg"
          className="gap-2 cursor-pointer"
          onClick={() => vm.setShowAssignDialog(true)}
        >
          <Zap className="h-5 w-5" />
          {t("entSubscriptions.assign") || "Assign Edition"}
        </Button>
      </CardContent>
    </Card>
  );
}
