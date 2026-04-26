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

const payoutStatusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
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

export function PayoutsCard({ payouts, payoutsLink }: PayoutsCardProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#635bff]" />
            <CardTitle className="text-base">{t("entitlements.platformStripe.recentPayouts")}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => window.open(payoutsLink, "_blank")}
          >
            {t("entitlements.platformStripe.viewAll")} <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("entitlements.platformStripe.noPayouts")}</p>
        ) : (
          <div className="space-y-2">
            {payouts.map((po) => {
              const poStatus = payoutStatusConfig[po.status] ?? payoutStatusConfig.pending;
              const PoIcon = poStatus.icon;
              return (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-violet-500/10">
                      <Landmark className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={poStatus.variant} className="text-[10px] px-1.5 py-0 gap-1">
                          <PoIcon className="h-3 w-3" />
                          {po.status}
                        </Badge>
                        {po.method && (
                          <span className="text-[10px] text-muted-foreground">{po.method}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
