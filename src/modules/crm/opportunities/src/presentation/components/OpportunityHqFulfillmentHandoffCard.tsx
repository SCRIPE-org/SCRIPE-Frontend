"use client";

import { usePermission } from "@core/hooks/use-permission";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { CRM_PERMISSIONS } from "@modules/crm/shared";
import { CheckCircle2, Rocket } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

/** HQ fulfillment handoff trigger card gated by `CRM_PERMISSIONS.OPPORTUNITIES_UPDATE`. */
export function OpportunityHqFulfillmentHandoffCard({
  t,
  opp,
  fulfillmentRequested,
  isRequestingFulfillment,
  onRequestFulfillmentHandoff,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  opp: CrmOpportunity;
  fulfillmentRequested: boolean;
  isRequestingFulfillment: boolean;
  onRequestFulfillmentHandoff: () => void;
}) {
  const canRequestFulfillment = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_UPDATE);

  return (
    <Card
      data-testid="hq-fulfillment-handoff-card"
      className="p-5 border-nx-line bg-nx-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-nx-accent" />
          <h3 className="text-sm font-bold text-nx-ink">{t("crmOpportunities.detail.hqHandoffTitle")}</h3>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-mono",
              fulfillmentRequested || opp.status === "Won"
                ? "border-success/40 bg-success/10 text-success"
                : "border-nx-line bg-nx-raised text-nx-ink-2",
            )}
          >
            {fulfillmentRequested
              ? t("crmOpportunities.detail.fulfillmentDispatched")
              : opp.status === "Won"
                ? opp.hqOutcomeKind || t("crmOpportunities.detail.readyForProvisioning")
                : t("crmOpportunities.detail.awaitingClosureHandoff")}
          </Badge>
        </div>
        <p className="text-xs text-nx-ink-2">{t("crmOpportunities.detail.hqHandoffDescription")}</p>
      </div>
      {canRequestFulfillment && (
        <div className="shrink-0">
          <Button
            type="button"
            variant={fulfillmentRequested ? "outline" : "default"}
            size="sm"
            data-testid="request-fulfillment-btn"
            disabled={isRequestingFulfillment || fulfillmentRequested}
            onClick={onRequestFulfillmentHandoff}
            className="h-8 text-xs font-bold gap-1.5"
          >
            {fulfillmentRequested ? (
              <>
                <CheckCircle2 className="size-3.5 text-success" />
                <span>{t("crmOpportunities.detail.handoffLoggedBtn")}</span>
              </>
            ) : (
              <>
                <Rocket className="size-3.5" />
                <span>
                  {isRequestingFulfillment
                    ? t("crmOpportunities.detail.dispatchingBtn")
                    : t("crmOpportunities.detail.requestHqHandoffBtn")}
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
