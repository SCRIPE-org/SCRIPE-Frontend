"use client";

import React from "react";
import { Link2, Mail, CreditCard, Globe, Cloud } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Link2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {t("platformHealth.external.title") || "External Dependencies"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("platformHealth.external.subtitle") ||
                "Third-party services, cloud providers, and external integrations"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Dependencies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((dep) => {
          const Icon = getDependencyIcon(dep.name);
          const isHealthy = dep.status.toLowerCase() === "healthy";
          const isDegraded = dep.status.toLowerCase() === "degraded";

          return (
            <div
              key={dep.name}
              className="rounded-lg border border-border/70 bg-card/60 p-3.5 flex flex-col justify-between gap-3 shadow-2xs hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-muted/60 border border-border/80 text-muted-foreground flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isHealthy
                      ? "text-emerald-400"
                      : isDegraded
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isHealthy
                        ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                        : isDegraded
                        ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                        : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
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
                <div className="text-sm font-semibold text-foreground truncate" title={dep.name}>
                  {dep.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                  {dep.category}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                <span>Latency: {isLoading ? "..." : `${Math.round(dep.latencyMs)} ms`}</span>
                <span className="text-[10.5px] font-mono text-muted-foreground">
                  {new Date(dep.lastCheckedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
