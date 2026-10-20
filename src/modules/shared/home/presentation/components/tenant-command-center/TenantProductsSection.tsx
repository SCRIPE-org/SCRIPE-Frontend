"use client";

import React from "react";
import { Layers, ChevronRight, Building, GraduationCap, Trophy } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspaceActions } from "@core/providers/hooks/useWorkspaceActions";
import { usePermissions } from "@core/providers/permission-provider";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { TenantProductItem } from "./tenantTypes";

interface TenantProductsSectionProps {
  products: TenantProductItem[];
}

const PRODUCT_THEMES: Record<string, { color: string; icon: React.ElementType }> = {
  venue: {
    color: "#10b981",
    icon: Building,
  },
  academy: {
    color: "#0ea5e9",
    icon: GraduationCap,
  },
  "football-intelligence": {
    color: "#f59e0b",
    icon: Trophy,
  },
};

export function TenantProductsSection({ products }: TenantProductsSectionProps) {
  const { t } = useI18n();
  const { setActiveWorkspace } = useWorkspaceActions();
  const { canAccessPage } = usePermissions();

  return (
    <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-4 text-nx-ink hover:border-nx-line-hi sm:p-5">
      {/* Section Header */}
      <div className="mb-3.5 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--nx-accent) 12%, transparent)",
              color: "var(--nx-accent)",
            }}
          >
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-nx-ink">
              {t("tenantCommandCenter.products.title") || "Your SCRIPE Products"}
            </h3>
            <p className="truncate text-xs text-nx-ink-3">
              {t("tenantCommandCenter.products.subtitle") ||
                "Manage and access the operational products enabled for your organization."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-nx-accent hover:underline"
        >
          <span>{t("tenantCommandCenter.products.manageProducts") || "Manage Products"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>

      {/* 3 Product Cards Container Grid */}
      <div className="products-container-grid">
        {products.map((product) => {
          const isActive = product.status === "active";
          const theme = PRODUCT_THEMES[product.id] || {
            color: "var(--nx-accent)",
            icon: Layers,
          };
          const IconComponent = theme.icon;

          return (
            <div
              key={product.id}
              className="hover:bg-nx-raised/40 group relative flex flex-col justify-between overflow-hidden rounded-nx-md border border-nx-line bg-nx-surface transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-line-hi"
            >
              {/* Card Visual Header matching Nexus Workspace & App Launcher Cards */}
              <div className="bg-nx-raised/30 relative flex items-center justify-between border-b border-nx-line px-4 py-3.5">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-md transition-transform duration-nx-micro group-hover:scale-105"
                  style={{
                    background: `color-mix(in oklch, ${theme.color} 12%, transparent)`,
                    color: theme.color,
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={`px-2 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border border-nx-line bg-nx-raised text-nx-ink-3"
                  }`}
                >
                  {isActive
                    ? t("tenantCommandCenter.products.active") || "Active"
                    : t("tenantCommandCenter.products.notActivated") || "Not Activated"}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h4 className="text-sm font-semibold text-nx-ink transition-colors group-hover:text-nx-accent">
                    {product.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-nx-ink-3">
                    {product.description}
                  </p>

                  <div className="mt-3.5 flex items-center gap-4 border-t border-nx-line pt-2.5">
                    {product.stats.map((stat, sIdx) => (
                      <div key={sIdx}>
                        <b className="block font-mono text-xs font-bold text-nx-ink">
                          {stat.value}
                        </b>
                        <span className="block text-[10px] text-nx-ink-3">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(() => {
                  const canonicalHref = product.id === "venue" ? "/venue" : product.href;
                  const isPermitted = canAccessPage(canonicalHref);

                  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!isActive || !isPermitted) {
                      e.preventDefault();
                      return;
                    }
                    if (product.id === "venue") {
                      e.preventDefault();
                      startRoutingProgress();
                      void setActiveWorkspace("venue", true);
                      return;
                    }
                    if (product.id === "academy") {
                      e.preventDefault();
                      startRoutingProgress();
                      void setActiveWorkspace("academy", true);
                      return;
                    }
                  };

                  const className = `mt-4 h-8 w-full text-xs font-semibold ${
                    isActive && isPermitted
                      ? "border-nx-line hover:border-nx-line-hi hover:bg-nx-raised"
                      : "text-nx-ink-3 opacity-60 cursor-not-allowed"
                  }`;

                  if (!isActive || !isPermitted) {
                    return (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled
                        className={className}
                      >
                        {product.buttonLabel}
                      </Button>
                    );
                  }

                  return (
                    <Button asChild variant="outline" size="sm" className={className}>
                      <Link href={canonicalHref} onClick={handleClick}>
                        {product.buttonLabel}
                      </Link>
                    </Button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
