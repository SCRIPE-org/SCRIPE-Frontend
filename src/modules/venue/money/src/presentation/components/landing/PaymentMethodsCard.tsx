"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneyPaymentMethodItem } from "../../../domain/entities/Money";
import { formatMoney, getPaymentMethodLocaleKey } from "./moneyLandingFormatters";

interface PaymentMethodsCardProps {
  paymentMethods: MoneyPaymentMethodItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Breakdown of recorded operational payment methods.
 */
export function PaymentMethodsCard({
  paymentMethods,
  totalCount,
  loading,
  error,
}: PaymentMethodsCardProps) {
  const { t, language } = useI18n();

  return (
    <Card>
      <CardHeader className="border-b border-nx-line px-4 py-3">
        <CardTitle className="flex items-center justify-between text-xs font-bold text-nx-ink">
          <span>{t("money.landing.paymentMethods.title")}</span>
          <span className="font-mono text-[11px] font-normal text-nx-ink-3">
            {t("money.landing.paymentMethods.totalPayments", { count: totalCount })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <LoadingSpinner showText={false} />
          </div>
        ) : error ? (
          <div className="py-4 text-center text-xs text-nx-ink-3">{error}</div>
        ) : paymentMethods.length === 0 ? (
          <div className="py-6 text-center text-xs italic text-nx-ink-3">
            {t("money.landing.paymentMethods.noPayments")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {paymentMethods.map((m) => {
              const methodKey = getPaymentMethodLocaleKey(m.method);
              const methodLabel = methodKey ? t(methodKey) : m.method;
              return (
                <div
                  key={m.method}
                  className="space-y-1.5 rounded-nx-md border border-nx-line bg-nx-raised p-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-nx-ink">{methodLabel}</span>
                    <span className="font-mono text-[10px] text-nx-ink-3">{m.percentage}%</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-nx-ink">
                    {formatMoney(m.amount, m.currencyCode, language)}
                  </p>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-nx-raised-2">
                    <div
                      className="h-1 rounded-full bg-nx-accent-fill"
                      style={{ width: `${Math.min(m.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-nx-ink-3">
                    {t("money.landing.transactionsCount", { count: m.count })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
