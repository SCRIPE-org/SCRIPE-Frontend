/**
 * BillingCard — Pricing & Financial Information
 *
 * Shows amount, currency, promo code, discount, and refund details.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { DollarSign, Globe, Receipt, RotateCcw, Tag } from "lucide-react";
import { InfoRow } from "./InfoRow";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";

interface BillingCardProps {
  sub: SubscriptionListItem;
  t: (key: string) => string;
}

export function BillingCard({ sub, t }: BillingCardProps) {
  const formattedTotal = sub.totalAmount != null && sub.currency
    ? new Intl.NumberFormat("en-US", {
      style: "currency", currency: sub.currency, minimumFractionDigits: 2,
    }).format(sub.totalAmount)
    : null;

  const formattedBase = sub.baseAmount != null && sub.currency
    ? new Intl.NumberFormat("en-US", {
      style: "currency", currency: sub.currency, minimumFractionDigits: 2,
    }).format(sub.baseAmount)
    : null;

  const hasDiscount = sub.promotionDiscount != null && sub.promotionDiscount > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
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
              <span className="tabular-nums font-semibold">{formattedTotal}</span>
            ) : (
              <Badge variant="outline" className="text-[11px] text-emerald-600">Free</Badge>
            )
          }
        />
        <Separator />
        <InfoRow
          icon={<Globe className="h-3.5 w-3.5" />}
          label="Currency"
          value={
            sub.currency ? (
              <Badge variant="outline" className="text-[11px]">{sub.currency}</Badge>
            ) : "—"
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
                  <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
                    {sub.appliedPromoCode}
                  </Badge>
                  <span className="text-xs text-emerald-600 font-medium">
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
                  value={<span className="line-through text-muted-foreground tabular-nums">{formattedBase}</span>}
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
                <Badge variant={sub.refundType === "Full" ? "destructive" : "secondary"} className="text-[11px]">
                  {sub.refundType === "Full"
                    ? (t("entSubscriptions.fullRefund") || "Full Refund")
                    : (t("entSubscriptions.proRataRefund") || "Pro-Rata")}
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
                    <span className="tabular-nums text-destructive font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency", currency: sub.currency, minimumFractionDigits: 2,
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
