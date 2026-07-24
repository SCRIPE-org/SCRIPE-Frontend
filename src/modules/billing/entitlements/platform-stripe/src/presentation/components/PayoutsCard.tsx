/**
 * PayoutsCard — Recent payouts list with status badges.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { DetailRow } from "@core/ui/detail-row";
import { SectionState } from "@core/ui/section-state";
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

// Status drives the chip's hue AND its glyph, so a payout that failed still
// reads as failed in greyscale. The label key is resolved at render because the
// dictionary is only available inside the component.
const PAYOUT_STATUS: Record<
  string,
  { variant: BadgeProps["variant"]; icon: React.ElementType; labelKey: string }
> = {
  paid: {
    variant: "success",
    icon: CheckCircle2,
    labelKey: "entitlements.platformStripe.payoutStatusPaid",
  },
  pending: {
    variant: "warning",
    icon: Clock,
    labelKey: "entitlements.platformStripe.payoutStatusPending",
  },
  in_transit: {
    variant: "info",
    icon: ArrowUpRight,
    labelKey: "entitlements.platformStripe.payoutStatusInTransit",
  },
  canceled: {
    variant: "destructive",
    icon: XCircle,
    labelKey: "entitlements.platformStripe.payoutStatusCanceled",
  },
  failed: {
    variant: "destructive",
    icon: AlertCircle,
    labelKey: "entitlements.platformStripe.payoutStatusFailed",
  },
};

const PAYOUT_METHOD_KEYS: Record<string, string> = {
  standard: "entitlements.platformStripe.payoutMethodStandard",
  instant: "entitlements.platformStripe.payoutMethodInstant",
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Landmark className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            <CardTitle className="text-base">
              {t("entitlements.platformStripe.recentPayouts")}
            </CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
            <a href={payoutsLink} target="_blank" rel="noopener noreferrer">
              {t("entitlements.platformStripe.viewAll")}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">{t("entitlements.platformStripe.opensInNewTab")}</span>
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          // The view gates the whole page on loading, so by the time this card
          // renders its data has already landed.
          isLoading={false}
          isEmpty={payouts.length === 0}
          emptyMessage={t("entitlements.platformStripe.noPayouts")}
          height={160}
        >
          <div className="space-y-2">
            {payouts.map((po) => {
              const status = PAYOUT_STATUS[po.status] ?? PAYOUT_STATUS.pending;
              const StatusIcon = status.icon;
              const methodKey = PAYOUT_METHOD_KEYS[po.method];
              return (
                <div
                  key={po.id}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Badge variant={status.variant}>
                        <StatusIcon className="h-3 w-3" aria-hidden="true" />
                        {t(status.labelKey)}
                      </Badge>
                      {po.method && (
                        <span className="truncate text-xs text-nx-ink-3">
                          {methodKey ? t(methodKey) : po.method}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-nx-ink">
                      {formatStripeCurrency(po.amount, po.currency)}
                    </span>
                  </div>

                  <DetailRow
                    className="mt-2"
                    label={
                      po.hasArrivalDate
                        ? t("entitlements.platformStripe.arrival")
                        : t("entitlements.platformStripe.created")
                    }
                    value={formatDate(po.hasArrivalDate ? po.arrivalDate : po.created)}
                  />
                </div>
              );
            })}
          </div>
        </SectionState>
      </CardContent>
    </Card>
  );
}
