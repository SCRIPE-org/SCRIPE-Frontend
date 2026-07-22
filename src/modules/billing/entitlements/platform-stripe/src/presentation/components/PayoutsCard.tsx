/**
 * PayoutsCard — Recent payouts list with status badges.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Landmark,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatStripeCurrency, formatDate } from "./utils";
import { PlatformPayout } from "../../domain/entities/PlatformStripeDashboard";

const payoutStatusConfig: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  paid: { variant: "default", icon: CheckCircle2 },
  pending: { variant: "secondary", icon: Clock },
  in_transit: { variant: "outline", icon: ArrowUpRight },
  canceled: { variant: "destructive", icon: XCircle },
  failed: { variant: "destructive", icon: AlertCircle },
};

interface PayoutsCardProps {
  payouts: PlatformPayout[];
  payoutsLink: string;
}

/**
 * Presentation UI component rendering the payouts card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PayoutsCard({ payouts, payoutsLink }: PayoutsCardProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#635bff]" />
            <CardTitle className="text-base">
              {t("entitlements.platformStripe.recentPayouts")}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => window.open(payoutsLink, "_blank")}
          >
            {t("entitlements.platformStripe.viewAll")} <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("entitlements.platformStripe.noPayouts")}
          </p>
        ) : (
          <div className="space-y-2">
            {payouts.map((po) => {
              const poStatus = payoutStatusConfig[po.status] ?? payoutStatusConfig.pending;
              const PoIcon = poStatus.icon;
              return (
                <div
                  key={po.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <Landmark className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={poStatus.variant} className="gap-1 px-1.5 py-0 text-[10px]">
                          <PoIcon className="h-3 w-3" />
                          {po.status}
                        </Badge>
                        {po.method && (
                          <span className="text-[10px] text-muted-foreground">{po.method}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {po.hasArrivalDate
                          ? `${t("entitlements.platformStripe.arrival")}: ${formatDate(po.arrivalDate)}`
                          : formatDate(po.created)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatStripeCurrency(po.amount, po.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
