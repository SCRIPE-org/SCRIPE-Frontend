"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Banknote, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { ConnectAccount } from "../../../domain/entities/ConnectAccount";

const STATUS_CONFIG = {
  Complete:   { icon: CheckCircle2,  color: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  Pending:    { icon: Clock,         color: "text-amber-500",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"   },
  Restricted: { icon: AlertTriangle, color: "text-red-500",     badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"           },
} as const;

interface PayoutsHeaderProps {
  account: ConnectAccount | null;
}

export function PayoutsHeader({ account }: PayoutsHeaderProps) {
  const { t } = useI18n();

  const status = account?.onboardingStatus ?? "Pending";
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Pending;
  const Icon = cfg.icon;

  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <Banknote className="h-6 w-6 text-primary" />
          {t("entitlements.stripeConnect.payoutsTitle") || "Payouts & Earnings"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("entitlements.stripeConnect.payoutsDesc") ||
            "Track your earnings, commission deductions, and net payouts from Stripe Connect."}
        </p>
      </div>
      {account && (
        <Badge className={cfg.badge}>
          <Icon className={`h-3.5 w-3.5 mr-1.5 ${cfg.color}`} />
          {t(`entitlements.stripeConnect.status.${status}`) || status}
        </Badge>
      )}
    </div>
  );
}
