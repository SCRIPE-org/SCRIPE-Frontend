/**
 * HeroCard — Subscription Status Hero
 *
 * Large card at the top showing status, edition, date range, pricing.
 * Features gradient overlay matched to subscription status color.
 */
"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn, formatUtc } from "@core/common/utils";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { CalendarDays, Crown, DollarSign, Infinity, Tag, Timer } from "lucide-react";
import { STATUS_VARIANTS, TYPE_VARIANTS, TYPE_KEY_MAP, STATUS_KEY_MAP } from "../../constants";
import { STATUS_STYLES, DEFAULT_STATUS_STYLE } from "./status-styles";
import { HeroActions } from "./HeroActions";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";
import type { useSubscriptionsViewModel } from "../../viewmodels/useSubscriptionsViewModel";

interface HeroCardProps {
  sub: SubscriptionListItem;
  vm: ReturnType<typeof useSubscriptionsViewModel>;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the hero card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function HeroCard({ sub, vm, t }: HeroCardProps) {
  const style = STATUS_STYLES[sub.status] ?? DEFAULT_STATUS_STYLE;

  const formattedAmount = useMemo(() => {
    if (!sub.totalAmount || !sub.currency) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: sub.currency,
      minimumFractionDigits: 2,
    }).format(sub.totalAmount);
  }, [sub.totalAmount, sub.currency]);

  const billingCycle = useMemo(() => {
    const typeKey = TYPE_KEY_MAP[sub.type] ?? sub.type;
    return t(`entSubscriptions.${typeKey}`) || sub.type;
  }, [sub.type, t]);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/50 transition-shadow duration-300",
        `shadow-lg ${style.glow}`
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", style.gradient)}
      />

      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between gap-4">
          {/* Status + Edition */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", style.dotColor)} />
                {style.icon}
              </div>
              <Badge
                variant={STATUS_VARIANTS[sub.status] ?? "outline"}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                {t(`entSubscriptions.${STATUS_KEY_MAP[sub.status] ?? sub.status}`) || sub.status}
              </Badge>
              <Badge
                variant={
                  (TYPE_VARIANTS as Record<string, "default" | "secondary" | "outline">)[
                    sub.type
                  ] ?? "outline"
                }
                className="text-xs"
              >
                {billingCycle}
              </Badge>
            </div>

            <div className="flex items-center gap-2.5">
              <Crown className="h-6 w-6 shrink-0 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">{sub.editionName}</h2>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <HeroActions sub={sub} vm={vm} t={t} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {sub.startDate ? formatUtc(sub.startDate, "MMM d, yyyy") : "—"}
              {" → "}
              {sub.endDate ? (
                formatUtc(sub.endDate, "MMM d, yyyy")
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Infinity className="h-3.5 w-3.5" />
                  <span>{t("entSubscriptions.lifetime")}</span>
                </span>
              )}
            </span>
          </div>

          {/* Time remaining */}
          {sub.endDate && new Date(sub.endDate) > new Date() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(sub.endDate))} remaining</span>
            </div>
          )}

          {/* Amount */}
          {formattedAmount && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold tabular-nums">{formattedAmount}</span>
              <span className="text-xs text-muted-foreground">/ {billingCycle.toLowerCase()}</span>
            </div>
          )}

          {/* Promo */}
          {sub.appliedPromoCode && (
            <Badge variant="outline" className="border-primary/30 text-xs text-primary">
              <Tag className="me-1 h-3 w-3" />
              {sub.appliedPromoCode}
              {sub.promotionDiscount != null && sub.promotionDiscount > 0 && (
                <span className="ms-1 text-success">-{sub.promotionDiscount}%</span>
              )}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
