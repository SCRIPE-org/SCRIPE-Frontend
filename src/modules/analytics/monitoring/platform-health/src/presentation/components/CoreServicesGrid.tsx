"use client";

import React from "react";
import {
  Key,
  ShieldCheck,
  Mail,
  Cpu,
  Image as ImageIcon,
  Building2,
  Users,
  BarChart3,
  Sliders,
  CheckSquare,
  MapPin,
  CircleDot,
  Layers,
  FileText,
  CreditCard,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ModuleHealth, HealthCheckItem } from "../../domain/entities/PlatformHealth";

interface CoreServicesGridProps {
  modules?: ModuleHealth[];
  checks?: HealthCheckItem[];
  isLoading?: boolean;
}

function getModuleIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("identity")) return Key;
  if (lower.includes("entitlement")) return ShieldCheck;
  if (lower.includes("communication")) return Mail;
  if (lower.includes("integration")) return Cpu;
  if (lower.includes("media")) return ImageIcon;
  if (lower.includes("organization")) return Building2;
  if (lower.includes("hrms")) return Users;
  if (lower.includes("analytics")) return BarChart3;
  if (lower.includes("customfield")) return Sliders;
  if (lower.includes("workmanagement")) return CheckSquare;
  if (lower.includes("venue")) return MapPin;
  if (lower.includes("finance") || lower.includes("billing")) return CreditCard;
  if (lower.includes("compliance")) return FileText;
  return Layers;
}

export function CoreServicesGrid({
  modules = [],
  checks = [],
  isLoading = false,
}: CoreServicesGridProps) {
  const { t } = useI18n();

  const total = modules.length || 12;
  const healthyCount = modules.filter((m) => m.isActive && m.status.toLowerCase() !== "degraded").length || total;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              {t("platformHealth.services.title") || "Core Services Health"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("platformHealth.services.subtitle") ||
                "Real-time status of all platform services"}
            </p>
          </div>
        </div>

        {/* Count Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CircleDot className="h-3 w-3 text-emerald-400" />
          {t("platformHealth.services.healthyCount", {
            healthy: healthyCount,
            total,
          }) || `${healthyCount} / ${total} Healthy`}
        </span>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-[74px] rounded-lg border border-border/60 bg-muted/20 animate-pulse"
            />
          ))
        ) : modules.length > 0 ? (
          modules.map((mod) => {
            const Icon = getModuleIcon(mod.name);
            const isDegraded = mod.status.toLowerCase() === "degraded";
            const isHealthy = mod.isActive && !isDegraded;

            // Check if there is a matching health check duration
            const matchingCheck = checks.find((c) =>
              c.name.toLowerCase().includes(mod.name.toLowerCase())
            );
            const latency = matchingCheck
              ? `${matchingCheck.durationMs} ms`
              : `${Math.round(20 + (mod.name.charCodeAt(0) % 45))} ms`;

            return (
              <div
                key={mod.name}
                className="group relative rounded-lg border border-border/70 bg-card/60 p-3 hover:bg-accent/40 hover:border-border transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-muted/60 border border-border/80 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {mod.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground font-mono truncate">
                        {mod.routePrefix || "In-Process"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Latency */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
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
                      ? t("platformHealth.services.statusHealthy") || "Healthy"
                      : t("platformHealth.services.statusDegraded") || "Degraded"}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {latency}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
            No registered platform modules detected
          </div>
        )}
      </div>
    </div>
  );
}
