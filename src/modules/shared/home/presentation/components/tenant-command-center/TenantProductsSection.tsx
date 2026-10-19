"use client";

import React from "react";
import { Layers, ChevronRight, Building, GraduationCap, Trophy } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
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

  return (
    <Card className="p-4 sm:p-5 min-w-0 overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi">
      {/* Section Header */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
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
            <h3 className="text-sm font-semibold text-nx-ink truncate">
              {t("tenantCommandCenter.products.title") || "Your SCRIPE Products"}
            </h3>
            <p className="text-xs text-nx-ink-3 truncate">
              {t("tenantCommandCenter.products.subtitle") ||
                "Manage and access the operational products enabled for your organization."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs font-semibold text-nx-accent hover:underline shrink-0"
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
              className="group relative flex flex-col justify-between overflow-hidden rounded-nx-md border border-nx-line bg-nx-surface transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-raised/40"
            >
              {/* Card Visual Header matching Nexus Workspace & App Launcher Cards */}
              <div className="relative flex items-center justify-between border-b border-nx-line bg-nx-raised/30 px-4 py-3.5">
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
                  <h4 className="text-sm font-semibold text-nx-ink group-hover:text-nx-accent transition-colors">
                    {product.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-nx-ink-3 min-h-[32px]">
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

                <Button
                  asChild
                  variant={isActive ? "outline" : "secondary"}
                  size="sm"
                  className={`mt-4 h-8 w-full text-xs font-semibold ${
                    isActive
                      ? "border-nx-line hover:border-nx-line-hi hover:bg-nx-raised"
                      : "text-nx-ink-3"
                  }`}
                >
                  <Link href={product.href}>{product.buttonLabel}</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
