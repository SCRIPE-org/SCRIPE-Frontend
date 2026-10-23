"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { SectionState } from "@core/ui/section-state";
import {
  AlertTriangle,
  Lock,
  ShieldAlert,
  UserX,
  KeyRound,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { SecurityAttentionSignal } from "../../domain/entities/SecurityEntities";

interface SecurityAttentionPanelProps {
  signals: SecurityAttentionSignal[];
  isLoading: boolean;
  onRetry?: () => void;
  cardClasses?: string;
  onSelectSignal?: (signal: SecurityAttentionSignal) => void;
}

const SEVERITY_CONFIG: Record<
  string,
  {
    icon: typeof AlertTriangle;
    badgeVariant: "destructive" | "warning" | "secondary" | "outline";
    colorClass: string;
    bgClass: string;
  }
> = {
  critical: {
    icon: ShieldAlert,
    badgeVariant: "destructive",
    colorClass: "text-destructive",
    bgClass: "border border-destructive/20 bg-destructive/10",
  },
  high: {
    icon: Lock,
    badgeVariant: "destructive",
    colorClass: "text-warning",
    bgClass: "border border-warning/20 bg-warning/10",
  },
  medium: {
    icon: AlertTriangle,
    badgeVariant: "warning",
    colorClass: "text-warning",
    bgClass: "border border-warning/20 bg-warning/10",
  },
  low: {
    icon: UserX,
    badgeVariant: "secondary",
    colorClass: "text-info",
    bgClass: "border border-info/20 bg-info/10",
  },
  info: {
    icon: KeyRound,
    badgeVariant: "outline",
    colorClass: "text-nx-ink-3",
    bgClass: "border border-nx-line bg-nx-raised",
  },
};

/**
 * SecurityAttentionPanel
 */
export const SecurityAttentionPanel = memo(function SecurityAttentionPanel({
  signals,
  isLoading,
  onRetry,
  cardClasses,
  onSelectSignal,
}: SecurityAttentionPanelProps) {
  const { t } = useI18n();

  return (
    <Card className={`flex h-full flex-col border-nx-line bg-nx-surface text-nx-ink ${cardClasses || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-warning/20 bg-warning/10 p-1.5 text-warning">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-nx-ink">
                {t("security.attention.title") || "Security Attention & Signals"}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-3">
                {t("security.attention.description") ||
                  "Authoritative security signals and anomalies requiring administrator review"}
              </CardDescription>
            </div>
          </div>

          <Link
            href="/audit"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>{t("security.attention.viewAll") || "View All in Audit"}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <SectionState
          isLoading={isLoading}
          onRetry={onRetry}
          isEmpty={signals.length === 0}
          emptyMessage={
            t("security.attention.noSignals") ||
            "No security signals currently require administrator attention."
          }
          emptyIcon={<CheckCircle2 className="h-8 w-8 text-success" />}
          skeletonType="rows"
          skeletonRows={4}
          height={260}
        >
          <div className="max-h-[280px] space-y-2.5 overflow-y-auto pe-1">
            {signals.map((sig, idx) => {
              const config = SEVERITY_CONFIG[sig.severity] ?? SEVERITY_CONFIG.medium;
              const Icon = config.icon;
              const sigKey = sig.id && sig.id.trim() !== "" ? sig.id : `sig-${sig.type}-${idx}`;

              return (
                <div
                  key={sigKey}
                  onClick={() => onSelectSignal?.(sig)}
                  className={`group flex items-start gap-3 rounded-lg border border-nx-line bg-nx-raised/40 p-2.5 transition-colors ${
                    onSelectSignal
                      ? "cursor-pointer hover:border-nx-line-hi hover:bg-nx-raised/60"
                      : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 shrink-0 rounded-md p-1.5 ${config.bgClass} ${config.colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-nx-ink">{sig.title}</p>
                      <Badge
                        variant={config.badgeVariant}
                        className="shrink-0 px-1.5 py-0 text-[10px] font-bold uppercase"
                      >
                        {sig.severity}
                      </Badge>
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-xs text-nx-ink-2">
                      {sig.description}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-nx-ink-3">
                      {sig.ipAddress && (
                        <span className="font-mono" dir="ltr">
                          IP: {sig.ipAddress}
                        </span>
                      )}
                      {sig.actor && <span>Actor: {sig.actor}</span>}
                      <span className="tabular-nums">{formatDateTimeUtc(sig.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionState>
      </CardContent>
    </Card>
  );
});
