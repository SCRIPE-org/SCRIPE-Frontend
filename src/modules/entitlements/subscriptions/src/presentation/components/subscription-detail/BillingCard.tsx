/**
 * BillingCard — Pricing & Financial Information
 *
 * Shows amount, currency, promo code, discount, and refund details.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { DollarSign, Globe, Receipt, RotateCcw, Tag, CreditCard, Wallet } from "lucide-react";
import { InfoRow } from "./InfoRow";
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
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Receipt className="h-4 w-4 text-emerald-500" />
          </div>
          <CardTitle className="text-sm font-semibold">Billing</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label={t("entSubscriptions.amount") || "Amount"}
          value={
            formattedTotal ? (
              <span className="font-semibold tabular-nums">{formattedTotal}</span>
            ) : (
              <Badge variant="outline" className="text-[11px] text-emerald-600">
                Free
              </Badge>
            )
          }
        />
        <Separator />
        <InfoRow
          icon={<Globe className="h-3.5 w-3.5" />}
          label="Currency"
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
        <InfoRow
          icon={<CreditCard className="h-3.5 w-3.5" />}
          label="Gateway"
          value={
            sub.paymentGateway ? (
              <div className="flex items-center gap-1.5">
                {sub.paymentGateway === "Stripe" && (
                  <CreditCard className="h-4 w-4 text-[#635bff]" />
                )}
                {sub.paymentGateway === "PayPal" && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#003087]">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.2.728-4.616.047-.256a.925.925 0 0 1 .915-.788h.578c3.737 0 6.662-1.518 7.518-5.907.357-1.832.173-3.361-.769-4.436a3.713 3.713 0 0 0-.35-.292z" />
                  </svg>
                )}
                {sub.paymentGateway === "Paymob" && <Wallet className="h-4 w-4 text-[#00B2FF]" />}
                {sub.paymentGateway === "Manual" && <span className="text-lg">✋</span>}
                <span className="text-sm font-medium">{sub.paymentGateway}</span>
              </div>
            ) : (
              "—"
            )
          }
        />
        {hasDiscount && (
          <>
            <Separator />
            <InfoRow
              icon={<Tag className="h-3.5 w-3.5" />}
              label={t("entitlements.promotions.promoCode") || "Promo Code"}
              value={
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="border-primary/30 text-[11px] text-primary">
                    {sub.appliedPromoCode}
                  </Badge>
                  <span className="text-xs font-medium text-emerald-600">
                    -{sub.promotionDiscount}%
                  </span>
                </div>
              }
            />
            {formattedBase && (
              <>
                <Separator />
                <InfoRow
                  icon={<DollarSign className="h-3.5 w-3.5" />}
                  label="Original Price"
                  value={
                    <span className="tabular-nums text-muted-foreground line-through">
                      {formattedBase}
                    </span>
                  }
                  muted
                />
              </>
            )}
          </>
        )}
        {/* Refund info */}
        {sub.refundType && sub.refundType !== "None" && (
          <>
            <Separator />
            <InfoRow
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label={t("entSubscriptions.refundType") || "Refund"}
              value={
                <Badge
                  variant={sub.refundType === "Full" ? "destructive" : "secondary"}
                  className="text-[11px]"
                >
                  {sub.refundType === "Full"
                    ? t("entSubscriptions.fullRefund") || "Full Refund"
                    : t("entSubscriptions.proRataRefund") || "Pro-Rata"}
                </Badge>
              }
            />
            {sub.refundAmount != null && sub.refundAmount > 0 && sub.currency && (
              <>
                <Separator />
                <InfoRow
                  icon={<DollarSign className="h-3.5 w-3.5" />}
                  label="Refund Amount"
                  value={
                    <span className="font-medium tabular-nums text-destructive">
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
