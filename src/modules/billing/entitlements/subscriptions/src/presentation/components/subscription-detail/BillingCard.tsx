/**
 * BillingCard — Pricing & Financial Information
 *
 * Shows amount, currency, promo code, discount, and refund details.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { DetailRow } from "@core/ui/detail-row";
import { StripeMark } from "@core/ui/brand-icons";
import { DollarSign, Globe, Receipt, RotateCcw, Tag, CreditCard, Wallet } from "lucide-react";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";

interface BillingCardProps {
  sub: SubscriptionListItem;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the billing card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BillingCard({ sub, t }: BillingCardProps) {
  const formattedTotal =
    sub.totalAmount != null && sub.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: sub.currency,
          minimumFractionDigits: 2,
        }).format(sub.totalAmount)
      : null;

  const formattedBase =
    sub.baseAmount != null && sub.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: sub.currency,
          minimumFractionDigits: 2,
        }).format(sub.baseAmount)
      : null;

  const hasDiscount = sub.promotionDiscount != null && sub.promotionDiscount > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-success/10">
            <Receipt className="h-4 w-4 text-success" aria-hidden="true" />
          </div>
          <CardTitle className="text-sm font-semibold">{t("entSubscriptions.billing")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <DetailRow
          icon={DollarSign}
          label={t("entSubscriptions.amount")}
          value={
            formattedTotal ? (
              <span className="font-semibold">{formattedTotal}</span>
            ) : (
              <Badge variant="outline" className="text-[11px] text-success">
                {t("entSubscriptions.free")}
              </Badge>
            )
          }
        />
        <Separator />
        <DetailRow
          icon={Globe}
          label={t("entSubscriptions.currency")}
          value={
            sub.currency ? (
              <Badge variant="outline" className="text-[11px]">
                {sub.currency}
              </Badge>
            ) : (
              "—"
            )
          }
        />
        <Separator />
        <DetailRow
          icon={CreditCard}
          label={t("entSubscriptions.gateway")}
          value={
            sub.paymentGateway ? (
              <span className="inline-flex items-center gap-1.5">
                {sub.paymentGateway === "Stripe" ? (
                  <StripeMark className="h-4 w-4" />
                ) : (
                  <Wallet className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                )}
                <span className="text-sm font-medium text-nx-ink">{sub.paymentGateway}</span>
              </span>
            ) : (
              "—"
            )
          }
        />
        {hasDiscount && (
          <>
            <Separator />
            <DetailRow
              icon={Tag}
              label={t("entitlements.promotions.promoCode")}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] text-[11px] text-nx-accent"
                  >
                    {sub.appliedPromoCode}
                  </Badge>
                  <span className="text-xs font-medium text-success">
                    -{sub.promotionDiscount}%
                  </span>
                </span>
              }
            />
            {formattedBase && (
              <>
                <Separator />
                <DetailRow
                  icon={DollarSign}
                  label={t("entSubscriptions.originalPrice")}
                  value={<span className="line-through">{formattedBase}</span>}
                  valueClassName="text-nx-ink-2"
                />
              </>
            )}
          </>
        )}
        {/* Refund info */}
        {sub.refundType && sub.refundType !== "None" && (
          <>
            <Separator />
            <DetailRow
              icon={RotateCcw}
              label={t("entSubscriptions.refundType")}
              value={
                <Badge
                  variant={sub.refundType === "Full" ? "destructive" : "secondary"}
                  className="text-[11px]"
                >
                  {sub.refundType === "Full"
                    ? t("entSubscriptions.fullRefund")
                    : t("entSubscriptions.proRataRefund")}
                </Badge>
              }
            />
            {sub.refundAmount != null && sub.refundAmount > 0 && sub.currency && (
              <>
                <Separator />
                <DetailRow
                  icon={DollarSign}
                  label={t("entSubscriptions.refundAmount")}
                  value={
                    <span className="text-destructive">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: sub.currency,
                        minimumFractionDigits: 2,
                      }).format(sub.refundAmount)}
                    </span>
                  }
                />
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
