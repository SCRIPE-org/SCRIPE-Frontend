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

/**
 * Presentation UI component rendering the empty state.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EmptyState({ vm, t }: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-border/60">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">
          {t("entSubscriptions.noSubscriptions") || "No Active Subscription"}
        </h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {t("entSubscriptions.assignDesc") || "Assign a subscription plan to get started."}
        </p>
        <Button
          size="lg"
          className="cursor-pointer gap-2"
          onClick={() => vm.setShowAssignDialog(true)}
        >
          <Zap className="h-5 w-5" />
          {t("entSubscriptions.assign") || "Assign Edition"}
        </Button>
      </CardContent>
    </Card>
  );
}
