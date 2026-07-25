/**
 * AccountHeroCard — Account identity, capabilities, and support info.
 */
"use client";

import type { PlatformAccount } from "../../domain/entities/PlatformStripeDashboard";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { StripeMark } from "@core/ui/brand-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { DetailRow } from "@core/ui/detail-row";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Globe,
  Hash,
  Mail,
  Phone,
  XCircle,
} from "lucide-react";

interface AccountHeroCardProps {
  account: PlatformAccount;
}

/**
 * Presentation UI component rendering the account hero card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AccountHeroCard({ account }: AccountHeroCardProps) {
  const { t } = useI18n();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start gap-4">
            {/* The account belongs to Stripe, so the tile carries Stripe's own
                mark on a neutral step rather than the workspace accent. */}
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-raised"
              aria-hidden="true"
            >
              <StripeMark className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">
                {account.businessName || t("entitlements.platformStripe.stripeAccount")}
              </CardTitle>
              <CardDescription>{t("entitlements.platformStripe.description")}</CardDescription>
            </div>

            <div className="ms-auto flex flex-wrap items-center gap-2">
              <CapabilityBadge
                enabled={account.chargesEnabled}
                label={t("entitlements.platformStripe.charges")}
              />
              <CapabilityBadge
                enabled={account.payoutsEnabled}
                label={t("entitlements.platformStripe.payouts")}
              />
              <CapabilityBadge
                enabled={account.detailsSubmitted}
                label={t("entitlements.platformStripe.detailsSubmitted")}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow
              icon={Hash}
              label={t("entitlements.platformStripe.accountId")}
              value={account.accountId}
              mono
              copyable={account.accountId}
            />
            {account.email && (
              <DetailRow
                icon={Mail}
                label={t("entitlements.platformStripe.email")}
                value={account.email}
                copyable={account.email}
              />
            )}
            {account.country && (
              <DetailRow
                icon={Globe}
                label={t("entitlements.platformStripe.country")}
                value={account.country.toUpperCase()}
              />
            )}
            {account.defaultCurrency && (
              <DetailRow
                icon={DollarSign}
                label={t("entitlements.platformStripe.currency")}
                value={account.defaultCurrency.toUpperCase()}
              />
            )}
            {account.businessType && (
              <DetailRow
                icon={Building2}
                label={t("entitlements.platformStripe.businessType")}
                value={account.businessType}
              />
            )}
            {account.statementDescriptor && (
              <DetailRow
                icon={CreditCard}
                label={t("entitlements.platformStripe.statementDescriptor")}
                value={account.statementDescriptor}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {account.hasSupportInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("entitlements.platformStripe.supportInfo")}
            </CardTitle>
            <CardDescription>
              {t("entitlements.platformStripe.supportInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {account.supportEmail && (
                <DetailRow
                  icon={Mail}
                  label={t("entitlements.platformStripe.supportEmail")}
                  value={account.supportEmail}
                  copyable={account.supportEmail}
                />
              )}
              {account.supportPhone && (
                <DetailRow
                  icon={Phone}
                  label={t("entitlements.platformStripe.supportPhone")}
                  value={account.supportPhone}
                  copyable={account.supportPhone}
                />
              )}
              {account.supportUrl && (
                <DetailRow
                  icon={Globe}
                  label={t("entitlements.platformStripe.supportUrl")}
                  value={
                    <a
                      href={account.supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-nx-sm text-nx-accent underline-offset-4 hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none"
                    >
                      {account.supportUrl}
                      <span className="sr-only">
                        {t("entitlements.platformStripe.opensInNewTab")}
                      </span>
                    </a>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ── Private Subcomponents ──

function CapabilityBadge({ enabled, label }: { enabled: boolean; label: string }) {
  const { t } = useI18n();

  // Colour alone cannot carry "charges are off", so the state ships as text the
  // glyph merely echoes.
  return (
    <Badge variant={enabled ? "success" : "destructive"}>
      {enabled ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      ) : (
        <XCircle className="h-3 w-3" aria-hidden="true" />
      )}
      {label}
      <span className="sr-only">
        {enabled
          ? t("entitlements.platformStripe.enabled")
          : t("entitlements.platformStripe.disabled")}
      </span>
    </Badge>
  );
}
