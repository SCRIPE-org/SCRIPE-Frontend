"use client";

import React from "react";
import { Layers, ChevronRight, Shield, GraduationCap, Trophy } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { TenantProductItem } from "./tenantTypes";

interface TenantProductsSectionProps {
  products: TenantProductItem[];
}

export function TenantProductsSection({ products }: TenantProductsSectionProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs border-border bg-card p-4">
      {/* Section Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.products.title") || "Your SCRIPE Products"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.products.subtitle") ||
                "Manage and access the products enabled for your organization."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>{t("tenantCommandCenter.products.manageProducts") || "Manage Products"}</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 3 Product Cards Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {products.map((product) => {
          const isActive = product.status === "active";

          return (
            <div
              key={product.id}
              className="shadow-xs flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/60 transition-colors hover:border-border/90"
            >
              {/* Card Visual Header with SVG Stadium illustration */}
              <div className="relative h-28 overflow-hidden bg-[#0b1822]">
                {product.id === "venue" && (
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 420 140"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="pVenue" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#0a3341" />
                        <stop offset="1" stopColor="#173b26" />
                      </linearGradient>
                    </defs>
                    <rect width="420" height="140" fill="url(#pVenue)" />
                    <g stroke="#8ee6d1" opacity=".35" fill="none">
                      <rect x="40" y="22" width="330" height="96" rx="3" />
                      <line x1="205" y1="22" x2="205" y2="118" />
                      <rect x="40" y="45" width="58" height="50" />
                      <rect x="312" y="45" width="58" height="50" />
                    </g>
                    <g fill="#e8fff3" opacity=".25">
                      <circle cx="70" cy="84" r="4" />
                      <circle cx="335" cy="66" r="4" />
                      <circle cx="220" cy="48" r="4" />
                    </g>
                  </svg>
                )}

                {product.id === "academy" && (
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 420 140"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="pAcad" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#0b2e37" />
                        <stop offset="1" stopColor="#142338" />
                      </linearGradient>
                    </defs>
                    <rect width="420" height="140" fill="url(#pAcad)" />
                    <rect x="0" y="96" width="420" height="44" fill="#143b28" />
                    <g fill="#dbe6ed">
                      <circle cx="80" cy="68" r="8" />
                      <circle cx="150" cy="58" r="8" />
                      <circle cx="220" cy="66" r="8" />
                      <circle cx="290" cy="52" r="8" />
                    </g>
                    <g stroke="#8cb7d0" strokeWidth="5">
                      <path d="M80 76v28M150 66v38M220 74v30M290 60v44" />
                    </g>
                    <g stroke="#e7efe9" opacity=".3">
                      <path d="M20 112h380M80 96v44M180 96v44M280 96v44" />
                    </g>
                  </svg>
                )}

                {product.id === "football-intelligence" && (
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 420 140"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <rect width="420" height="140" fill="#111820" />
                    <rect y="82" width="420" height="58" fill="#1c2a24" />
                    <g stroke="#70808a" opacity=".22">
                      <path d="M0 44h420M20 24l80 60M120 20l80 60M220 18l80 60M320 16l80 60" />
                    </g>
                    <path d="M160 110l34-52 34 52z" fill="#253038" opacity=".7" />
                  </svg>
                )}

                {/* Status Badge */}
                <div className="absolute right-2.5 top-2.5">
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`px-2 py-0.5 text-[9px] font-bold ${
                      isActive
                        ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                        : "bg-muted/70 text-muted-foreground"
                    }`}
                  >
                    {isActive
                      ? t("tenantCommandCenter.products.active")
                      : t("tenantCommandCenter.products.notActivated")}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    {product.id === "venue" && <Shield className="h-3.5 w-3.5 text-primary" />}
                    {product.id === "academy" && (
                      <GraduationCap className="h-3.5 w-3.5 text-sky-400" />
                    )}
                    {product.id === "football-intelligence" && (
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span>{product.name}</span>
                  </div>
                  <p className="mt-1 min-h-[30px] text-[10px] leading-normal text-muted-foreground">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center gap-4 border-t border-border/60 pt-2.5">
                    {product.stats.map((stat, sIdx) => (
                      <div key={sIdx}>
                        <b className="block font-mono text-xs font-bold text-foreground">
                          {stat.value}
                        </b>
                        <span className="block text-[9px] text-muted-foreground">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  asChild
                  variant={isActive ? "outline" : "secondary"}
                  size="sm"
                  className={`mt-3 h-8 w-full text-[11px] font-semibold ${
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                      : ""
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
