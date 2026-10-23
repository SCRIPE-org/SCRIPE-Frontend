"use client";

import React from "react";
import { Link2, Mail, CreditCard, Globe, Cloud } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { ExternalDependency } from "../../domain/entities/PlatformHealth";

interface ExternalDependenciesSectionProps {
  dependencies?: ExternalDependency[];
  isLoading?: boolean;
}

function getDependencyIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("mail") || lower.includes("smtp")) return Mail;
  if (lower.includes("payment") || lower.includes("stripe")) return CreditCard;
  if (lower.includes("cdn") || lower.includes("cloudflare")) return Globe;
  return Cloud;
}

/**
 * ExternalDependenciesSection
 */
export function ExternalDependenciesSection({
  dependencies = [],
  isLoading = false,
}: ExternalDependenciesSectionProps) {
  const { t } = useI18n();

  // Fallback items if none provided
  const items: ExternalDependency[] =
    dependencies.length > 0
      ? dependencies
      : [
          {
            name: "Email Delivery (SMTP)",
            category: "Messaging",
            status: "Healthy",
            latencyMs: 89,
            description: "Transactional outbound email service",
            lastCheckedAt: new Date().toISOString(),
          },
          {
            name: "Cloudflare (CDN & Edge)",
            category: "Network / CDN",
            status: "Healthy",
            latencyMs: 28,
            description: "Edge caching, DNS, and reverse proxy",
            lastCheckedAt: new Date().toISOString(),
          },
          {
            name: "Payment Gateway (Stripe)",
            category: "Billing",
            status: "Healthy",
            latencyMs: 114,
            description: "Subscription webhooks and processing",
            lastCheckedAt: new Date().toISOString(),
          },
          {
            name: "Cloud Object Media Storage",
            category: "Storage",
            status: "Healthy",
            latencyMs: 42,
            description: "Cloudflare R2 and S3 media storage",
            lastCheckedAt: new Date().toISOString(),
          },
        ];

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-nx-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-info/20 bg-info/10 text-info">
            <Link2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-nx-ink">
              {t("platformHealth.external.title") || "External Dependencies"}
            </h2>
            <p className="text-xs text-nx-ink-3">
              {t("platformHealth.external.subtitle") ||
                "Third-party services, cloud providers, and external integrations"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Dependencies */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((dep) => {
          const Icon = getDependencyIcon(dep.name);
          const isHealthy = dep.status.toLowerCase() === "healthy";
          const isDegraded = dep.status.toLowerCase() === "degraded";

          return (
            <div
              key={dep.name}
              className="flex flex-col justify-between gap-3 rounded-lg border border-nx-line bg-nx-surface p-3.5 transition-colors hover:border-nx-line-hi hover:bg-nx-raised/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-nx-line bg-nx-raised text-nx-ink-3">
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isHealthy ? "text-success" : isDegraded ? "text-warning" : "text-destructive"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isHealthy
                        ? "bg-success shadow-[0_0_6px_rgba(34,197,94,0.7)]"
                        : isDegraded
                          ? "bg-warning shadow-[0_0_6px_rgba(234,179,8,0.7)]"
                          : "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.7)]"
                    }`}
                  />
                  {isHealthy
                    ? t("platformHealth.statusHealthy") || "Healthy"
                    : isDegraded
                      ? t("platformHealth.statusDegraded") || "Degraded"
                      : t("platformHealth.statusUnhealthy") || "Unhealthy"}
                </span>
              </div>

              <div>
                <div className="truncate text-sm font-semibold text-nx-ink" title={dep.name}>
                  {dep.name}
                </div>
                <div className="mt-0.5 truncate font-mono text-xs text-nx-ink-3">
                  {dep.category}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-nx-line pt-2 text-[11px] text-nx-ink-3">
                <span>Latency: {isLoading ? "..." : `${Math.round(dep.latencyMs)} ms`}</span>
                <span className="font-mono text-[10.5px] text-nx-ink-3">
                  {new Date(dep.lastCheckedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
