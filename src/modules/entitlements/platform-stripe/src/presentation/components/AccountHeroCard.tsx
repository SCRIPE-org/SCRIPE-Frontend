/**
 * AccountHeroCard — Account identity, capabilities, and support info.
 */
"use client";

import type { PlatformAccount } from "../../domain/entities/PlatformStripeDashboard";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import {
  Building2,
  Mail,
  Globe,
  DollarSign,
  CreditCard,
  CheckCircle2,
  XCircle,
  Phone,
} from "lucide-react";

interface AccountHeroCardProps {
  account: PlatformAccount;
}

export function AccountHeroCard({ account }: AccountHeroCardProps) {
  const { t } = useI18n();

  return (
    <>
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#635bff]/5 to-[#635bff]/10" />
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#635bff] to-[#80e9ff]" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left: Identity */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-[#635bff] to-[#80e9ff] p-3 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{account.displayName}</h2>
                  <p className="font-mono text-sm text-muted-foreground">{account.accountId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {account.email && (
                  <InfoChip
                    icon={Mail}
                    label={t("entitlements.platformStripe.email")}
                    value={account.email}
                  />
                )}
                {account.country && (
                  <InfoChip
                    icon={Globe}
                    label={t("entitlements.platformStripe.country")}
                    value={account.country.toUpperCase()}
                  />
                )}
                {account.defaultCurrency && (
                  <InfoChip
                    icon={DollarSign}
                    label={t("entitlements.platformStripe.currency")}
                    value={account.defaultCurrency.toUpperCase()}
                  />
                )}
                {account.businessType && (
                  <InfoChip
                    icon={Building2}
                    label={t("entitlements.platformStripe.businessType")}
                    value={account.businessType}
                  />
                )}
                {account.statementDescriptor && (
                  <InfoChip
                    icon={CreditCard}
                    label={t("entitlements.platformStripe.statementDescriptor")}
                    value={account.statementDescriptor}
                  />
                )}
              </div>
            </div>

            {/* Right: Capabilities */}
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:justify-center">
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
        </CardContent>
      </Card>

      {/* Support Info */}
      {account.hasSupportInfo && (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-wrap gap-4 p-4 text-sm text-muted-foreground">
            {account.supportEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {account.supportEmail}
              </span>
            )}
            {account.supportPhone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {account.supportPhone}
              </span>
            )}
            {account.supportUrl && (
              <a
                href={account.supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5" /> {account.supportUrl}
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ── Private Subcomponents ──

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-2 text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] leading-none text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}

function CapabilityBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        enabled
          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
          : "border border-red-500/20 bg-red-500/10 text-red-500"
      }`}
    >
      {enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </div>
  );
}
