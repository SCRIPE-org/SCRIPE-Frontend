"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { PageHeader } from "@core/ui/page-header";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Banknote, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { ConnectAccount } from "../../../domain/entities/ConnectAccount";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; variant: BadgeProps["variant"] }> =
  {
    Complete: { icon: CheckCircle2, variant: "success" },
    Pending: { icon: Clock, variant: "warning" },
    Restricted: { icon: AlertTriangle, variant: "destructive" },
  };

interface PayoutsHeaderProps {
  account: ConnectAccount | null;
}

/**
 * Presentation UI component rendering the payouts header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PayoutsHeader({ account }: PayoutsHeaderProps) {
  const { t } = useI18n();

  const status = account?.onboardingStatus ?? "Pending";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const Icon = cfg.icon;

  return (
    <PageHeader
      icon={Banknote}
      title={t("entitlements.stripeConnect.payoutsTitle")}
      description={t("entitlements.stripeConnect.payoutsDesc")}
      badges={
        account && (
          <Badge variant={cfg.variant}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {t(`entitlements.stripeConnect.status.${status}`)}
          </Badge>
        )
      }
    />
  );
}
